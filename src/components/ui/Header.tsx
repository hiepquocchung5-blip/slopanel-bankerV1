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

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/' },
    { label: 'Payments', icon: CreditCard, href: '/payments' },
    { label: 'Queue', icon: Zap, href: '/queue' },
    { label: 'Players', icon: Users, href: '/players', managementOnly: true },
    { label: 'Roles', icon: ShieldAlert, href: '/roles', adminOnly: true },
    { label: 'Stats', icon: BarChart2, href: '/analytics', managementOnly: true },
    { label: 'Configs', icon: Settings, href: '/settings' },
  ];

  const currentItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentItem?.label || 'Terminal';

  return (
    <header className="fixed inset-x-0 top-0 z-[10001] border-b border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[5.25rem] items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <button
              onClick={() => router.back()}
              className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-100 active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft size={22} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-black uppercase tracking-tight text-slate-900 sm:text-xl">
                  {pageTitle}
                </h1>
                <span className="hidden rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-teal-700 sm:inline-flex">
                  V1 Release
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span>Registry_Node :: v1.0.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-end rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right sm:flex">
              <span className="text-[12px] font-black uppercase tracking-tight text-slate-900">
                {user.username || 'OPERATOR'}
              </span>
              <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-teal-600">
                LVL: {user.is_staff ? '04_ADMIN' : user.is_cashier ? '03_CASHIER' : '02_AGENT'}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-lg">
              <User size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <nav className="no-scrollbar -mx-1 mb-4 flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-2 px-1">
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
                    "flex items-center gap-2.5 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                    isActive
                      ? "border-teal-500 bg-teal-500 text-slate-950 shadow-[0_0_0_1px_rgba(13,148,136,0.15),0_12px_28px_rgba(13,148,136,0.24)]"
                      : "border-slate-200 bg-white/80 text-slate-500 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  )}
                >
                  <item.icon size={15} strokeWidth={isActive ? 3 : 2} className={cn("transition-transform", isActive && "rotate-3")} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:text-white active:scale-95"
          >
            <LogOut size={15} strokeWidth={3} />
            <span className="hidden md:inline">Terminate_Session</span>
            <span className="md:hidden">Exit</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
