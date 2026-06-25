'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const features = [
  {
    title: 'Qualitative Analysis',
    desc: 'Evaluate business moats, management quality, and corporate governance with structured scoring.',
    icon: '🔍',
  },
  {
    title: 'Quantitative Health Check',
    desc: 'Run a 7-step financial health check — CAGR, liquidity, debt, dividends, and valuation metrics.',
    icon: '📊',
  },
  {
    title: 'Dashboard & Export',
    desc: 'Track all your analyses in one place. Export professional PDF reports with a single click.',
    icon: '📋',
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/analysis');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30">
            Powered by WealthFort International
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-gray-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Fundamental
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-medium">
            Stock Analysis Made Simple
          </p>
          <p className="mt-3 max-w-lg mx-auto text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
            A structured, checklist-based approach to fundamental analysis. Evaluate businesses,
            management teams, and financial health with clarity and confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analysis"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-gray-900/10 dark:shadow-gray-900/20"
            >
              Start Free Analysis
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Everything You Need for Rigorous Analysis
            </h2>
            <p className="mt-3 text-sm text-gray-400 dark:text-gray-500 max-w-md mx-auto">
              Three interconnected modules that guide you from qualitative assessment to quantitative validation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-gray-900/5 dark:hover:shadow-gray-900/20 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Powered by <span className="font-medium text-gray-500 dark:text-gray-400">WealthFort International Sdn. Bhd.</span>
        </p>
      </footer>
    </div>
  );
}
