'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function InputField({ label, value, onChange, suffix }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />
        {suffix && <span className="text-xs text-gray-400 w-5">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultBadge({ label, value, unit }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs text-gray-400">{label}:</span>
      <span className="text-sm font-semibold tabular-nums">
        {value ?? '-'}{unit}
      </span>
    </div>
  );
}

export default function QuantitativeForm() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [form, setForm] = useState({
    rev5: '', revCur: '',
    eps5: '', epsCur: '',
    ocf: '',
    ca: '', cl: '',
    tl: '', te: '',
    dps: '', price: '',
  });
  const [valuation, setValuation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const revCagr = form.rev5 && form.revCur
    ? ((Number(form.revCur) / Number(form.rev5)) ** (1 / 5) - 1) * 100
    : null;

  const epsCagr = form.eps5 && form.epsCur
    ? ((Number(form.epsCur) / Number(form.eps5)) ** (1 / 5) - 1) * 100
    : null;

  const curRatio = form.ca && form.cl && Number(form.cl) > 0
    ? Number(form.ca) / Number(form.cl)
    : null;

  const deRatio = form.tl && form.te && Number(form.te) > 0
    ? Number(form.tl) / Number(form.te)
    : null;

  const divYield = form.dps && form.price && Number(form.price) > 0
    ? (Number(form.dps) / Number(form.price)) * 100
    : null;

  const fmt = (v, d = 2) => v !== null ? Number(v).toFixed(d) : '-';
  const pct = (v) => v !== null ? `${Number(v).toFixed(2)}%` : '-';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!company.trim()) return;
    setSaving(true);

    const data = {
      Date: new Date().toISOString().split('T')[0],
      Company: company.trim(),
      'Revenue 5yr Ago': form.rev5,
      'Revenue Current': form.revCur,
      'Revenue CAGR': revCagr !== null ? Number(revCagr.toFixed(2)) : '',
      'EPS 5yr Ago': form.eps5,
      'EPS Current': form.epsCur,
      'EPS CAGR': epsCagr !== null ? Number(epsCagr.toFixed(2)) : '',
      'OCF Years': form.ocf,
      'Current Assets': form.ca,
      'Current Liabilities': form.cl,
      'Current Ratio': curRatio !== null ? Number(curRatio.toFixed(2)) : '',
      'Total Liabilities': form.tl,
      'Total Equity': form.te,
      'D/E Ratio': deRatio !== null ? Number(deRatio.toFixed(2)) : '',
      'DPS': form.dps,
      'Share Price': form.price,
      'Dividend Yield': divYield !== null ? Number(divYield.toFixed(2)) : '',
      'Valuation Score': valuation,
      'Notes': notes,
    };

    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab: 'quantitative', data }),
    });

    const result = await res.json();
    setSaving(false);

    if (result.success) {
      setDone(true);
      setTimeout(() => {
        setCompany('');
        setForm({ rev5: '', revCur: '', eps5: '', epsCur: '', ocf: '', ca: '', cl: '', tl: '', te: '', dps: '', price: '' });
        setValuation('');
        setNotes('');
        setDone(false);
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Company</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. TM, MAYBANK"
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          required
        />
      </div>

      {/* Step 1-2: Revenue & EPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800">Step 1: Revenue Growth</h3>
          <InputField label="Past 5th Year Revenue (RM m)" value={form.rev5} onChange={(v) => set('rev5', v)} />
          <InputField label="Current Year Revenue (RM m)" value={form.revCur} onChange={(v) => set('revCur', v)} />
          <ResultBadge label="Revenue CAGR" value={fmt(revCagr)} unit="%" />
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800">Step 2: EPS Growth</h3>
          <InputField label="Past 5th Year EPS" value={form.eps5} onChange={(v) => set('eps5', v)} />
          <InputField label="Current Year EPS" value={form.epsCur} onChange={(v) => set('epsCur', v)} />
          <ResultBadge label="EPS CAGR" value={fmt(epsCagr)} unit="%" />
        </div>
      </div>

      {/* Step 3-5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 3: OCF</h3>
          <InputField label="Years of Positive OCF" value={form.ocf} onChange={(v) => set('ocf', v)} />
        </div>

        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 4: Liquidity</h3>
          <div className="space-y-2">
            <InputField label="Current Assets" value={form.ca} onChange={(v) => set('ca', v)} />
            <InputField label="Current Liabilities" value={form.cl} onChange={(v) => set('cl', v)} />
            <ResultBadge label="Current Ratio" value={fmt(curRatio)} />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 5: Debt</h3>
          <div className="space-y-2">
            <InputField label="Total Liabilities" value={form.tl} onChange={(v) => set('tl', v)} />
            <InputField label="Total Equities" value={form.te} onChange={(v) => set('te', v)} />
            <ResultBadge label="D/E Ratio" value={fmt(deRatio)} />
          </div>
        </div>
      </div>

      {/* Step 6-7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 6: Dividend</h3>
          <div className="space-y-2">
            <InputField label="Dividend Per Share (DPS)" value={form.dps} onChange={(v) => set('dps', v)} />
            <InputField label="Current Share Price" value={form.price} onChange={(v) => set('price', v)} />
            <ResultBadge label="Dividend Yield" value={fmt(divYield)} unit="%" />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 7: Valuation</h3>
          <InputField label="Valuation Score (1-5)" value={valuation} onChange={setValuation} />
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 resize-none"
              placeholder="P/E ratio, PEG, EV/EBITDA, comparable..."
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!company.trim() || saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : done ? '✓ Saved!' : 'Save to Sheet'}
        </button>
      </div>
    </form>
  );
}
