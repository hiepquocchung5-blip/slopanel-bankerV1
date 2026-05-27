"use client";

import React from 'react';
import { CONFIG } from '@/lib/config';
import { Globe, Cpu, Zap, ShieldCheck } from 'lucide-react';

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[10001] bg-white border-t border-slate-200 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Zap size={14} fill="white" />
            </div>
            <span className="text-[11px] font-black text-slate-900 tracking-widest uppercase">Slopara Banker</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-100 pl-4">
            <span>v2.2 Stable</span>
            <span className="text-teal-600 flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={CONFIG.MAIN_DOMAIN}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Globe size={12} />
            Main_Hub
          </a>
          <p className="hidden md:block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">
            &copy; {currentYear} SLOPARA ENT.
          </p>
        </div>
      </div>
    </footer>
  );
}
