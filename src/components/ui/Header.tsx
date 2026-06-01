"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, User, LayoutDashboard, CreditCard, 
  Zap, Users, LogOut, Settings, BarChart2, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  managementOnly?: boolean;
  adminOnly?: boolean;
}

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems: NavItem[] = [
    { label: 'Dash', icon: LayoutDashboard, href: '/' },
    { label: 'Payments', icon: CreditCard, href: '/payments' },
    { label: 'Requests', icon: Zap, href: '/requests', managementOnly: true },
    { label: 'Agents', icon: ShieldAlert, href: '/agents', adminOnly: true },
    { label: 'Players', icon: Users, href: '/players', managementOnly: true },
    { label: 'Stats', icon: BarChart2, href: '/analytics', managementOnly: true },
    { label: 'Configs', icon: Settings, href: '/settings' },
  ];

  const currentItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentItem?.label || 'Terminal';

  const isImpersonating = typeof window !== 'undefined' && !!sessionStorage.getItem('original_banker_token');

  const handleSwitchBack = () => {
    const originalToken = sessionStorage.getItem('original_banker_token');
    if (originalToken) {
      localStorage.setItem('banker_token', originalToken);
      sessionStorage.removeItem('original_banker_token');
      window.location.href = '/';
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[10001] border-b border-white/20 bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(15,23,42,0.08)]">
      {isImpersonating && (
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between animate-in slide-in-from-top duration-500 border-b border-white/10">
           <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Support Mode: Impersonating {user.phone_number}</span>
           </div>
           <button 
             onClick={handleSwitchBack}
             className="bg-amber-500 text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-amber-400 transition-colors"
           >
              Return to Admin
           </button>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <button
              onClick={() => router.back()}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-500 transition-all hover:-translate-y-0.5 hover:bg-white hover:text-teal-600 hover:shadow-md active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft size={20} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  {pageTitle}
                </h1>
                <div className="hidden h-5 items-center rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-teal-600 ring-1 ring-inset ring-teal-500/20 sm:flex">
                  V1_BANKER
                </div>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                </span>
                <span>SYSTEM_NODE :: ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-black uppercase tracking-tight text-slate-900">
                {user.username || 'OPERATOR'}
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600/80">
                  {user.is_staff ? 'ADMIN_LVL_04' : user.is_cashier ? 'CASHIER_LVL_03' : 'AGENT_LVL_02'}
                </span>
                <ShieldAlert size={10} className="text-teal-500" />
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-slate-100 transition-transform hover:scale-105">
              <User size={18} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <nav className="no-scrollbar -mx-2 mb-3 flex items-center justify-between gap-6 overflow-x-auto pb-1 px-2">
          <div className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isAgent = !user.is_staff && !user.is_cashier;
              if (item.managementOnly && isAgent) return null;
              if (item.adminOnly && !user.is_staff) return null;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300",
                    isActive
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon 
                    size={14} 
                    strokeWidth={isActive ? 3 : 2.5} 
                    className={cn("transition-transform group-hover:scale-110", isActive && "rotate-3")} 
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
          >
            <LogOut size={14} strokeWidth={3} />
            <span className="hidden lg:inline">TERMINATE_SESSION</span>
            <span className="lg:hidden">EXIT</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
