'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(registrations.map((registration) => registration.unregister()))
          )
          .then(() => caches.keys())
          .then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith('gsat-'))
                .map((key) => caches.delete(key))
            )
          )
          .catch(() => {});
      } else {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 flex items-center gap-4 px-5 py-4 max-w-sm w-full">
        <img
          src="/icon/sediment.png"
          alt="GSAT"
          className="w-12 h-12 rounded-xl flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Install GSAT</p>
          <p className="text-xs text-gray-500 mt-0.5">Add to home screen for quick access</p>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 text-xs text-center transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
