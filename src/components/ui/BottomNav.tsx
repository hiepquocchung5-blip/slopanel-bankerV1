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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-[540px]">
      <nav className="liquid-glass rounded-[32px] p-2 flex items-center justify-between shadow-card relative overflow-hidden h-[80px]">
        {navItems.map((item) => {
          if (item.managementOnly && !isManagement) return null;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 relative z-10 group",
                isActive ? "text-white" : "text-text-secondary hover:text-primary-dark"
              )}
            >
              <div className={cn(
                "p-3 rounded-[20px] transition-all duration-500",
                isActive ? "bg-primary-dark shadow-[0_8px_20px_rgba(126,97,255,0.4)] scale-110 -translate-y-1" : "group-hover:bg-primary/10"
              )}>
                <item.icon size={22} className={cn("transition-transform", isActive && "animate-float")} />
              </div>
              <span className={cn(
                "text-[8px] font-black tracking-widest uppercase mt-1 transition-all duration-500",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <div className="w-[1px] h-8 bg-black/5 mx-2" />
        
        <button 
          onClick={logout}
          className="flex flex-col items-center justify-center p-3 text-red-500/60 hover:text-red-500 transition-all group"
        >
          <div className="p-3 rounded-[20px] group-hover:bg-red-500/10 transition-all">
            <LogOut size={22} />
          </div>
          <span className="text-[8px] font-black tracking-widest uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Exit
          </span>
        </button>
      </nav>
    </div>
  );
}
