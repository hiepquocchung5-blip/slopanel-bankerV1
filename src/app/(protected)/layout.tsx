"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/ui/BottomNav';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-container">
       <div className="portal-bg" />

       <Header />

       <main className="portal-shell relative z-10 w-full min-h-screen pt-36 pb-40 px-4 md:px-8">
          <div className="max-w-[1440px] mx-auto">
             {children}
          </div>
          <Footer />
       </main>

       <BottomNav />
    </div>
  );
}
