'use client';
import { useEffect, useState } from 'react';

// Real candlestick chart — spanning 1% → 99%, 100 candles
// Multiple patterns embedded: Morning Star, Engulfing, Three Soldiers, Hammer, etc.
// Candle format: { x: left%, o: open, c: close, h: high, l: low }
// Price range: 0-100 (mapped to SVG 5-35)

function pat(series) {
  // series: array of { o, c, h, l } — map x position
  const step = 98 / (series.length - 1);
  return series.map((s, i) => ({
    ...s,
    x: 1 + step * i,
  }));
}

// Full chart — price flows naturally across the screen
const CANDLES = pat([
  // Sector 1: Downtrend → Morning Star reversal
  { o:72,c:65,h:75,l:62 },
  { o:65,c:58,h:67,l:55 },
  { o:58,c:50,h:60,l:48 },  // bearish
  { o:50,c:48,h:53,l:46 },  // small bearish
  { o:48,c:54,h:56,l:42 },  // BULLISH ENGULFING (engulfs prev)
  { o:54,c:63,h:65,l:52 },  // confirmation

  // Sector 2: Pullback → Hammer
  { o:63,c:58,h:65,l:55 },
  { o:58,c:52,h:60,l:48 },
  { o:52,c:46,h:54,l:42 },
  { o:46,c:52,h:53,l:35 },  // HAMMER — long lower wick
  { o:52,c:60,h:62,l:50 },

  // Sector 3: Three White Soldiers
  { o:60,c:70,h:72,l:58 },  // soldier 1
  { o:70,c:78,h:80,l:68 },  // soldier 2
  { o:78,c:86,h:88,l:76 },  // soldier 3

  // Sector 4: Doji indecision → small selloff
  { o:86,c:85,h:88,l:84 },  // DOJI
  { o:85,c:82,h:87,l:80 },
  { o:82,c:76,h:84,l:74 },
  { o:76,c:70,h:78,l:68 },

  // Sector 5: Inverted Hammer → rally
  { o:70,c:68,h:72,l:65 },
  { o:68,c:66,h:72,l:64 },
  { o:66,c:72,h:80,l:64 },  // INVERTED HAMMER (long upper wick)
  { o:72,c:80,h:83,l:70 },  // confirmation

  // Sector 6: Rising Three Methods
  { o:80,c:88,h:90,l:78 },  // tall green
  { o:88,c:84,h:90,l:82 },  // small red
  { o:84,c:80,h:86,l:78 },
  { o:80,c:76,h:82,l:74 },  // small red
  { o:76,c:86,h:89,l:74 },  // tall green breakout

  // Sector 7: Bearish Engulfing
  { o:86,c:90,h:92,l:84 },  // small green
  { o:90,c:78,h:92,l:74 },  // BEARISH ENGULFING — big red
  { o:78,c:72,h:80,l:68 },  // confirmation

  // Sector 8: Tweezer Top
  { o:72,c:68,h:74,l:66 },
  { o:68,c:65,h:70,l:62 },
  { o:65,c:60,h:67,l:58 },
  { o:60,c:56,h:62,l:53 },

  // Sector 9: Morning Star reversal at bottom
  { o:56,c:50,h:58,l:48 },
  { o:50,c:46,h:52,l:44 },
  { o:46,c:40,h:48,l:36 },  // bearish
  { o:40,c:38,h:42,l:34 },
  { o:38,c:36,h:40,l:30 },  // big drop
  { o:36,c:38,h:40,l:28 },  // DOJI at low
  { o:38,c:50,h:54,l:36 },  // MORNING STAR — strong green

  // Sector 10: Recovery
  { o:50,c:55,h:57,l:48 },
  { o:55,c:52,h:58,l:49 },
  { o:52,c:58,h:61,l:50 },
  { o:58,c:62,h:64,l:56 },
  { o:62,c:70,h:73,l:60 },
  { o:70,c:75,h:78,l:68 },

  // Sector 11: Bullish Harami
  { o:75,c:68,h:77,l:65 },  // tall red
  { o:68,c:72,h:73,l:66 },  // green inside prev body (HARAMI)

  // Sector 12: Continuation → Shooting Star
  { o:72,c:78,h:80,l:70 },
  { o:78,c:76,h:80,l:74 },
  { o:76,c:75,h:79,l:73 },
  { o:75,c:74,h:79,l:72 },

  // Sector 13: Final push
  { o:74,c:80,h:82,l:72 },
  { o:80,c:86,h:88,l:78 },
  { o:86,c:82,h:89,l:80 },
  { o:82,c:90,h:92,l:81 },
  { o:90,c:95,h:97,l:88 },
  { o:95,c:92,h:97,l:91 },
  { o:92,c:88,h:94,l:86 },
  { o:88,c:85,h:90,l:83 },
  { o:85,c:90,h:92,l:83 },
  { o:90,c:88,h:92,l:86 },
  { o:88,c:86,h:90,l:84 },
  { o:86,c:92,h:94,l:84 },
]);

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!mounted) return null;

  const upColor    = dark ? '#22c55e' : '#16a34a';
  const downColor  = dark ? '#ef4444' : '#dc2626';
  const gridColor  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const labelColor = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const opacity    = dark ? 0.35 : 0.25;

  // Map price (0-100) to SVG y (35→5)
  const py = (v) => 35 - (v / 100) * 30;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ opacity }}
      >
        <defs>
          <pattern id={`g-${dark ? 'd' : 'l'}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke={gridColor} strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="40" fill={`url(#g-${dark ? 'd' : 'l'})`} />

        {CANDLES.map((c, i) => {
          const isUp = c.c >= c.o;
          const bodyH  = Math.abs(c.c - c.o);
          const wickH  = Math.abs(c.h - c.l);
          const bodyTop = py(Math.max(c.o, c.c));
          const bodyHeight = (bodyH / 100) * 30;
          const highY = py(c.h);
          const lowY  = py(c.l);
          const openY = py(c.o);
          const hasWick = wickH > bodyH + 1;
          const hasBody = bodyH > 0.8;
          const bw = 1.2;

          return (
            <g key={i}>
              {hasWick && (
                <line
                  x1={c.x} y1={highY} x2={c.x} y2={lowY}
                  stroke={isUp ? upColor : downColor}
                  strokeWidth="0.4"
                  strokeLinecap="round"
                />
              )}
              {hasBody ? (
                <rect
                  x={c.x - bw / 2}
                  y={bodyTop}
                  width={bw}
                  height={Math.max(bodyHeight, 0.3)}
                  fill={isUp ? upColor : downColor}
                  rx="0.15"
                />
              ) : (
                <line
                  x1={c.x - 0.4} y1={openY}
                  x2={c.x + 0.4} y2={openY}
                  stroke={isUp ? upColor : downColor}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}

        {/* Price labels */}
        {[
          { v: '5,844', x: 8,  y: 12 },
          { v: '4,303', x: 28, y: 24 },
          { v: '5,120', x: 45, y: 18 },
          { v: '7,704', x: 60, y: 8  },
          { v: '8,653', x: 78, y: 11 },
          { v: '3,218', x: 40, y: 30 },
          { v: '9,200', x: 88, y: 6  },
        ].map((n, i) => (
          <text
            key={`l-${i}`}
            x={n.x} y={n.y}
            fill={labelColor}
            fontSize="1.1"
            fontFamily="monospace"
            fontWeight="600"
          >
            {n.v}
          </text>
        ))}
      </svg>
    </div>
  );
}
