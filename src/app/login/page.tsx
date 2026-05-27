"use client";

import React, { useState } from 'react';
import { AlertTriangle, Lock, Loader2, Phone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await login(phone, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 md:px-6">
      <div className="portal-bg" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="premium-card p-8 md:p-10 lg:p-12">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(0,215,255,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.18),_transparent_24%)]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
              <Sparkles size={12} />
              Banker access console
            </div>

            <div className="mt-8 space-y-5">
              <p className="page-kicker">Gameconfig-style operator portal</p>
              <h1 className="page-title max-w-xl uppercase">
                Secure access for cashier, agent, and admin operations.
              </h1>
              <p className="max-w-xl text-sm md:text-base leading-relaxed text-text-secondary">
                Sign in to manage payment rails, review queues, tune player access, and supervise live service activity from a compact control panel.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Live queue', value: 'Realtime' },
                { label: 'Role aware', value: 'Clearance' },
                { label: 'Session', value: 'Encrypted' },
              ].map((item) => (
                <div key={item.label} className="nav-pill p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-black uppercase tracking-[-0.03em]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                <ShieldCheck size={14} className="text-success" />
                Session integrity enforced
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2">
                <Zap size={14} className="text-primary" />
                Fast portal response
              </div>
            </div>
          </div>
        </section>

        <section className="panel-card p-6 md:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-kicker">Login</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">
                Authorize session
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
              <Lock size={20} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="relative">
              <Phone size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-modern pl-14"
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern pl-14"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating</span>
                </>
              ) : (
                <span>Enter portal</span>
              )}
            </button>
          </form>

          <div className="soft-divider my-8" />

          <div className="grid gap-3 text-sm text-text-secondary">
            <div className="nav-pill flex items-center gap-3 px-4 py-3">
              <ShieldCheck size={16} className="text-primary" />
              <span className="font-semibold">Restricted to approved staff accounts.</span>
            </div>
            <div className="nav-pill flex items-center gap-3 px-4 py-3">
              <Zap size={16} className="text-success" />
              <span className="font-semibold">Optimized for mobile and desktop control use.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
