"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Zap, Users, LogOut, Settings, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isManagement = user.is_staff || user.is_cashier;

  const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/' },
    { label: 'Payments', icon: CreditCard, href: '/payments' },
    { label: 'Queue', icon: Zap, href: '/queue', managementOnly: true },
    { label: 'Players', icon: Users, href: '/players', managementOnly: true },
    { label: 'Stats', icon: BarChart2, href: '/analytics', managementOnly: true },
    { label: 'Configs', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-6 pb-10 pointer-events-none flex justify-center">
      <nav className="liquid-glass rounded-[48px] p-2 flex items-center justify-between shadow-[0_30px_80px_rgba(0,31,35,0.3)] border border-white/80 h-[96px] w-full max-w-[680px] pointer-events-auto">
        {navItems.map((item) => {
          if (item.managementOnly && !isManagement) return null;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 relative z-10 group",
                isActive ? "text-aqua-white" : "text-text-secondary hover:text-primary-dark"
              )}
            >
              <div className={cn(
                "p-4 rounded-[32px] transition-all duration-500",
                isActive ? "bg-primary-dark shadow-[0_15px_35px_rgba(49,151,149,0.5)] scale-110 -translate-y-4" : "group-hover:bg-primary/10"
              )}>
                <item.icon size={28} className={cn("transition-transform", isActive && "animate-float")} />
              </div>
              <span className={cn(
                "text-[11px] font-black tracking-widest uppercase mt-1 transition-all duration-500",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <div className="w-[2px] h-10 bg-black/5 mx-4" />
        
        <button 
          onClick={logout}
          className="flex flex-col items-center justify-center p-4 text-red-500/80 hover:text-red-600 transition-all group"
        >
          <div className="p-4 rounded-[32px] group-hover:bg-red-500/10 transition-all">
            <LogOut size={28} />
          </div>
          <span className="text-[11px] font-black tracking-widest uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Exit
          </span>
        </button>
      </nav>
    </div>
  );
}
