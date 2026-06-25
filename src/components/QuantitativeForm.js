'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import AutoFillButton from './AutoFillButton';

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

// Color helpers based on Bursa Malaysia market benchmarks
function colorClass(value, thresholds) {
  if (value === null || value === undefined || value === '') return 'text-gray-400';
  if (thresholds.green(value)) return 'text-green-600 font-semibold';
  if (thresholds.amber(value)) return 'text-amber-600 font-semibold';
  return 'text-red-600 font-semibold';
}

// Explicit map for TW v4 static detection
/* tw: text-gray-400 text-green-600 text-amber-600 text-red-600 font-semibold */

const benchmarks = {
  revCagr: {
    label: 'Revenue CAGR',
    thresholds: {
      green: (v) => v > 10,
      amber: (v) => v > 5,
    },
    format: (v) => v !== null ? `${Number(v).toFixed(2)}%` : '-',
    tip: '>10% = Strong  |  5-10% = Moderate  |  <5% = Weak',
  },
  epsCagr: {
    label: 'EPS CAGR',
    thresholds: {
      green: (v) => v > 10,
      amber: (v) => v > 5,
    },
    format: (v) => v !== null ? `${Number(v).toFixed(2)}%` : '-',
    tip: '>10% = Strong  |  5-10% = Moderate  |  <5% = Weak',
  },
  ocf: {
    label: 'Positive OCF',
    thresholds: {
      green: (v) => v >= 8,
      amber: (v) => v >= 5,
    },
    format: (v) => v !== null ? `${v} yrs` : '-',
    tip: '8-10 yrs = Strong  |  5-7 yrs = Moderate  |  <5 = Weak',
  },
  curRatio: {
    label: 'Current Ratio',
    thresholds: {
      green: (v) => v >= 1.5 && v <= 3.0,
      amber: (v) => v >= 1.0,
    },
    format: (v) => v !== null ? Number(v).toFixed(2) : '-',
    tip: '1.5-3.0 = Healthy  |  1.0-1.5 = Caution  |  <1.0 = Distressed',
  },
  deRatio: {
    label: 'D/E Ratio',
    thresholds: {
      green: (v) => v < 0.5,
      amber: (v) => v < 1.0,
    },
    format: (v) => v !== null ? Number(v).toFixed(2) : '-',
    tip: '<0.5 = Low Debt  |  0.5-1.0 = Moderate  |  >1.0 = High Debt',
  },
  divYield: {
    label: 'Dividend Yield',
    thresholds: {
      green: (v) => v > 3,
      amber: (v) => v > 1,
    },
    format: (v) => v !== null ? `${Number(v).toFixed(2)}%` : '-',
    tip: '>3% = High Yield  |  1-3% = Moderate  |  <1% = Low',
  },
  peRatio: {
    label: 'P/E Ratio',
    thresholds: {
      green: (v) => v > 0 && v < 10,
      amber: (v) => v < 20,
    },
    format: (v) => v !== null ? `${Number(v).toFixed(1)}x` : '-',
    tip: '<10x = Undervalued  |  10-20x = Fair  |  >20x = Expensive',
  },
  roe: {
    label: 'ROE',
    thresholds: {
      green: (v) => v > 15,
      amber: (v) => v > 10,
    },
    format: (v) => v !== null ? `${Number(v).toFixed(1)}%` : '-',
    tip: '>15% = Excellent  |  10-15% = Good  |  <10% = Weak',
  },
  netMargin: {
    label: 'Net Margin',
    thresholds: {
      green: (v) => v > 20,
      amber: (v) => v > 10,
    },
    format: (v) => v !== null ? `${Number(v).toFixed(1)}%` : '-',
    tip: '>20% = Excellent  |  10-20% = Good  |  <10% = Weak',
  },
};

function MetricBadge({ metric, value, raw }) {
  const b = benchmarks[metric];
  if (!b) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{b.label}</span>
      <div className="flex items-center gap-2">
        <span className={colorClass(raw, b.thresholds)}>{b.format(raw)}</span>
        <span className="text-[10px] text-gray-400 hidden sm:inline" title={b.tip}>ⓘ</span>
      </div>
    </div>
  );
}

const QuantitativeForm = forwardRef(function QuantitativeForm({ company, onCompanyChange, date }, ref) {
  const router = useRouter();
  const [form, setForm] = useState({
    rev5: '', revCur: '',
    eps5: '', epsCur: '',
    ocf: '',
    ca: '', cl: '',
    tl: '', te: '',
    dps: '', price: '',
  });
  const [marketStats, setMarketStats] = useState(null);
  const [autoFilled, setAutoFilled] = useState(false);
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

  useImperativeHandle(ref, () => ({
    getData: () => ({
      tab: 'quantitative',
      label: 'Quantitative',
      form: { ...form },
      marketStats: marketStats ? { ...marketStats } : null,
      valuation,
      notes,
      revCagr,
      epsCagr,
      curRatio,
      deRatio,
      divYield,
    }),
  }));

  function handleAutoFill(data) {
    // Convert raw API values to form-compatible values
    // Revenue is in raw MYR, form expects millions -> divide by 1e6
    if (data.revenue) set('revCur', String(Math.round(data.revenue / 1e6 * 100) / 100));
    if (data.eps) set('epsCur', String(data.eps));
    if (data.currentAssets) set('ca', String(Math.round(data.currentAssets / 1e6 * 100) / 100));
    if (data.currentLiabilities) set('cl', String(Math.round(data.currentLiabilities / 1e6 * 100) / 100));
    if (data.price) set('price', String(data.price));
    if (data.totalDebt) set('tl', String(Math.round(data.totalDebt / 1e6 * 100) / 100));

    // Compute DPS from dividend yield and price
    if (data.dividendYield && data.price) {
      const dps = (data.dividendYield / 100) * data.price;
      set('dps', String(Math.round(dps * 10000) / 10000));
    }

    // Store supplementary market stats for display
    setMarketStats({
      marketCap: data.marketCap ? Math.round(data.marketCap / 1e6 * 100) / 100 : null,
      pe: data.pe ?? null,
      pb: data.pb ?? null,
      roe: data.roe ?? null,
      roa: data.roa ?? null,
      netMargin: data.netMargin ?? null,
      grossMargin: data.grossMargin ?? null,
      operatingMargin: data.operatingMargin ?? null,
      ebitda: data.ebitda ? Math.round(data.ebitda / 1e6 * 100) / 100 : null,
      freeCashFlow: data.freeCashFlow ? Math.round(data.freeCashFlow / 1e6 * 100) / 100 : null,
      currentRatio: data.currentRatio ?? null,
      employees: data.employees ?? null,
      volume: data.volume ?? null,
    });
    setAutoFilled(true);

    // Valuation notes: pre-fill key metrics
    const pe = data.pe ? `P/E: ${data.pe}x` : '';
    const pb = data.pb ? `P/B: ${data.pb}x` : '';
    const margin = data.netMargin ? `Net Margin: ${data.netMargin}%` : '';
    const fcf = data.freeCashFlow ? `FCF: RM${(data.freeCashFlow / 1e6).toFixed(0)}m` : '';
    const de = data.totalDebt ? `Debt: RM${(data.totalDebt / 1e6).toFixed(0)}m` : '';
    const roe = data.roe ? `ROE: ${data.roe}%` : '';

    const parts = [pe, pb, margin, fcf, de, roe].filter(Boolean);
    if (parts.length > 0) {
      setNotes(parts.join(' | '));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!company.trim()) return;
    setSaving(true);

    const data = {
      'Date': new Date().toISOString().split('T')[0],
      'Date of Review': date,
      'Counter': company.trim(),
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
      'Market Cap': marketStats?.marketCap ?? '',
      'P/E Ratio': marketStats?.pe ?? '',
      'ROE': marketStats?.roe ?? '',
      'Net Margin': marketStats?.netMargin ?? '',
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
        setForm({ rev5: '', revCur: '', eps5: '', epsCur: '', ocf: '', ca: '', cl: '', tl: '', te: '', dps: '', price: '' });
        setMarketStats(null);
        setAutoFilled(false);
        setValuation('');
        setNotes('');
        setDone(false);
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
        <MetricBadge metric="revCagr" raw={revCagr} />
        <MetricBadge metric="epsCagr" raw={epsCagr} />
        <MetricBadge metric="ocf" raw={form.ocf ? Number(form.ocf) : null} />
        <MetricBadge metric="curRatio" raw={curRatio} />
        <MetricBadge metric="deRatio" raw={deRatio} />
        <MetricBadge metric="divYield" raw={divYield} />
        <MetricBadge metric="peRatio" raw={marketStats?.pe ?? null} />
        <MetricBadge metric="roe" raw={marketStats?.roe ?? null} />
        <MetricBadge metric="netMargin" raw={marketStats?.netMargin ?? null} />
      </div>

      {/* Auto-Fill */}
      <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/30">
        <div className="flex items-start gap-3">
          <img
            src="https://static.tradingview.com/static/bundles/tradingview-logo.svg"
            alt="TradingView"
            className="h-6 w-auto mt-0.5 hidden sm:block"
          />
          <div className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Quick Fill:</span> Auto-populate current financial data from{' '}
            <span className="font-semibold">TradingView</span>.
            <br />
            <span className="text-blue-500">Historical data (5yr ago) still needs manual input for CAGR calculation.</span>
          </div>
        </div>
        <AutoFillButton symbol={company} onFill={handleAutoFill} />
      </div>

      {/* Key Market Stats — shown after auto-fill */}
      {marketStats && (
        <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <img
              src="https://static.tradingview.com/static/bundles/tradingview-logo.svg"
              alt="TradingView"
              className="h-4 w-auto"
            />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Key Market Statistics</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-gray-100">
            {[
              { label: 'Market Cap', value: marketStats.marketCap ? `RM ${Number(marketStats.marketCap).toFixed(1)}m` : '-', icon: '🏢' },
              { label: 'P/E Ratio', value: marketStats.pe ? `${Number(marketStats.pe).toFixed(1)}x` : '-', icon: '📊' },
              { label: 'P/B Ratio', value: marketStats.pb ? `${Number(marketStats.pb).toFixed(2)}x` : '-', icon: '📈' },
              { label: 'Current Ratio', value: marketStats.currentRatio ? Number(marketStats.currentRatio).toFixed(2) : '-', icon: '💧' },
              { label: 'ROE', value: marketStats.roe ? `${Number(marketStats.roe).toFixed(1)}%` : '-', icon: '🎯' },
              { label: 'ROA', value: marketStats.roa ? `${Number(marketStats.roa).toFixed(1)}%` : '-', icon: '📐' },
              { label: 'Net Margin', value: marketStats.netMargin ? `${Number(marketStats.netMargin).toFixed(1)}%` : '-', icon: '💰' },
              { label: 'Gross Margin', value: marketStats.grossMargin ? `${Number(marketStats.grossMargin).toFixed(1)}%` : '-', icon: '💵' },
              { label: 'Op. Margin', value: marketStats.operatingMargin ? `${Number(marketStats.operatingMargin).toFixed(1)}%` : '-', icon: '⚙️' },
              { label: 'EBITDA', value: marketStats.ebitda ? `RM ${Number(marketStats.ebitda).toFixed(0)}m` : '-', icon: '📋' },
              { label: 'Free Cash Flow', value: marketStats.freeCashFlow ? `RM ${Number(marketStats.freeCashFlow).toFixed(0)}m` : '-', icon: '💎' },
              { label: 'Employees', value: marketStats.employees ? Number(marketStats.employees).toLocaleString() : '-', icon: '👥' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5 bg-white px-3 py-2.5">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span>{stat.icon}</span> {stat.label}
                </span>
                <span className="text-sm font-semibold text-gray-800">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1-2: Revenue & EPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800">Step 1: Revenue Growth</h3>
          <InputField label="Past 5th Year Revenue (RM m)" value={form.rev5} onChange={(v) => set('rev5', v)} />
          <InputField label="Current Year Revenue (RM m)" value={form.revCur} onChange={(v) => set('revCur', v)} />
          <MetricBadge metric="revCagr" raw={revCagr} />
          <p className="text-[10px] text-gray-400">{benchmarks.revCagr.tip}</p>
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800">Step 2: EPS Growth</h3>
          <InputField label="Past 5th Year EPS" value={form.eps5} onChange={(v) => set('eps5', v)} />
          <InputField label="Current Year EPS" value={form.epsCur} onChange={(v) => set('epsCur', v)} />
          <MetricBadge metric="epsCagr" raw={epsCagr} />
          <p className="text-[10px] text-gray-400">{benchmarks.epsCagr.tip}</p>
        </div>
      </div>

      {/* Step 3-5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 3: OCF</h3>
          <InputField label="Years of Positive OCF" value={form.ocf} onChange={(v) => set('ocf', v)} />
          <p className="text-[10px] text-gray-400 mt-1">{benchmarks.ocf.tip}</p>
        </div>

        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 4: Liquidity</h3>
          <div className="space-y-2">
            <InputField label="Current Assets" value={form.ca} onChange={(v) => set('ca', v)} />
            <InputField label="Current Liabilities" value={form.cl} onChange={(v) => set('cl', v)} />
          </div>
          <MetricBadge metric="curRatio" raw={curRatio} />
          <p className="text-[10px] text-gray-400">{benchmarks.curRatio.tip}</p>
        </div>

        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 5: Debt</h3>
          <div className="space-y-2">
            <InputField label="Total Liabilities" value={form.tl} onChange={(v) => set('tl', v)} />
            <InputField label="Total Equities" value={form.te} onChange={(v) => set('te', v)} />
          </div>
          <MetricBadge metric="deRatio" raw={deRatio} />
          <p className="text-[10px] text-gray-400">{benchmarks.deRatio.tip}</p>
        </div>
      </div>

      {/* Step 6-7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Step 6: Dividend</h3>
          <div className="space-y-2">
            <InputField label="Dividend Per Share (DPS)" value={form.dps} onChange={(v) => set('dps', v)} />
            <InputField label="Current Share Price" value={form.price} onChange={(v) => set('price', v)} />
          </div>
          <MetricBadge metric="divYield" raw={divYield} />
          <p className="text-[10px] text-gray-400">{benchmarks.divYield.tip}</p>
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!company.trim() || saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : done ? '✓ Saved!' : 'Save to Sheet'}
          </button>
        </div>
      </div>
    </form>
  );
});

export default QuantitativeForm;
