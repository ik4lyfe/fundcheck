'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function StockSelector({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.stocks || []);
      setOpen(data.stocks?.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    setHighlight(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  }

  function selectStock(stock) {
    const display = `${stock.symbol} — ${stock.name} [${stock.market}]`;
    setQuery(display);
    onChange(stock.symbol);
    setOpen(false);
    setSuggestions([]);
    setHighlight(-1);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      selectStock(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[200px]">
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
        Counter / Stock
      </label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        placeholder="Type code or name… e.g. INARI"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        autoComplete="off"
        required
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute right-3 top-9">
          <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((stock, i) => (
            <li
              key={stock.symbol}
              onClick={() => selectStock(stock)}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2.5 cursor-pointer text-sm border-b border-gray-50 last:border-0 transition-colors ${
                i === highlight ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900">{stock.symbol}</span>
                  <span className="text-gray-400 mx-1.5">—</span>
                  <span className="text-gray-600 text-xs">{stock.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                    {stock.sector}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{stock.market}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
