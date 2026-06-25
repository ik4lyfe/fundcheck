'use client';

import { useEffect, useState } from 'react';

const CANDLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  l: 4 + (i * 9.5 + i * i * 0.4) % 90,
  t: 18 + (i * 8.5) % 55,
  h: 22 + Math.sin(i * 0.8) * 10,
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

const DARK = { cu: '#22d3ee', cd: '#c084fc', nc: '#94a3b8', w1: '#22d3ee', w2: '#c084fc' };
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
  const o = dark ? 0.2 : 0.14;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.08) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Wave */}
      <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 h-28 animate-wave"
        style={{ opacity: dark ? 0.12 : 0.07 }} />

      {/* Candles */}
      {CANDLES.map((c) => (
        <div key={c.id} className="absolute" style={{
          left: `${c.l}%`, top: `${c.t}%`, opacity: o,
          animation: `kf${c.id} ${8 + c.d % 5}s ease-in-out ${c.d * 0.5}s infinite`,
        }}>
          <div className="mx-auto" style={{ width: 1, height: 10 + c.h * 0.3, background: c.up ? t.cu : t.cd }} />
          <div style={{ width: c.w, height: c.h, background: c.up ? t.cu : t.cd, borderRadius: 1 }} />
          <div className="mx-auto" style={{ width: 1, height: 8 + c.h * 0.25, background: c.up ? t.cu : t.cd }} />
        </div>
      ))}

      {/* Numbers */}
      {NUMS.map((n) => (
        <div key={n.id} className="absolute font-mono" style={{
          left: `${n.l}%`, top: `${n.t}%`, fontSize: 11, color: t.nc, opacity: o * 0.6,
          animation: `kp${n.id} ${12 + n.d % 4}s ease-in-out ${n.d * 0.7}s infinite`,
        }}>{n.v}</div>
      ))}

      <style>{`
        ${CANDLES.map((c) => `@keyframes kf${c.id} {
          0%,100%{transform:translateY(0) scaleY(1)}
          50%{transform:translateY(-28px) scaleY(1.07)}
        }`).join('\n')}
        ${NUMS.map((n) => `@keyframes kp${n.id} {
          0%,100%{opacity:${o * 0.35}}50%{opacity:${o}}
        }`).join('\n')}
        @keyframes wm{0%,100%{background-position:0 0}50%{background-position:-80px 0}}
        .animate-wave {
          background: linear-gradient(90deg,transparent 0%,${t.w1}50 30%,${t.w2}40 60%,transparent 100%);
          border-radius: 50%;
          filter: blur(25px);
          animation: wm 5s ease-in-out infinite;
        }
        @media(prefers-reduced-motion:reduce){
          div[style*="animation"]{animation:none!important}
          .animate-wave{animation:none!important}
        }
      `}</style>
    </div>
  );
}
