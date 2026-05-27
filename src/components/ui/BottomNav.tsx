"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, CreditCard, LayoutDashboard, Settings, Users, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const isManagement = user.is_staff || user.is_cashier;

  const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/' },
    { label: 'Payments', icon: CreditCard, href: '/payments' },
    { label: 'Queue', icon: Zap, href: '/queue', managementOnly: true },
    { label: 'Players', icon: Users, href: '/players', managementOnly: true },
    { label: 'Stats', icon: BarChart2, href: '/analytics', managementOnly: true },
    { label: 'Config', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] w-full border-t border-white/8 bg-slate-950/80 backdrop-blur-3xl">
      <div className="max-w-[1440px] mx-auto px-3 md:px-8 py-3 md:py-4">
        <nav className="panel-card flex items-center justify-between gap-3 px-3 md:px-5 py-3">
          <div className="flex flex-1 items-center justify-around md:justify-start md:gap-4">
            {navItems.map((item) => {
              if (item.managementOnly && !isManagement) return null;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 transition-all no-tap-highlight",
                    isActive ? "text-white" : "text-text-secondary hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="banker-nav-pill"
                      className="absolute inset-0 rounded-2xl border border-primary/25 bg-primary/10"
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <item.icon size={22} strokeWidth={isActive ? 2.6 : 2} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
