import React from 'react';
import { CONFIG } from '@/lib/config';
import { ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-6 pt-10 pb-6 bg-white/40 backdrop-blur-2xl sticky top-0 z-50 flex justify-between items-end border-b border-black/5 shadow-soft">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary-dark rounded-full shadow-[0_0_15px_rgba(126,97,255,0.3)]" />
          <h1 className="text-2xl font-black text-text-primary tracking-[0.1em] uppercase">{title}</h1>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(187,167,255,0.8)]" />
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className="px-4 py-1.5 bg-primary/10 text-primary-dark text-[9px] border border-primary/20 rounded-full uppercase tracking-[0.2em] font-black shadow-soft">
          Secure Terminal
        </span>
        <a 
          href={CONFIG.MAIN_DOMAIN} 
          className="text-[10px] text-text-secondary hover:text-primary-dark transition-all uppercase font-black tracking-widest flex items-center gap-2 group"
        >
          Exit to Floor
          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>
      </div>
    </div>
  );
}
