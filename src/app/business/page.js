import QualitativeForm from '@/components/QualitativeForm';

const criteria = [
  {
    label: 'Products & Services',
    desc: 'Is demand new, trending, or declining? Patentable? Exclusive rights?',
    header: 'Products & Services',
  },
  {
    label: 'Market Size',
    desc: 'How big is the market? Can they reach international markets?',
    header: 'Market Size',
  },
  {
    label: 'Margin',
    desc: 'Is gross margin superior to peers? Do they have pricing power?',
    header: 'Margin',
  },
  {
    label: 'Competitive Edge',
    desc: 'What are their competitive advantages? Are they sustainable?',
    header: 'Competitive Edge',
  },
  {
    label: 'Growth',
    desc: 'Growth catalysts? How fast can they grow topline & bottom line?',
    header: 'Growth',
  },
  {
    label: 'Business Model',
    desc: 'Relevant or obsolete? High CAPEX? Supply chain? Customer concentration?',
    header: 'Business Model',
  },
  {
    label: 'Sustainability',
    desc: 'Can they sustain growth? ESG standing?',
    header: 'Sustainability',
  },
  {
    label: 'Industry Nature',
    desc: 'How does the economy affect performance? Defensive or cyclical? Future prospect?',
    header: 'Industry Nature',
  },
  {
    label: 'Competition',
    desc: 'How competitive is the industry? Market leadership? Barriers to entry?',
    header: 'Competition',
  },
  {
    label: 'Risks',
    desc: 'Possible risks? Solid risk management framework?',
    header: 'Risks',
  },
];

export default function BusinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Qualitative — Business</h1>
        <p className="text-sm text-gray-500">Rate each criterion from 1 (Poor) to 5 (Excellent)</p>
      </div>

      <QualitativeForm
        title="Business"
        tab="business"
        criteria={criteria}
        maxScore={50}
      />
    </div>
  );
}
