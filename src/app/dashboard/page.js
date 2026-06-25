'use client';

import { useState, useEffect } from 'react';

const tabs = [
  { key: 'business', label: 'Business', scoreLabel: 'Total Score' },
  { key: 'management', label: 'Management', scoreLabel: 'Total Score' },
  { key: 'quantitative', label: 'Quantitative', scoreLabel: 'Revenue CAGR' },
];

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1zk9_DPDSJsF0kfGrtMgt0gHyIusPprteXSW3mtXfqDY';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?tab=${activeTab}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchEntries();
  }, [activeTab]);

  // Group unique stocks reviewed
  const uniqueStocks = [...new Set(entries.map((e) => e.Counter || e.Company).filter(Boolean))];
  const latestEntry = entries.length > 0 ? entries[0] : null;

  return (
    <div className="space-y-6">
      {/* Header with Sheet link */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">Monitor all analysed stocks</p>
        </div>
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg text-xs font-medium border border-green-300 text-green-700 hover:bg-green-50 transition-colors inline-flex items-center gap-1.5"
        >
          <span className="text-sm">📊</span>
          View Google Sheet
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Entries</div>
          <div className="text-xl font-bold tabular-nums mt-1">{entries.length}</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Unique Stocks</div>
          <div className="text-xl font-bold tabular-nums mt-1">{uniqueStocks.length}</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Latest Review</div>
          <div className="text-sm font-semibold mt-1 truncate">
            {latestEntry ? (latestEntry['Date of Review'] || latestEntry.Date || '-') : '-'}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Latest Stock</div>
          <div className="text-sm font-semibold mt-1 truncate">
            {latestEntry ? (latestEntry.Counter || latestEntry.Company || '-') : '-'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">No entries yet. Start analysing on the Analysis page.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 font-medium text-gray-500 whitespace-nowrap">#</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-500 whitespace-nowrap">Stock</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-500 whitespace-nowrap">Date of Review</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-500 whitespace-nowrap">Score</th>
                <th className="text-left py-2 font-medium text-gray-500 whitespace-nowrap">Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-3 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="py-2.5 pr-3 font-medium">{e.Counter || e.Company || '-'}</td>
                  <td className="py-2.5 pr-3 text-gray-600">{e['Date of Review'] || e.Date || '-'}</td>
                  <td className="py-2.5 pr-3 tabular-nums font-semibold">{
                    activeTab === 'quantitative'
                      ? (e['Revenue CAGR'] ? `${e['Revenue CAGR']}%` : '-')
                      : (e['Total Score'] || '-')
                  }</td>
                  <td className="py-2.5 text-gray-500 text-xs max-w-[200px] truncate">{e.Notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Sheet Link */}
      <div className="border-t border-gray-100 pt-4 text-center">
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          📊 Open full data in Google Sheets →
        </a>
      </div>
    </div>
  );
}
