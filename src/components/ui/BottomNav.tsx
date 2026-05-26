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
    <nav className="glass-nav">
      {navItems.map((item) => {
        if (item.managementOnly && !isManagement) return null;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 relative group",
              isActive ? "text-white" : "text-text-secondary hover:text-primary-dark"
            )}
          >
            <div className={cn(
              "transition-all duration-500",
              isActive ? "nav-active" : "p-3 rounded-2xl group-hover:bg-primary/10"
            )}>
              <item.icon size={22} className={cn("transition-all", isActive && "scale-110")} />
            </div>
            {!isActive && (
              <span className="text-[8px] font-black tracking-[0.2em] uppercase mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
      
      <button 
        onClick={logout}
        className="flex flex-col items-center justify-center text-red-500/60 hover:text-red-500 transition-all group"
      >
        <div className="p-3 rounded-2xl group-hover:bg-red-500/10 transition-colors">
          <LogOut size={22} />
        </div>
        <span className="text-[8px] font-black tracking-[0.2em] uppercase mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
          EXIT
        </span>
      </button>
    </nav>
  );
}
