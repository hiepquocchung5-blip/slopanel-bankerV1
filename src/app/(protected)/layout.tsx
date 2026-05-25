"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/ui/BottomNav';
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
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 size={40} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050508] relative pb-32">
       {/* Background Glow */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[30%] bg-red-900/5 rounded-full blur-[100px]" />
       </div>

       <main className="relative z-10 mx-auto w-full max-w-[1000px] md:border-x md:border-white/5 min-h-screen bg-surface/40 backdrop-blur-sm">
          {children}
       </main>

       <BottomNav />
    </div>
  );
}
