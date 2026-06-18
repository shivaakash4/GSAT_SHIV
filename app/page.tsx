'use client';

import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useModalStore } from '@/store/useModalStore';

type BatchMode = 'single' | 'multi';

const BATCH_OPTIONS: {
  mode: BatchMode;
  title: string;
  description: string;
  src: string;
}[] = [
  {
    mode: 'single',
    title: 'Single Batch',
    description: 'Open the original GSAT single-batch HTML tool.',
    src: '/gsat-single-batch.html',
  },
  {
    mode: 'multi',
    title: 'Multi Batch',
    description: 'Open the original GSAT multi-batch HTML tool.',
    src: '/gsat-multi-batch.html',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const openModal = useModalStore((state) => state.openModal);
  const [selectedMode, setSelectedMode] = useState<BatchMode | null>(null);
  const [pendingMode, setPendingMode] = useState<BatchMode | null>(null);

  const selectedOption = BATCH_OPTIONS.find(
    (option) => option.mode === selectedMode
  );

  const launchBatch = (mode: BatchMode) => {
    if (user) {
      setSelectedMode(mode);
      return;
    }

    setPendingMode(mode);
    openModal('login');
  };

  const handleAuthSuccess = () => {
    if (pendingMode) {
      setSelectedMode(pendingMode);
      setPendingMode(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedMode(null);
    setPendingMode(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && selectedOption) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              GSAT
            </p>
            <h1 className="text-lg font-bold text-gray-900">
              {selectedOption.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedMode(null)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
            >
              Sign Out
            </button>
          </div>
        </header>

        <iframe
          key={selectedOption.src}
          title={selectedOption.title}
          src={selectedOption.src}
          className="min-h-0 flex-1 border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
        />
      </div>
    );
  }

  return (
    <>
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-gray-100">
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white/85 px-6 py-5 backdrop-blur md:px-8">
          <span className="text-lg font-bold text-gray-900">GSAT</span>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-xs text-gray-500 sm:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-semibold text-gray-600 transition hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openModal('login')}
                  className="text-sm font-semibold text-gray-600 transition hover:text-blue-600"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openModal('signup')}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>

        <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
            Advanced Grain Size Analysis Tool
          </div>

          <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            Choose GSAT Mode
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-500">
            Select the original single-batch or multi-batch HTML tool.
          </p>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {BATCH_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => launchBatch(option.mode)}
                className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl"
              >
                <span className="mb-3 block text-2xl font-extrabold text-gray-900">
                  {option.title}
                </span>
                <span className="block text-sm font-semibold leading-6 text-gray-500">
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          {user ? (
            <p className="mt-5 text-sm font-semibold text-green-600">
              Logged in as {user.email}
            </p>
          ) : (
            <p className="mt-5 text-sm text-gray-400">
              Sign in is required before opening the tool.
            </p>
          )}
        </section>
      </main>

      {!user && <AuthModal onSuccess={handleAuthSuccess} />}
    </>
  );
}
