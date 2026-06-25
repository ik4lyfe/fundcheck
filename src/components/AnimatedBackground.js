'use client';

import { useEffect, useState } from 'react';

// Generate random candlestick data with consistent positions (deterministic)
const CANDLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: 3 + (i * 5.2) % 94,
  top: 20 + (i * 7.3 + Math.sin(i * 1.2) * 12) % 60,
  height: 18 + Math.sin(i * 0.9) * 10,
  width: 4 + Math.abs(Math.sin(i * 1.5)) * 3,
  delay: i * 0.4,
  duration: 14 + (i % 5) * 3,
  wickTop: 5 + Math.abs(Math.sin(i * 0.7)) * 8,
  wickBottom: 5 + Math.abs(Math.cos(i * 0.8)) * 8,
}));

const NUMBERS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 100,
  left: 5 + (i * 9.3 + i * i * 0.7) % 90,
  top: 10 + (i * 11.7) % 75,
  value: (Math.random() * 10000).toFixed(1),
  delay: i * 0.8,
  size: 10 + (i % 3) * 2,
}));

// Theme-aware colours
const DARK = { candleUp: '#22d3ee', candleDn: '#c084fc', num: '#94a3b8', wave1: '#22d3ee', wave2: '#c084fc' };
const LIGHT = { candleUp: '#94a3b8', candleDn: '#60a5fa', num: '#cbd5e1', wave1: '#94a3b8', wave2: '#60a5fa' };

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));

    // Watch for theme changes (triggered by NavBar toggle)
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!mounted) return null;

  const c = dark ? DARK : LIGHT;
  const candleColors = CANDLES.map((_, i) => (Math.sin(i * 2.1) > 0 ? c.candleUp : c.candleDn));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full"
        style={{ opacity: dark ? 0.04 : 0.025 }}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="agrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#agrid)" />
      </svg>

      {/* Wave line */}
      <svg className="absolute inset-x-0 top-1/3 -translate-y-1/2 w-full h-32"
        style={{ opacity: dark ? 0.08 : 0.05 }}
        viewBox="0 0 1200 128" preserveAspectRatio="none">
        <defs>
          <linearGradient id="agrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c.wave1} stopOpacity="0" />
            <stop offset="30%" stopColor={c.wave1} stopOpacity={dark ? 0.6 : 0.3} />
            <stop offset="60%" stopColor={c.wave2} stopOpacity={dark ? 0.4 : 0.2} />
            <stop offset="100%" stopColor={c.wave2} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,64 C200,20 400,108 600,64 C800,20 1000,108 1200,64 L1200,128 L0,128 Z"
          fill="url(#agrad)" className="animate-wave" />
      </svg>

      {/* Candles */}
      {CANDLES.map((candle, i) => (
        <div
          key={candle.id}
          className="absolute"
          style={{
            left: `${candle.left}%`,
            top: `${candle.top}%`,
            opacity: dark ? 0.12 : 0.08,
            animation: `candleFloat ${candle.duration}s ease-in-out ${candle.delay}s infinite`,
          }}
        >
          <div className="mx-auto" style={{ width: 1, height: candle.wickTop, backgroundColor: candleColors[i] }} />
          <div style={{ width: candle.width, height: candle.height, backgroundColor: candleColors[i], borderRadius: 1 }} />
          <div className="mx-auto" style={{ width: 1, height: candle.wickBottom, backgroundColor: candleColors[i] }} />
        </div>
      ))}

      {/* Numbers */}
      {NUMBERS.map((n) => (
        <div
          key={n.id}
          className="absolute font-mono"
          style={{
            left: `${n.left}%`,
            top: `${n.top}%`,
            fontSize: n.size,
            color: c.num,
            opacity: dark ? 0.06 : 0.04,
            animation: `numPulse ${20 + n.delay}s ease-in-out ${n.delay}s infinite`,
          }}
        >
          {n.value}
        </div>
      ))}

      <style>{`
        @keyframes candleFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-16px) scale(1.04); }
        }
        @keyframes numPulse {
          0%, 100% { opacity: 0.03; }
          25% { opacity: 0.08; }
          50% { opacity: 0.04; }
          75% { opacity: 0.06; }
        }
        @keyframes wavemo {
          0% { transform: translateX(0); }
          50% { transform: translateX(-60px); }
          100% { transform: translateX(0); }
        }
        .animate-wave { animation: wavemo 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-wave, div[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
