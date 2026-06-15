'use client';

import { signOut } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  onBack: () => void;
}

export default function Header({ onBack }: HeaderProps) {
  const setUser = useAuthStore((state) => state.setUser);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <header className="relative text-center mb-8">
      <button
        type="button"
        onClick={onBack}
        className="absolute left-0 top-1 text-sm text-gray-500 hover:text-blue-600 font-semibold transition"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={handleSignOut}
        className="absolute right-0 top-0 text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition"
      >
        Sign Out
      </button>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">GSAT</h1>
      <p className="text-md text-gray-600 mt-2 font-bold">
        Dynamic Sieve Modeling &amp; Statistics
      </p>
    </header>
  );
}
