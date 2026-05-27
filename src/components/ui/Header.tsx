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
        <div className="px-6 py-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
            >
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {pageTitle}
              </h1>
              <div className="h-[2px] w-full bg-teal-600/20 my-2 rounded-full" />
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                   Secure_Link :: Active
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-1">
               <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{user.username || 'Operator'}</span>
               <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                 LVL: {user.is_staff ? '04' : user.is_cashier ? '03' : '02'}
               </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
              <User size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* NAVIGATION ROW */}
        <nav className="px-6 py-4 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
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
                    "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap border-2",
                    isActive 
                      ? "bg-teal-600 text-white border-teal-600 shadow-md scale-105" 
                      : "text-slate-400 border-transparent hover:border-slate-200 hover:text-slate-600"
                  )}
                >
                  <item.icon size={16} strokeWidth={isActive ? 3 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border-2 border-red-100"
          >
            <LogOut size={16} strokeWidth={3} />
            Term_Session
          </button>
        </nav>
      </div>
    </header>
  );
}
