'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useGrainStore } from '@/store/useGrainStore';
import Header from '@/components/ui/Header';
import SieveInput from '@/components/ui/SieveInput';
import StatisticalResults from '@/components/ui/StatisticalResults';
import LandingPage from '@/components/ui/LandingPage';
import AuthModal from '@/components/auth/AuthModal';

const AllCharts = dynamic(() => import('@/components/charts/AllCharts'), {
  ssr: false,
});

type View = 'landing' | 'app';

export default function HomePage() {
  const { user, loading } = useAuth();
  const result = useGrainStore((state) => state.result);
  const [view, setView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && view === 'app') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 pb-8 md:flex md:h-screen md:min-h-0 md:flex-col md:overflow-hidden md:p-6">
        <div className="mx-auto w-full max-w-[1800px] md:shrink-0">
          <Header onBack={() => setView('landing')} />
        </div>

        <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 md:grid md:min-h-0 md:flex-1 md:grid-cols-[minmax(340px,40%)_minmax(0,1fr)] md:gap-5 md:overflow-hidden">
          <section className="flex flex-col gap-8 md:overflow-y-auto md:pr-2">
            <SieveInput />
            <StatisticalResults />
          </section>

          <section className="min-w-0 md:overflow-y-auto md:pl-1">
            {result ? (
              <AllCharts result={result} />
            ) : (
              <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm font-semibold text-gray-400 md:h-full">
                Enter sieve sizes and weights, then click
                <span className="mx-1 text-blue-600">
                  Calculate &amp; Plot
                </span>
                to see charts.
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <>
      <LandingPage onEnterApp={() => setView('app')} />
      {!user && <AuthModal onSuccess={() => setView('app')} />}
    </>
  );
}
