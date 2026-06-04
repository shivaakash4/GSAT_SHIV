'use client';
import { useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface Props {
  onSuccess?: () => void;
}

export default function AuthModal({ onSuccess }: Props) {
  const { isOpen, tab, closeModal, setTab } = useModalStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    closeModal();
    onSuccess?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Grain Size Analysis Tool</h2>
          <p className="text-gray-500 text-sm mt-1">
            {tab === 'login' ? 'Sign in to access the app' : 'Create a free account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition duration-200 ${
              tab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition duration-200 ${
              tab === 'signup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        {tab === 'login'
          ? <LoginForm  onSuccess={handleSuccess} onSwitch={() => setTab('signup')} />
          : <SignupForm onSuccess={handleSuccess} onSwitch={() => setTab('login')}  />
        }
      </div>
    </div>
  );
}
