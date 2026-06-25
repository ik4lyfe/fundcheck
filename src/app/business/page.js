'use client';

import { useState } from 'react';
import StockSelector from '@/components/StockSelector';
import QualitativeForm from '@/components/QualitativeForm';

const criteria = [
  { label: 'Products & Services', header: 'Products & Services',
    desc: 'Is the demand for the products and services new, trending, or declining? Are their products and services patentable? Do they have exclusive rights to the products that they distribute?' },
  { label: 'Market Size', header: 'Market Size',
    desc: 'How big is the market for their products and services? Can they reach the international market?' },
  { label: 'Margin', header: 'Margin',
    desc: 'Is the gross margin of their products and services superior to their peers? Do they have pricing power?' },
  { label: 'Competitive Edge', header: 'Competitive Edge',
    desc: 'What are their competitive advantages? Are their competitive advantages sustainable?' },
  { label: 'Growth', header: 'Growth',
    desc: 'Do they have any growth catalysts? How fast can they grow their topline and bottom line?' },
  { label: 'Business Model', header: 'Business Model',
    desc: 'Is their business model relevant, forward-looking or obsolete? Is it a high CAPEX business? How is their supply chain management? Do they have customer concentration or supplier concentration risk?' },
  { label: 'Sustainability', header: 'Sustainability',
    desc: 'Can they sustain their growth in the future? How is their ESG standing?' },
  { label: 'Industry Nature', header: 'Industry Nature',
    desc: 'How will the prevailing economy affect their business performance? Is the business defensive or cyclical in nature? What is the industry\'s future prospect?' },
  { label: 'Competition', header: 'Competition',
    desc: 'How competitive is the industry? What is their market leadership position? How high is the barrier of entry to the industry?' },
  { label: 'Risks', header: 'Risks',
    desc: 'What are the possible risks that the business could face? Do they have a solid risk management framework to mitigate the internal and external risks?' },
];

export default function BusinessPage() {
  const [stock, setStock] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <StockSelector value={stock} onChange={setStock} />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Date of Review</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-gray-100/20" />
        </div>
      </div>
      <div>
        <h1 className="text-lg font-semibold">Qualitative — Business</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Rate each criterion from 1 (Poor) to 5 (Excellent)</p>
      </div>
      <QualitativeForm title="Business" tab="business" criteria={criteria} maxScore={50}
        company={stock} onCompanyChange={setStock} date={date} />
    </div>
  );
}
