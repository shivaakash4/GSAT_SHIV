'use client';
import { useModalStore } from '@/store/useModalStore';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: Props) {
  const openModal = useModalStore(s => s.openModal);
  const user      = useAuthStore(s => s.user);

  // If already logged in, buttons go straight to app — no modal
  const handleLaunch = () => {
    if (user) {
      onEnterApp();
    } else {
      openModal('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <span className="text-lg font-bold text-gray-900">GSAT</span>

        <div className="flex items-center gap-3">
          {user ? (
            // Already logged in — show email + go to app
            <>
              <span className="text-xs text-gray-500 hidden sm:inline">{user.email}</span>
              <button
                onClick={onEnterApp}
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Go to App →
              </button>
            </>
          ) : (
            // Not logged in — show sign in / sign up
            <>
              <button
                onClick={() => openModal('login')}
                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => openModal('signup')}
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
          Professional Sedimentology Tool
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl">
          Grain Size<br />
          <span className="text-blue-600">Analysis Tool</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          Analyse sediment grain size distribution with professional charts,
          statistical results, and 4K export — all in your browser.
        </p>

        <button
          onClick={handleLaunch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition duration-200"
        >
          {user ? 'Continue to App →' : 'Launch GSAT App →'}
        </button>

        {user ? (
          <p className="text-green-600 text-sm mt-4 font-semibold">
            Logged in as {user.email}
          </p>
        ) : (
          <p className="text-gray-400 text-sm mt-4">
            Free to use · No credit card required
          </p>
        )}

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
          {[
            { icon: '📊', title: '7 Chart Types', desc: 'Distribution curve, histogram, pie, frequency, KDE and more' },
            { icon: '📐', title: 'Folk Statistics', desc: 'Mean, sorting, skewness, kurtosis calculated automatically' },
            { icon: '🖼️', title: '4K Export', desc: 'Download all charts at Ultra HD resolution in one click' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-md text-left">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Grain Size Analysis Tool · Built for sedimentology research
      </footer>
    </div>
  );
}
