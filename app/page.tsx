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
      <div className="container mx-auto p-4 md:p-8">
        <Header onBack={() => setView('landing')} />
        <main className="flex flex-col gap-8">
          <SieveInput />
          <StatisticalResults />
          {result && <AllCharts result={result} showOverlayCurve={showOverlayCurve} />}
        </main>
      </div>
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
