"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: 'System Dashboard', href: '/' },
    { label: 'Payment Protocols', href: '/payments' },
    { label: 'Financial Queue', href: '/queue' },
    { label: 'User Registry', href: '/players' },
    { label: 'Network Stats', href: '/analytics' },
    { label: 'Core Configuration', href: '/settings' },
  ];

  const currentItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentItem?.label || 'Management Terminal';

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
              {pageTitle}
            </h1>
            <div className="h-[2px] w-full bg-slate-100 my-2" />
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 SLOPARA_SECURE_AUTH
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-[12px] font-black text-slate-900 uppercase">{user.username || 'Staff'}</span>
             <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">
               LVL: {user.is_staff ? 'ADMIN' : user.is_cashier ? 'CASHIER' : 'AGENT'}
             </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
            <User size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </header>
  );
}
