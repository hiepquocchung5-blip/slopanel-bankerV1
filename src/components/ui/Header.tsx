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
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Divider } from "@heroui/react";

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
        {/* TOP LEVEL: Identity */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-4">
            <Button 
              isIconOnly
              onPress={() => router.back()}
              variant="flat"
              className="bg-slate-50 text-slate-600 border border-slate-200"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </Button>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {pageTitle}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">
                   Secure_Registry :: v2.2
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-1">
               <span className="text-[12px] font-black text-slate-900 uppercase">{user.username || 'Operator'}</span>
               <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">
                 LVL: {user.is_staff ? '04' : user.is_cashier ? '03' : '02'}
               </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* NAVIGATION LEVEL: Fixed Under Title */}
        <nav className="px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
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
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap border-2",
                    isActive 
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm" 
                      : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
                  )}
                >
                  <item.icon size={14} strokeWidth={isActive ? 3 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          <Button 
            onPress={logout}
            variant="flat"
            color="danger"
            size="sm"
            className="font-black text-[10px] tracking-widest uppercase border-2 border-red-100 px-4"
            startContent={<LogOut size={14} strokeWidth={3} />}
          >
            Session_End
          </Button>
        </nav>
      </div>
    </header>
  );
}
