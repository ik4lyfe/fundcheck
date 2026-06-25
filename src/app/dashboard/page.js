'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const tabs = [
  { key: 'business', label: 'Business', scoreLabel: 'Total Score' },
  { key: 'management', label: 'Management', scoreLabel: 'Total Score' },
  { key: 'quantitative', label: 'Quantitative', scoreLabel: 'Revenue CAGR' },
];

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
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
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchEntries();
  }, [activeTab]);

  // Auth guard
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  // Group unique stocks reviewed
  const uniqueStocks = [...new Set(entries.map((e) => e.counter || e.data?.Counter || e.data?.counter).filter(Boolean))];
  const latestEntry = entries.length > 0 ? entries[0] : null;

  function getField(e, field) {
    return e.data?.[field] ?? e[field] ?? '';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor all analysed stocks</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total Entries</div>
          <div className="text-xl font-bold tabular-nums mt-1">{entries.length}</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Unique Stocks</div>
          <div className="text-xl font-bold tabular-nums mt-1">{uniqueStocks.length}</div>
        </div>
        <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Latest Review</div>
          <div className="text-sm font-semibold mt-1 truncate">
            {latestEntry ? (latestEntry.dateOfReview || getField(latestEntry, 'Date of Review') || '-') : '-'}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Latest Stock</div>
          <div className="text-sm font-semibold mt-1 truncate">
            {latestEntry ? (latestEntry.counter || getField(latestEntry, 'Counter') || '-') : '-'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-gray-900 text-gray-900 dark:text-gray-100'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      {loading ? (
        <div className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No entries yet. Start analysing on the Analysis page.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 pr-3 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">#</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Stock</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Date of Review</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Score</th>
                <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-2.5 pr-3 text-gray-400 dark:text-gray-500 tabular-nums">{i + 1}</td>
                  <td className="py-2.5 pr-3 font-medium">{e.counter || getField(e, 'Counter') || '-'}</td>
                  <td className="py-2.5 pr-3 text-gray-600 dark:text-gray-300">{e.dateOfReview || getField(e, 'Date of Review') || '-'}</td>
                  <td className="py-2.5 pr-3 tabular-nums font-semibold">{
                    activeTab === 'quantitative'
                      ? (getField(e, 'Revenue CAGR') ? `${getField(e, 'Revenue CAGR')}%` : '-')
                      : (getField(e, 'Total Score') || '-')
                  }</td>
                  <td className="py-2.5 text-gray-500 dark:text-gray-400 text-xs max-w-[200px] truncate">{getField(e, 'Notes') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* End */}
    </div>
  );
}
