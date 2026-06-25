'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StockSelector from '@/components/StockSelector';
import QualitativeForm from '@/components/QualitativeForm';
import QuantitativeForm from '@/components/QuantitativeForm';
import ExportPdfButton from '@/components/ExportPdfButton';

/* ====== CRITERIA ====== */

const businessCriteria = [
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

const managementCriteria = [
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

const tabs = [
  { key: 'business', label: 'Business', desc: 'Qualitative — Products, Market, & Operations' },
  { key: 'management', label: 'Management', desc: 'Qualitative — Leadership & Governance' },
  { key: 'quantitative', label: 'Quantitative', desc: '7-Step Financial Health Check' },
];

/* ====== HISTORY TABLE ====== */

const historyColumns = {
  business: ['Date of Review', 'Counter', 'Total Score'],
  management: ['Date of Review', 'Counter', 'Total Score'],
  quantitative: ['Date of Review', 'Counter', 'Revenue CAGR', 'EPS CAGR', 'D/E Ratio', 'Dividend Yield'],
};

function HistoryTable({ tab, entries }) {
  const cols = historyColumns[tab] || [];
  if (entries.length === 0) {
    return <div className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No entries yet.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {cols.map((c) => (
              <th key={c} className="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {cols.map((c) => {
                const val = e.data?.[c] ?? e[c] ?? e[c.toLowerCase().replace(/\s+/g, '')] ?? '-';
                return (
                  <td key={c} className="py-2.5 pr-4 text-gray-600 dark:text-gray-300 tabular-nums whitespace-nowrap">{val}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====== MAIN PAGE ====== */

export default function AnalysisPage() {
  const { status } = useSession();
  const router = useRouter();
  const [stock, setStock] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tab, setTab] = useState('business');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const businessRef = useRef(null);
  const managementRef = useRef(null);
  const quantRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?tab=${tab}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Collect data from all forms for the PDF export
  function getAllSections() {
    const sections = [];
    if (businessRef.current) sections.push(businessRef.current.getData());
    if (managementRef.current) sections.push(managementRef.current.getData());
    if (quantRef.current) sections.push(quantRef.current.getData());
    return sections;
  }

  const currentTab = tabs.find((t) => t.key === tab);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== GLOBAL CONTROLS ===== */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1 w-full sm:w-auto">
          <StockSelector value={stock} onChange={setStock} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
            Date of Review
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-gray-100/20"
          />
        </div>
      </div>

      {/* ===== EXPORT BUTTON ===== */}
      <div className="flex justify-end">
        <ExportPdfButton
          stock={stock}
          date={date}
          sections={getAllSections()}
        />
      </div>

      {/* ===== TABS ===== */}
      <div>
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-gray-900 text-gray-900 dark:text-gray-100'
                  : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {currentTab && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{currentTab.desc}</p>
        )}
      </div>

      {/* ===== FORM ===== */}
      <div>
        {tab === 'business' && (
          <QualitativeForm
            ref={businessRef}
            title="Qualitative — Business"
            tab="business"
            criteria={businessCriteria}
            maxScore={50}
            company={stock}
            onCompanyChange={setStock}
            date={date}
          />
        )}
        {tab === 'management' && (
          <QualitativeForm
            ref={managementRef}
            title="Qualitative — Management"
            tab="management"
            criteria={managementCriteria}
            maxScore={50}
            company={stock}
            onCompanyChange={setStock}
            date={date}
          />
        )}
        {tab === 'quantitative' && (
          <QuantitativeForm
            ref={quantRef}
            company={stock}
            onCompanyChange={setStock}
            date={date}
          />
        )}
      </div>

      {/* ===== HISTORY ===== */}
      <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            History — {currentTab?.label || tab}
          </h2>
          <button
            onClick={fetchEntries}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading...</div>
        ) : (
          <HistoryTable tab={tab} entries={entries} />
        )}
      </section>
    </div>
  );
}
