"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Loader2 } from 'lucide-react';
import { Spinner } from "@heroui/react";

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
        <Spinner size="lg" color="primary" label="Secure Handshake..." labelColor="primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Background Glows (Stationary) */}
       <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[40%] bg-teal-500/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-[0%] right-[-5%] w-[60%] h-[30%] bg-teal-600/5 rounded-full blur-[120px]" />
       </div>

       <Header />

       {/* MAIN CONTENT: Centered and Padded between Fixed Bars */}
       <main className="relative z-10 w-full flex-1 flex flex-col pt-[160px] pb-[80px]">
          <div className="w-full max-w-[1400px] mx-auto px-6 flex-1">
             {children}
          </div>
       </main>

       <Footer />
    </div>
  );
}
