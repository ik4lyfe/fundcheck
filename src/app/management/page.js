import QualitativeForm from '@/components/QualitativeForm';

const criteria = [
  {
    label: 'Owners',
    desc: 'Majority shareholders & stakes? Skin in the game? Insider buying/selling?',
    header: 'Owners',
  },
  {
    label: 'Board of Directors',
    desc: 'Who are they? Backgrounds? Professional, independent, inclusive board? Controlled by execs?',
    header: 'Board of Directors',
  },
  {
    label: 'Management Competence',
    desc: 'Due diligence before decisions? Good business decisions? Led through COVID-19?',
    header: 'Management Competence',
  },
  {
    label: 'Management Integrity',
    desc: 'High ethics? Questionable related party transactions? Transparent with minority shareholders?',
    header: 'Management Integrity',
  },
  {
    label: 'Corporate Governance',
    desc: 'Does the company have strong corporate governance?',
    header: 'Corporate Governance',
  },
  {
    label: 'Shareholder Consideration',
    desc: 'Created wealth for shareholders? Dividend policy?',
    header: 'Shareholder Consideration',
  },
  {
    label: 'Executive Compensation',
    desc: 'Fair and reasonable? Rewards performance? Comparable to similar companies?',
    header: 'Executive Compensation',
  },
  {
    label: 'Staff Recognition & Retention',
    desc: 'Attract and retain talent? Employee reviews? Senior management tenure?',
    header: 'Staff Recognition & Retention',
  },
  {
    label: 'Corporate Actions',
    desc: 'IPO, M&A, placements, buybacks? At reasonable prices?',
    header: 'Corporate Actions',
  },
  {
    label: 'Auditor Figures',
    desc: 'Prone to sugarcoat numbers? Adjusted FSB, EBITDA, near-term guidance?',
    header: 'Auditor Figures',
  },
];

export default function ManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Qualitative — Management</h1>
        <p className="text-sm text-gray-500">Rate each criterion from 1 (Poor) to 5 (Excellent)</p>
      </div>

      <QualitativeForm
        title="Management"
        tab="management"
        criteria={criteria}
        maxScore={50}
      />
    </div>
  );
}
