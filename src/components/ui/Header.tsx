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

  const isManagement = user.is_staff || user.is_cashier;

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
    <header className="fixed top-0 left-0 right-0 z-[10001] bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1400px] mx-auto">
        {/* IDENTITY ROW */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm group active:scale-95"
            >
              <ChevronLeft size={22} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {pageTitle}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                 <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                   Registry_Node :: v2.2.1
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
               <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{user.username || 'OPERATOR'}</span>
               <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                 LVL: {user.is_staff ? '04_ADMIN' : user.is_cashier ? '03_CASHIER' : '02_AGENT'}
               </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg border-2 border-white">
              <User size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* NAVIGATION ROW - Refined with darker Slate background for contrast */}
        <nav className="bg-slate-900 px-6 py-3.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2.5">
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
                    "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap border-2",
                    isActive 
                      ? "bg-teal-500 text-slate-900 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)] scale-105" 
                      : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
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
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-2 border-red-500/20 active:scale-95 shadow-lg shadow-red-500/5"
          >
            <LogOut size={15} strokeWidth={3} />
            <span className="hidden md:inline">Terminate_Session</span>
            <span className="md:hidden">EXIT</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
