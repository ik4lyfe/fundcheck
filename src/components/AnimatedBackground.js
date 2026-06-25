'use client';

import { useEffect, useState } from 'react';

// Candlestick pattern: bullish engulfing + supporting candles
const PATTERNS = [
  // Bullish Engulfing — focal point, centre-left
  ...(() => {
    const p = [];
    // Small red candle (engulfed)
    p.push({ id: 0, l: 18, t: 38, h: 14, w: 3, up: false, d: 0 });
    // Tall green candle that engulfs it
    p.push({ id: 1, l: 23, t: 30, h: 28, w: 4, up: true, d: 0.3 });
    // Confirmation green
    p.push({ id: 2, l: 28, t: 32, h: 22, w: 3, up: true, d: 0.6 });
    return p;
  })(),
  // Supporting candles scattered around
  { id: 3, l: 8,  t: 45, h: 16, w: 3, up: true,  d: 1.0 },
  { id: 4, l: 40, t: 25, h: 20, w: 3, up: false, d: 1.3 },
  { id: 5, l: 50, t: 50, h: 18, w: 3, up: true,  d: 1.6 },
  { id: 6, l: 60, t: 35, h: 24, w: 3, up: false, d: 2.0 },
  { id: 7, l: 72, t: 42, h: 15, w: 3, up: true,  d: 2.3 },
  { id: 8, l: 82, t: 28, h: 22, w: 3, up: false, d: 2.6 },
  { id: 9, l: 90, t: 55, h: 14, w: 3, up: true,  d: 3.0 },
  // Extra fade-level candles on edges
  { id: 10, l: 5,  t: 60, h: 12, w: 2, up: false, d: 3.5 },
  { id: 11, l: 95, t: 20, h: 18, w: 2, up: true,  d: 4.0 },
];

const NUMS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 50, l: 5 + i * 16, t: 20 + (i % 3) * 18,
  v: String(Math.floor(Math.random() * 9000 + 100)),
  d: i,
}));

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!mounted) return null;

  const o = dark ? 0.35 : 0.25;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Candles */}
      {PATTERNS.map((c) => {
        const green = c.up ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626');
        return (
          <div key={c.id} className="absolute" style={{
            left: `${c.l}%`, top: `${c.t}%`, opacity: o, willChange: 'transform',
            animation: `fl${c.d} ${5 + (c.d % 3)}s ease-in-out ${c.d * 0.3}s infinite`,
          }}>
            <div className="mx-auto" style={{ width: 1.5, height: 10 + c.h * 0.3, background: green }} />
            <div style={{ width: c.w, height: c.h, background: green, borderRadius: 1 }} />
            <div className="mx-auto" style={{ width: 1.5, height: 8 + c.h * 0.25, background: green }} />
          </div>
        );
      })}

      {/* Numbers */}
      {NUMS.map((n) => (
        <div key={n.id} className="absolute font-mono" style={{
          left: `${n.l}%`, top: `${n.t}%`, fontSize: 10, color: dark ? '#64748b' : '#94a3b8', opacity: o * 0.5,
          animation: `np${n.id} ${10 + n.d % 3}s ease-in-out ${n.d * 0.5}s infinite`,
        }}>{n.v}</div>
      ))}

      <style>{`
        ${PATTERNS.map((c) => `@keyframes fl${c.d} {
          0%,100%{transform:translateY(0)}
          40%{transform:translateY(-24px)}
        }`).join('\n')}
        ${NUMS.map((n) => `@keyframes np${n.id} {
          0%,100%{opacity:${o * 0.25}}45%{opacity:${o * 0.6}}
        }`).join('\n')}
      `}</style>
    </div>
  );
}
