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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="text-primary-dark animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-container">
       {/* Global Aqua Background Glows */}
       <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[40%] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[0%] right-[-5%] w-[60%] h-[30%] bg-primary-dark/5 rounded-full blur-[120px]" />
       </div>

       <Header />

       <main className="relative z-10 w-full min-h-screen pt-24 pb-40">
          {children}
          <Footer />
       </main>

       <BottomNav />
    </div>
  );
}
