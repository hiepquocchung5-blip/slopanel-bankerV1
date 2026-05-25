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

  const isAdmin = user.is_staff;

  const navItems = [
    { label: 'DASH', icon: LayoutDashboard, href: '/' },
    { label: 'PAY', icon: CreditCard, href: '/payments' },
    { label: 'QUEUE', icon: Zap, href: '/queue', adminOnly: true },
    { label: 'USERS', icon: Users, href: '/players', adminOnly: true },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 h-[72px] bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/5 rounded-[28px] flex items-center justify-around z-[100] shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden md:max-w-[500px] md:left-1/2 md:-translate-x-1/2">
      {navItems.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative",
              isActive ? "text-gold translate-y-[-4px]" : "text-gray-500 hover:text-white"
            )}
          >
            {isActive && (
               <div className="absolute top-0 w-8 h-[2px] bg-gold shadow-[0_0_10px_#D4AF37]" />
            )}
            <item.icon size={22} className={cn("mb-1", isActive && "drop-shadow-[0_0_12px_#D4AF37]")} />
            <span className="text-[9px] font-black tracking-widest uppercase">{item.label}</span>
          </Link>
        );
      })}
      
      <button 
        onClick={logout}
        className="flex flex-col items-center justify-center flex-1 h-full text-red-500/80 hover:text-red-500 transition-colors"
      >
        <LogOut size={22} className="mb-1" />
        <span className="text-[9px] font-black tracking-widest uppercase">EXIT</span>
      </button>
    </nav>
  );
}
