'use client';
import { signOut } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

interface HeaderProps {
  onBack: () => void;
}

export default function Header({ onBack }: HeaderProps) {
  const user    = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <header className="text-center mb-8 relative">
      {/* Back to landing — top left */}
      <button
        onClick={onBack}
        className="absolute top-0 left-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-semibold transition duration-200"
      >
        ← Back to Home
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{APP_NAME}</h1>
      <p className="text-md text-gray-600 mt-2 font-bold">{APP_TAGLINE}</p>

      {/* User + sign out — top right */}
      {user && (
        <div className="absolute top-0 right-0 flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition duration-200"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
