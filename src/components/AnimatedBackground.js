'use client';

import { useEffect, useState } from 'react';

const CANDLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  l: 4 + (i * 9.5 + i * i * 0.4) % 90,
  t: 18 + (i * 8.5) % 55,
  h: 24 + Math.sin(i * 0.8) * 12,
  w: 3 + (i % 2) * 2,
  d: i,
  up: Math.sin(i * 2.1) > 0,
}));

const NUMS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 100,
  l: 6 + (i * 11 + i * i * 0.5) % 88,
  t: 12 + (i * 13) % 70,
  v: (Math.random() * 5000 + 10).toFixed(1),
  d: i,
}));

const DARK = { cu: '#22d3ee', cd: '#c084fc', nc: '#64748b', w1: '#22d3ee', w2: '#c084fc' };
const LIGHT = { cu: '#94a3b8', cd: '#60a5fa', nc: '#cbd5e1', w1: '#94a3b8', w2: '#60a5fa' };

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

  const t = dark ? DARK : LIGHT;
  const o = dark ? 0.25 : 0.18;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Candles */}
      {CANDLES.map((c) => (
        <div key={c.id} className="absolute" style={{
          left: `${c.l}%`, top: `${c.t}%`, opacity: o, willChange: 'transform',
          animation: `cf${c.id} ${6 + c.d % 4}s ease-in-out ${c.d * 0.4}s infinite`,
        }}>
          <div className="mx-auto" style={{ width: 1.5, height: 10 + c.h * 0.3, background: c.up ? t.cu : t.cd }} />
          <div style={{ width: c.w, height: c.h, background: c.up ? t.cu : t.cd, borderRadius: 1 }} />
          <div className="mx-auto" style={{ width: 1.5, height: 8 + c.h * 0.25, background: c.up ? t.cu : t.cd }} />
        </div>
      ))}

      {/* Numbers */}
      {NUMS.map((n) => (
        <div key={n.id} className="absolute font-mono" style={{
          left: `${n.l}%`, top: `${n.t}%`, fontSize: 11, color: t.nc, opacity: o * 0.7,
          animation: `np${n.id} ${10 + n.d % 3}s ease-in-out ${n.d * 0.5}s infinite`,
        }}>{n.v}</div>
      ))}

      <style>{`
        ${CANDLES.map((c) => `@keyframes cf${c.id} {
          0%,100%{transform:translateY(0px)}
          40%{transform:translateY(-32px)}
          60%{transform:translateY(-28px)}
        }`).join('\n')}
        ${NUMS.map((n) => `@keyframes np${n.id} {
          0%,100%{opacity:${o * 0.3}}45%{opacity:${o * 0.8}}
        }`).join('\n')}
      `}</style>
    </div>
  );
}
