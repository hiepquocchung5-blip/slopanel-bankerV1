import React from 'react';
import { CONFIG } from '@/lib/config';
import { ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-6 pt-10 pb-6 bg-white/60 backdrop-blur-3xl sticky top-0 z-50 flex justify-between items-end border-b border-black/5 shadow-soft">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary-dark rounded-full shadow-[0_0_20px_rgba(79,209,197,0.4)]" />
          <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">{title}</h1>
        </div>
        <div className="flex items-center gap-2 ml-5">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#4fd1c5]" />
          <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-3">
        <div className="px-5 py-1.5 bg-primary/10 text-primary-dark text-[10px] border border-primary/20 rounded-full uppercase tracking-[0.3em] font-black shadow-soft">
          Registry v2.1
        </div>
        <a 
          href={CONFIG.MAIN_DOMAIN} 
          className="btn-secondary h-10 px-5 text-[10px] shadow-soft"
        >
          Exit System
          <LogOut size={14} />
        </a>
      </div>
    </div>
  );
}
