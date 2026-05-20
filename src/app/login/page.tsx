'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Loader2, Calendar, Clock, Menu, MessageSquare } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f3f7fa,rgba(243,247,250,0.8))] px-6 py-12">
      <div className="w-full max-w-6xl animate-fade-in">
        <div className="rounded-md bg-white shadow-md border border-border-glass overflow-hidden">
          <div className="flex">
            {/* Left icon rail */}
            <aside className="hidden md:flex w-[60px] flex-col items-center gap-1 py-6 border-r border-gray-100 bg-white">
              <div className="relative w-full flex items-center justify-center py-3 text-bg-accent before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r before:bg-bg-accent">
                <MessageCircle className="h-[18px] w-[18px]" />
              </div>
              <div className="w-full flex items-center justify-center py-3 text-slate-400 hover:text-slate-600">
                <Calendar className="h-[18px] w-[18px]" />
              </div>
              <div className="w-full flex items-center justify-center py-3 text-slate-400 hover:text-slate-600">
                <MessageSquare className="h-[18px] w-[18px]" />
              </div>
              <div className="w-full flex items-center justify-center py-3 text-slate-400 hover:text-slate-600">
                <Clock className="h-[18px] w-[18px]" />
              </div>
            </aside>

            {/* Content area: left intro, right form */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
              <div className="hidden md:flex flex-col justify-center px-10 py-12 border-r border-gray-100">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Worknoon Chat</div>
                <p className="text-slate-700 text-sm leading-relaxed max-w-xs">Manage real-time conversations with your customers — all in one place.</p>
                <ul className="mt-8 flex flex-col gap-3">
                  <li className="flex items-center gap-2 text-sm text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-bg-accent flex-shrink-0" />Live conversations</li>
                  <li className="flex items-center gap-2 text-sm text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-bg-accent flex-shrink-0" />Role-based access</li>
                  <li className="flex items-center gap-2 text-sm text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-bg-accent flex-shrink-0" />WooCommerce integration</li>
                </ul>
              </div>

                <div className="flex items-center justify-center px-8 py-10">
                <div className="w-full max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-accent">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h1 className="text-base font-semibold text-slate-800 leading-tight" style={{fontSize:'16px'}}>Sign in to Worknoon Chat</h1>
                    </div>
                  </div>

                  <div className="rounded-md border border-border-glass bg-white p-5 shadow-md text-slate-900">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 form-login">
                      {error && (
                        <div className="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
                          {error}
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="emailOrUsername" className="text-sm font-medium text-slate-700">
                          Email or Username
                        </label>
                        <input
                          id="emailOrUsername"
                          type="text"
                          value={emailOrUsername}
                          onChange={(e) => setEmailOrUsername(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-slate-900 text-sm placeholder:text-slate-400 focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-slate-900 text-sm placeholder:text-slate-400 focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !emailOrUsername || !password}
                        className="mt-2 w-full flex h-12 items-center justify-center gap-2 rounded-md bg-bg-accent text-text-on-accent font-medium transition-colors duration-150 hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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


                  </div>

                  <div className="mt-4 text-xs text-text-muted text-center">
                    Test accounts: admin@worknoon.com · Password: <span className="font-mono">Password123!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
