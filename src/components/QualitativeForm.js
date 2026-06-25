'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';

const ratings = [
  { label: 'Poor', value: 1 },
  { label: 'Fair', value: 2 },
  { label: 'Average', value: 3 },
  { label: 'Good', value: 4 },
  { label: 'Excellent', value: 5 },
];

function RatingSelector({ value, onChange }) {
  return (
    <div className="flex gap-3 items-center">
      {ratings.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`w-9 h-9 rounded-full text-xs font-medium border transition-colors ${
            value === r.value
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
          }`}
          title={r.label}
        >
          {r.value}
        </button>
      ))}
    </div>
  );
}

const QualitativeForm = forwardRef(function QualitativeForm({ title, tab, criteria, maxScore, company, onCompanyChange, date }, ref) {
  const router = useRouter();
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const allRated = criteria.length === Object.keys(scores).length;

  useImperativeHandle(ref, () => ({
    getData: () => ({
      tab,
      criteria,
      scores,
      notes,
      total,
      maxScore,
      allRated,
      label: title,
    }),
  }));

  function handleScore(idx, val) {
    setScores((prev) => ({ ...prev, [idx]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!company.trim() || !allRated) return;
    setSaving(true);

    const data = {
      Date: new Date().toISOString().split('T')[0],
      'Date of Review': date,
      Counter: company.trim(),
    };

    criteria.forEach((c, i) => {
      data[c.header] = scores[i] || '';
    });
    data['Total Score'] = total;
    data['Notes'] = notes;

    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab, data }),
    });

    const result = await res.json();
    setSaving(false);

    if (result.success) {
      setDone(true);
      setTimeout(() => {
        setScores({});
        setNotes('');
        setDone(false);
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score indicator */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400 uppercase tracking-wide">Score</div>
        <div className="text-2xl font-bold tabular-nums">
          {total}<span className="text-gray-300 text-lg font-normal">/{maxScore}</span>
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-3">
        {criteria.map((c, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {i + 1}. {c.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.desc}</div>
            </div>
            <RatingSelector value={scores[i]} onChange={(v) => handleScore(i, v)} />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 resize-none"
          placeholder="Key observations..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!company.trim() || !allRated || saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : done ? '✓ Saved!' : 'Save to Sheet'}
          </button>
          {!allRated && (
            <span className="text-xs text-amber-600">
              Rate all {criteria.length} criteria first
            </span>
          )}
        </div>
      </div>
    </form>
  );
});

export default QualitativeForm;
