import React from 'react';
import { CONFIG } from '@/lib/config';
import { ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-6 pt-10 pb-6 border-b border-white/10 bg-black/60 backdrop-blur-3xl sticky top-0 z-50 flex justify-between items-end">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gold rounded-full shadow-[0_0_15px_#D4AF37]" />
          <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">{title}</h1>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className="px-3 py-1 bg-gold/10 text-gold text-[9px] border border-gold/20 rounded-full uppercase tracking-[0.2em] font-black shadow-[0_0_15px_rgba(212,175,55,0.05)]">
          Treasury Active
        </span>
        <a 
          href={CONFIG.MAIN_DOMAIN} 
          className="text-[9px] text-gray-500 hover:text-white transition-all uppercase font-black tracking-widest border border-white/5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center gap-2 group"
        >
          Exit to Floor
          <LogOut size={12} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
