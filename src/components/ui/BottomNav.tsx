"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Zap, Users, LogOut, Settings, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-48px)] max-w-[720px] liquid-glass rounded-[48px] p-2 flex items-center justify-between shadow-[0_40px_100px_rgba(0,31,35,0.3)] h-[100px]">
        {navItems.map((item) => {
          if (item.managementOnly && !isManagement) return null;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative z-10 group no-tap-highlight",
                isActive ? "text-white" : "text-text-secondary hover:text-primary-dark transition-colors duration-300"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="liquid-drop"
                  className="absolute inset-x-2 inset-y-1 bg-primary-dark shadow-[0_15px_35px_rgba(49,151,149,0.5)] rounded-[32px] z-[-1]"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                />
              )}
              
              <motion.div 
                animate={{ 
                  y: isActive ? -4 : 0,
                  scale: isActive ? 1.15 : 1
                }}
                className="p-3 transition-transform"
              >
                <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <motion.span 
                initial={false}
                animate={{ 
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 4
                }}
                className="text-[11px] font-black tracking-widest uppercase mt-0.5"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
        
        <div className="w-[1.5px] h-8 bg-black/5 mx-3 opacity-40" />
        
        <button 
          onClick={logout}
          className="flex flex-col items-center justify-center p-4 text-red-500/70 hover:text-red-500 transition-all group"
        >
          <div className="p-3 rounded-[32px] group-hover:bg-red-500/10 transition-all active:scale-90">
            <LogOut size={26} />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Exit
          </span>
        </button>
    </nav>
  );
}
