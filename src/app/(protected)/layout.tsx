"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/ui/BottomNav';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={40} className="text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-container">
       <Header />
       <TopNav />

       <main className="w-full max-w-[1400px] mx-auto px-6 py-12 flex-1">
          {children}
       </main>
       
       <Footer />
    </div>
  );
}
