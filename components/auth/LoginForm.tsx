'use client';
import { useState } from 'react';
import { signIn } from '@/services/authService';
import AlertBox from '@/components/ui/AlertBox';

interface Props {
  onSuccess: () => void;
  onSwitch:  () => void;
}

export default function LoginForm({ onSuccess, onSwitch }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess('Login successful! Opening app...');
      setTimeout(onSuccess, 800);
    }
  };

  return (
    <div className="space-y-5">
      <AlertBox type="error"   message={error} />
      <AlertBox type="success" message={success} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password" required value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition duration-200 text-sm"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 font-semibold hover:underline">
          Create one
        </button>
      </p>
    </div>
  );
}
