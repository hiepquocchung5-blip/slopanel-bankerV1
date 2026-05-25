import React from 'react';
import { CONFIG } from '@/lib/config';
import { ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-6 pt-12 pb-8 border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">{title}</h1>
          <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[9px] border border-green-500/20 rounded-lg uppercase tracking-[0.2em] font-black animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            Treasury Active
          </span>
        </div>
        <p className="text-[10px] font-bold text-gold/70 mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]" />
          {subtitle}
        </p>
      </div>
      <a 
        href={CONFIG.MAIN_DOMAIN} 
        className="text-[9px] text-gray-500 hover:text-white transition uppercase font-black tracking-widest border border-white/5 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-md"
      >
        Exit to Floor
      </a>
    </div>
  );
}
