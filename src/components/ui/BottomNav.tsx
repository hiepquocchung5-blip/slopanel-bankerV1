"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Zap, Users, LogOut, Settings, BarChart2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isManagement = user.is_staff || user.is_cashier;

  const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/' },
    { label: 'Payments', icon: CreditCard, href: '/payments' },
    { label: 'Queue', icon: Zap, href: '/queue', managementOnly: true },
    { label: 'Players', icon: Users, href: '/players', managementOnly: true },
    { label: 'Roles', icon: ShieldAlert, href: '/roles', adminOnly: true },
    { label: 'Stats', icon: BarChart2, href: '/analytics', managementOnly: true },
    { label: 'Configs', icon: Settings, href: '/settings' },
  ];

  return (
    <nav className="bg-slate-50 border-b border-slate-200 py-3 overflow-x-auto">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            if (item.managementOnly && !isManagement) return null;
            if (item.adminOnly && !user.is_staff) return null;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap",
                  isActive 
                    ? "bg-teal-600 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
        >
          <LogOut size={16} />
          Exit
        </button>
      </div>
    </nav>
  );
}
