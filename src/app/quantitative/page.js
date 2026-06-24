import QuantitativeForm from '@/components/QuantitativeForm';

export default function QuantitativePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Quantitative Analysis</h1>
        <p className="text-sm text-gray-500">
          7-step financial health check — CAGR, liquidity, debt, dividend &amp; valuation
        </p>
      </div>

      <QuantitativeForm />
    </div>
  );
}
