"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import LiveClock from './LiveClock';

const routeLabels: Record<string, string> = {
  '/': 'Control Dashboard',
  '/payments': 'Gateway Config',
  '/queue': 'Approval Queue',
  '/players': 'Player Registry',
  '/analytics': 'Live Analytics',
  '/settings': 'System Config',
};

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const title = routeLabels[pathname] || 'Banker Portal';
  const clearance = user.is_staff ? 'ADMIN' : user.is_cashier ? 'CASHIER' : 'AGENT';

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-[10001] w-full border-b border-white/8 bg-slate-950/70 backdrop-blur-3xl"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 md:py-5">
        <div className="panel-card flex items-center justify-between gap-4 px-4 md:px-6 py-4">
          <div className="flex items-center gap-4 md:gap-5 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-white hover:border-primary/30 hover:bg-primary/10 transition-all"
            >
              <ChevronLeft size={20} strokeWidth={2.6} />
            </button>

            <div className="min-w-0">
              <p className="page-kicker">Banker Portal</p>
              <h1 className="text-xl md:text-2xl font-black tracking-[-0.05em] uppercase truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-3">
            <LiveClock />
            <div className="nav-pill px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center text-primary">
                <Shield size={17} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.24em] uppercase text-text-secondary">
                  Clearance
                </p>
                <p className="text-xs font-black tracking-[0.18em] uppercase">
                  {clearance}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] font-black uppercase tracking-[0.24em] text-text-secondary">
                {user.username || 'Staff'}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-primary">
                {user.phone_number}
              </span>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-white/6 border border-white/8 flex items-center justify-center text-white">
              <User size={18} />
            </div>

            <button
              onClick={logout}
              className="btn-secondary h-11 px-4 md:px-5 border-white/8"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
