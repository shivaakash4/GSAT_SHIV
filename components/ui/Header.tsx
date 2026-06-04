'use client';
import { signOut } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

interface HeaderProps {
  onBack: () => void;
  onDownload?: () => void;
}

export default function Header({ onBack, onDownload }: HeaderProps) {
  const user    = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <header className="mb-4">
      {/* Top row: back | title | actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Left — back button */}
        <button
          onClick={onBack}
          className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-semibold transition duration-200"
        >
          ← Back
        </button>

        {/* Centre — app name */}
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 text-center leading-tight">{APP_NAME}</h1>

        {/* Right — download + sign out */}
        {user ? (
          <div className="shrink-0 flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Download Charts</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Keep right side balanced when no user */
          <div className="shrink-0 w-16" />
        )}
      </div>

      {/* Tagline — centred below */}
      <p className="text-sm text-gray-600 font-bold text-center mt-1">{APP_TAGLINE}</p>
    </header>
  );
}
