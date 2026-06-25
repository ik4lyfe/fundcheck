'use client';

import { useState } from 'react';

export default function AutoFillButton({ symbol, onFill }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  async function handleAutoFill() {
    if (!symbol) {
      setError('Select a stock first');
      return;
    }

    setLoading(true);
    setError(null);
    setSource(null);

    try {
      const res = await fetch(`/api/financials?symbol=${encodeURIComponent(symbol)}`);
      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Failed to fetch data');
        setLoading(false);
        return;
      }

      // Store source info for display
      if (json.source) {
        setSource(json.source);
      }

      onFill(json.data);
    } catch (err) {
      setError('Network error. Try again.');
      console.error('AutoFill error:', err);
    }

    setLoading(false);
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-MY', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={!symbol || loading}
          className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
            !symbol || loading
              ? 'border-gray-200 dark:border-gray-600 dark:text-gray-500 cursor-not-allowed'
              : 'border-blue-200 dark:border-blue-800 dark:text-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30'
          }`}
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin" />
              Fetching...
            </>
          ) : (
            '🔍 Auto-Fill from Market'
          )}
        </button>
      </div>

      {/* Source badge — shown after successful fetch */}
      {source && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2">
          <span className="text-blue-600 dark:text-blue-300 font-medium">📡 {source.name}</span>
          <span className="text-gray-500 dark:text-gray-400">🕐 {formatTime(source.fetchedAt)}</span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-300 underline hover:text-blue-800 inline-flex items-center gap-0.5"
          >
            🔗 Verify on {source.name}
          </a>
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
