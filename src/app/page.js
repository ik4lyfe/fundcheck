'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('business');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchEntries() {
    setLoading(true);
    const res = await fetch(`/api/entries?tab=${activeTab}`);
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEntries();
  }, [activeTab]);

  const tabs = [
    { key: 'business', label: 'Business' },
    { key: 'management', label: 'Management' },
    { key: 'quantitative', label: 'Quantitative' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fundamental Analysis</h1>
        <div className="flex gap-2">
          <Link
            href="/business"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            + New Business
          </Link>
          <Link
            href="/management"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            + New Management
          </Link>
          <Link
            href="/quantitative"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            + New Quantitative
          </Link>
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

      {/* Entries */}
      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          No entries yet. Start your first analysis above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-gray-500">Date</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-500">Company</th>
                <th className="text-right py-2 font-medium text-gray-500">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 text-gray-500">{e.Date || '-'}</td>
                  <td className="py-2.5 pr-4 font-medium">{e.Company || '-'}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {e['Total Score'] ? `${e['Total Score']}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
