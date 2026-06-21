'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    // Clear errors when navigating to this page
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic frontend checks
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email';
    
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      // Handled by context error
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-[#09090b]">
      {/* Background abstract gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] animate-fade-in z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3 text-indigo-400">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Welcome to TrackFlow</h1>
          <p className="text-sm text-zinc-400 mt-1.5">Manage your job application pipeline</p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/20 rounded-lg flex gap-3 text-sm text-red-400 items-start">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                  }}
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                  }}
                  disabled={loading}
                />
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {formErrors.password}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full justify-center mt-2 py-2.5" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
