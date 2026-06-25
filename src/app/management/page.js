'use client';

import { useState } from 'react';
import StockSelector from '@/components/StockSelector';
import QualitativeForm from '@/components/QualitativeForm';

const criteria = [
  { label: 'Owners', header: 'Owners',
    desc: 'Who are the majority shareholders and how big are their stakes? Do they have skin in the game? Do they have frequent insider buying and selling activities in the past 12 months?' },
  { label: 'Board of Directors', header: 'Board of Directors',
    desc: 'Who are the Board of Directors? What are their backgrounds? Does the company have a professional, independent, and inclusive board? Is the board controlled by the executive directors?' },
  { label: 'Management Competency', header: 'Management Competency',
    desc: 'What is the management\'s background, track record and performance? Have they been making good business decisions? Are they capable to navigate the company through a crisis? Did they deliver reasonable ROE each year?' },
  { label: 'Management Integrity', header: 'Management Integrity',
    desc: 'Does the management uphold a high standard of ethics and integrity in business? Are their intentions aligned with shareholders? Are they open and transparent with the minority shareholders? Are they trustworthy? Did they often have related party transactions?' },
  { label: 'Corporate Governance', header: 'Corporate Governance',
    desc: 'Does the company have a strong corporate governance?' },
  { label: 'Wealth Creation for Shareholders', header: 'Wealth Creation for Shareholders',
    desc: 'Did the management create wealth for shareholders? What is their dividend policy?' },
  { label: 'Executive Compensation', header: 'Executive Compensation',
    desc: 'Is the executive compensation fair and competitive? Is it consistent with the company\'s performance? How is it compared to the average remuneration for companies of similar size in the same region?' },
  { label: 'Talents Attraction & Retention', header: 'Talents Attraction & Retention',
    desc: 'Is the company able to attract and retain talents? What are the reviews of the staff towards the company? Does the company have a positive and healthy working culture? What is their senior management\'s average tenure?' },
  { label: 'Corporate Actions', header: 'Corporate Actions',
    desc: 'Did the management often undertake corporate exercises? Were they essential? Were they dilutive to the shareholding base? Did the management often conduct share buybacks? Were the share buybacks conducted at reasonable prices?' },
  { label: 'Adjusted Figures', header: 'Adjusted Figures',
    desc: 'Is the management prone to sugarcoat the numbers? Do they often issue adjusted EPS, EBITDA or near-term guidance?' },
];

export default function ManagementPage() {
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
        <h1 className="text-lg font-semibold">Qualitative — Management</h1>
        <p className="text-sm text-gray-500">Rate each criterion from 1 (Poor) to 5 (Excellent)</p>
      </div>
      <QualitativeForm title="Management" tab="management" criteria={criteria} maxScore={50}
        company={stock} onCompanyChange={setStock} date={date} />
    </div>
  );
}
