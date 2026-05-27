"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CreditCard, Zap, Users, LogOut, Settings, BarChart2, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function FloatingSuperBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isManagement = user.is_staff || user.is_cashier;

  const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/' },
    { label: 'Pay', icon: CreditCard, href: '/payments' },
    { label: 'Queue', icon: Zap, href: '/queue', managementOnly: true },
    { label: 'Users', icon: Users, href: '/players', managementOnly: true },
    { label: 'Stats', icon: BarChart2, href: '/analytics', managementOnly: true },
    { label: 'Sets', icon: Settings, href: '/settings' },
  ];

  // Get current page title for the header-in-nav
  const currentItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentItem?.label || 'Banker';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-32px)] max-w-[760px] pointer-events-none">
      <div className="super-bar pointer-events-auto">
        {/* HEADER SECTION - Integrated in the Nav Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-black/5 mb-1">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => router.back()}
               className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-text-primary hover:bg-primary/10 transition-colors"
             >
                <ChevronLeft size={18} />
             </button>
             <div>
                <h1 className="text-[14px] font-black text-text-primary uppercase tracking-widest">{pageTitle}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-primary-dark rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Secure Node</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black text-text-primary uppercase">{user.username || 'Staff'}</span>
                <span className="text-[8px] font-bold text-primary-dark uppercase tracking-widest">
                  {user.is_staff ? 'ADMIN_SEC_4' : 'CASHIER_SEC_3'}
                </span>
             </div>
             <button 
               onClick={logout}
               className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
             >
                <LogOut size={18} />
             </button>
          </div>
        </div>

        {/* NAVIGATION LINKS SECTION */}
        <div className="flex items-center justify-around h-[64px]">
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
                    layoutId="liquid-drop-super"
                    className="absolute inset-x-1.5 inset-y-1 bg-primary-dark shadow-[0_10px_25px_rgba(49,151,149,0.5)] rounded-[24px] z-[-1]"
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
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.1 : 1
                  }}
                  className="p-2 transition-transform"
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                
                <motion.span 
                  initial={false}
                  animate={{ 
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.8
                  }}
                  className="text-[9px] font-black tracking-widest uppercase -mt-1"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
