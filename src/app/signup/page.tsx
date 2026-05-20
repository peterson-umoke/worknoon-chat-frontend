'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Role } from '../../lib/types';

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ username, email, password, role });
      router.push('/inbox');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { value: Role; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'designer', label: 'Designer' },
    { value: 'agent', label: 'Agent' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6 py-10">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-accent shadow-lg">
            <MessageCircle className="h-8 w-8 text-text-on-accent" />
          </div>
          <h1 className="text-3xl font-semibold text-text-primary">Create Account</h1>
          <p className="text-text-secondary text-base">Join the Worknoon chat platform</p>
        </div>

        <div className="rounded-2xl border border-border-glass bg-bg-glass p-10 shadow-glass backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <label htmlFor="username" className="text-sm font-medium text-text-secondary">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="email" className="text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Min 6 characters"
                required
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-text-secondary">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="role" className="text-sm font-medium text-text-secondary">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-bg-accent text-text-on-accent font-medium transition-colors hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-bg-accent hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
