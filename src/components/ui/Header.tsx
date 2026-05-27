"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CONFIG } from '@/lib/config';
import { LogOut, ChevronLeft, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Payments', href: '/payments' },
    { label: 'Queue', href: '/queue' },
    { label: 'Players', href: '/players' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' },
  ];

  const currentItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentItem?.label || 'Banker Portal';

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-[10001] w-full"
    >
      <div className="liquid-glass px-6 py-4 flex items-center justify-between shadow-soft border-b border-white/60">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-text-primary hover:bg-primary/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-text-primary tracking-tight uppercase leading-none">{pageTitle}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
               <div className="w-1.5 h-1.5 bg-primary-dark rounded-full animate-pulse shadow-[0_0_8px_#4fd1c5]" />
               <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
                 Secure Node: slopara.v2
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end border-r border-black/5 pr-4">
             <span className="text-[11px] font-black text-text-primary uppercase tracking-wider">{user.username || 'Staff'}</span>
             <span className="text-[9px] font-bold text-primary-dark uppercase tracking-widest opacity-70">
               {user.is_staff ? 'ADMIN_SEC_4' : 'CASHIER_SEC_3'}
             </span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark shadow-soft">
            <User size={20} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
