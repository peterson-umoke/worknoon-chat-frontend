'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ emailOrUsername, password });
      router.push('/inbox');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-accent shadow-lg">
            <MessageCircle className="h-8 w-8 text-text-on-accent" />
          </div>
          <h1 className="text-3xl font-semibold text-text-primary">Worknoon Chat</h1>
          <p className="text-text-secondary text-base">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-border-glass bg-bg-glass p-[4rem] shadow-glass backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <label htmlFor="emailOrUsername" className="text-sm font-medium text-text-secondary">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="password" className="text-sm font-medium text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !emailOrUsername || !password}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-bg-accent text-text-on-accent font-medium transition-colors hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-bg-accent hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border-glass bg-bg-glass/50 px-6 py-4 text-center text-xs text-text-muted backdrop-blur-sm">
          Test accounts: admin@worknoon.com, customer@worknoon.com, merchant@worknoon.com
          <br />
          Password: <span className="font-mono">Password123!</span>
        </div>
      </div>
    </div>
  );
}
