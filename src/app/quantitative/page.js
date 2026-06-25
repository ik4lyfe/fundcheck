'use client';

import { useState } from 'react';
import StockSelector from '@/components/StockSelector';
import QuantitativeForm from '@/components/QuantitativeForm';

export default function QuantitativePage() {
  const [stock, setStock] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <StockSelector value={stock} onChange={setStock} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Date of Review</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20" />
        </div>
      </div>
      <div>
        <h1 className="text-lg font-semibold">Quantitative Analysis</h1>
        <p className="text-sm text-gray-500">7-step financial health check — CAGR, liquidity, debt, dividend &amp; valuation</p>
      </div>
      <QuantitativeForm company={stock} onCompanyChange={setStock} date={date} />
    </div>
  );
}
