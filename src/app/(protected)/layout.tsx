"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import NotificationCenter from '@/components/ui/NotificationCenter';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="text-teal-600 animate-spin" />
        <span className="text-sm font-black uppercase tracking-widest text-slate-400">Secure Handshake...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.10),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <Header />
      <NotificationCenter />

      <main
        className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: 'calc(var(--header-height) + 1.5rem)',
          paddingBottom: 'calc(var(--footer-height) + 1.75rem)',
        }}
      >
        <div className="surface-shell w-full rounded-[40px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
