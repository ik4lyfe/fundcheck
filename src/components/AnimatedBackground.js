'use client';
import { useEffect, useState } from 'react';

// Continuous candlestick data — looks like a real TradingView chart
// Each candle: { l: left%, o: open, c: close, h: high, lo: low } (mapped to 0-40 range)
// Types:
//   c > o — bullish (green body)
//   c < o — bearish (red body)
//   |c-o| < 0.5 — doji (no body, just horizontal dash)
//   |h - lo| ≈ |c-o| — marubozu (no wick)
const CHART_CANDLES = (() => {
  // Generate 50 candles spanning 1% to 99% left
  const candles = [];
  let price = 22;
  for (let i = 0; i < 50; i++) {
    const x = 1 + (98 / 49) * i;
    const change = (Math.random() - 0.46) * 6; // slight upward bias
    const newPrice = Math.max(8, Math.min(36, price + change));
    const volatility = Math.random() * 3 + 0.5;
    const high = Math.min(39, Math.max(newPrice, price) + Math.random() * volatility);
    const low = Math.max(8, Math.min(newPrice, price) - Math.random() * volatility);
    const isDoji = Math.abs(newPrice - price) < 0.3;
    const o = price;
    const c = newPrice;
    candles.push({ l: x, o, c, h: high, lo: low });
    price = newPrice;
  }
  return candles;
})();

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
  const gridColor  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const labelColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const opacity    = dark ? 0.35 : 0.25;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ opacity }}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id={`g-${dark ? 'd' : 'l'}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke={gridColor} strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="40" fill={`url(#g-${dark ? 'd' : 'l'})`} />

        {/* Candlesticks */}
        {CHART_CANDLES.map((c, i) => {
          const isUp = c.c >= c.o;
          const bodyH = Math.abs(c.c - c.o);
          const wickH = Math.abs(c.h - c.lo);
          const bw = 1.1; // bar width — snug, nearly touching
          const bodyTop = 40 - Math.max(c.o, c.c);
          const bodyHeight = bodyH;
          const highY = 40 - c.h;
          const lowY = 40 - c.lo;
          const openY = 40 - c.o;
          const hasWick = wickH > bodyH + 0.3;
          const hasBody = bodyH > 0.2;

          return (
            <g key={i}>
              {/* Wick */}
              {hasWick && (
                <line
                  x1={c.l} y1={highY} x2={c.l} y2={lowY}
                  stroke={isUp ? upColor : downColor}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
              )}
              {/* Body or Doji */}
              {hasBody ? (
                <rect
                  x={c.l - bw / 2}
                  y={bodyTop}
                  width={bw}
                  height={bodyHeight}
                  fill={isUp ? upColor : downColor}
                  rx="0.15"
                />
              ) : (
                <line
                  x1={c.l - 0.5} y1={openY} x2={c.l + 0.5} y2={openY}
                  stroke={isUp ? upColor : downColor}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}

        {/* Floating price labels */}
        {[5844, 5120, 4303, 7704, 8653, 2073, 6500].map((v, i) => (
          <text
            key={`n-${i}`}
            x={5 + i * 14}
            y={20 + (i % 2) * 12}
            fill={labelColor}
            fontSize="1.2"
            fontFamily="monospace"
            fontWeight="600"
            opacity="0.5"
          >
            {v.toLocaleString()}
          </text>
        ))}
      </svg>
    </div>
  );
}
