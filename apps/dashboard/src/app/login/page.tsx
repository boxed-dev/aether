'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@aether-link/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <GlassCard size="lg" className="shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-glass-text tracking-tight">Welcome Back</h1>
              <p className="text-glass-subtext text-lg">Sign in to your account</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-glass-subtext mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 text-glass-text focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 focus:outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-glass-subtext">
                      Password
                    </label>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 text-glass-text focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 focus:outline-none transition-all shadow-sm"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl bg-accent-blue hover:bg-accent-hover text-white text-lg font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm font-medium text-glass-subtext">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-accent-blue hover:text-accent-hover hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}