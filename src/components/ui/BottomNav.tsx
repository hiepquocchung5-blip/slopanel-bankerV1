"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Zap, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isManagement = user.is_staff || user.is_cashier;

  const navItems = [
    { label: 'DASH', icon: LayoutDashboard, href: '/' },
    { label: 'PAY', icon: CreditCard, href: '/payments' },
    { label: 'QUEUE', icon: Zap, href: '/queue', managementOnly: true },
    { label: 'USERS', icon: Users, href: '/players', managementOnly: true },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[440px] h-[76px] bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] flex items-center justify-around z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-visible">
      {navItems.map((item) => {
        if (item.managementOnly && !isManagement) return null;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 relative group",
              isActive ? "text-gold" : "text-gray-500 hover:text-white"
            )}
          >
            {isActive && (
               <>
                 <div className="absolute -top-3 w-12 h-12 bg-gold/10 blur-xl rounded-full" />
                 <div className="absolute top-0 w-10 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_15px_#D4AF37]" />
               </>
            )}
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-500",
              isActive ? "bg-white/5 scale-110 -translate-y-2 shadow-[0_8px_20px_rgba(212,175,55,0.15)]" : "group-hover:bg-white/5"
            )}>
              <item.icon size={22} className={cn("transition-all duration-500", isActive && "drop-shadow-[0_0_8px_#D4AF37]")} />
            </div>
            <span className={cn(
              "text-[8px] font-black tracking-[0.2em] uppercase mt-1 transition-all duration-500",
              isActive ? "opacity-100 translate-y-[-2px]" : "opacity-40"
            )}>{item.label}</span>
          </Link>
        );
      })}
      
      <button 
        onClick={logout}
        className="flex flex-col items-center justify-center flex-1 h-full text-red-500/60 hover:text-red-500 transition-all duration-300 group"
      >
        <div className="p-2 rounded-2xl group-hover:bg-red-500/10">
          <LogOut size={22} />
        </div>
        <span className="text-[8px] font-black tracking-[0.2em] uppercase mt-1 opacity-40 group-hover:opacity-100">EXIT</span>
      </button>
    </nav>
  );
}
