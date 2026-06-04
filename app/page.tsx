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

const AllCharts = dynamic(() => import('@/components/charts/AllCharts'), { ssr: false });
import { downloadAllCharts } from '@/components/charts/AllCharts';

type View = 'landing' | 'app';

export default function HomePage() {
  const { user, loading }            = useAuth();
  const result                       = useGrainStore(s => s.result);
  const showOverlayCurve             = useGrainStore(s => s.showOverlayCurve);
  const [view, setView]              = useState<View>('landing');

  // Spinner while restoring session from localStorage
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

  // Show GSAT app — only when logged in AND user chose to enter
  if (user && view === 'app') {
    return (
      <>
        {/* ── MOBILE: single scrollable column ── */}
        <div className="flex flex-col md:hidden min-h-screen bg-gray-100 px-4 pt-4 pb-8 gap-6">
          <Header onBack={() => setView('landing')} onDownload={result ? downloadAllCharts : undefined} />
          <SieveInput />
          <StatisticalResults />
          {result && <AllCharts result={result} showOverlayCurve={showOverlayCurve} />}
        </div>

        {/* ── DESKTOP: fixed two-column layout ── */}
        <div className="hidden md:flex flex-col h-screen overflow-hidden bg-gray-100">
          <div className="shrink-0 px-4 pt-4 pb-2">
            <Header onBack={() => setView('landing')} onDownload={result ? downloadAllCharts : undefined} />
          </div>

          <div className="flex flex-1 overflow-hidden gap-4 px-4 pb-4">
            <aside className="w-[38%] shrink-0 flex flex-col gap-4 overflow-y-auto">
              <SieveInput />
              <StatisticalResults />
            </aside>

            <main className="flex-1 overflow-y-auto">
              {result
                ? <AllCharts result={result} showOverlayCurve={showOverlayCurve} />
                : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm font-semibold">
                    Enter sieve weights and click <span className="mx-1 text-blue-600">Calculate &amp; Plot</span> to see charts.
                  </div>
                )
              }
            </main>
          </div>
        </div>
      </>
    );
  }

  // Landing page — with modal only shown if not logged in
  return (
    <>
      <LandingPage onEnterApp={() => setView('app')} />
      {/* Modal only needed when not logged in */}
      {!user && <AuthModal onSuccess={() => setView('app')} />}
    </>
  );
}
