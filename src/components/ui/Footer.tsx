"use client";

import React from 'react';
import { CONFIG } from '@/lib/config';
import { ShieldCheck, Globe, Cpu, Zap } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 px-6 pb-40">
      <div className="glass-card p-10 relative overflow-hidden border-black/5">
        {/* Subtle Background Glow */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary-dark flex items-center justify-center text-white shadow-soft">
                <Zap size={18} fill="white" />
              </div>
              <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">SLOPARA BANKER</h2>
            </div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] leading-relaxed mb-8 opacity-60">
              The ultimate high-performance terminal for modern casino management and real-time financial oversight.
            </p>
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Version</span>
                  <span className="text-xs font-black text-primary-dark">v2.1.0-STABLE</span>
               </div>
               <div className="w-[1px] h-8 bg-black/5" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Integrity</span>
                  <span className="text-xs font-black text-green-600 flex items-center gap-1">
                    VERIFIED <ShieldCheck size={12} />
                  </span>
               </div>
            </div>
          </div>

          <div className="flex flex-col justify-between items-start md:items-end">
             <div className="flex gap-4">
                <a 
                  href={CONFIG.MAIN_DOMAIN} 
                  className="btn-secondary h-12 px-6 text-[10px] shadow-soft bg-white/60"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={16} />
                  MAIN PORTAL
                </a>
                <button className="btn-secondary h-12 px-6 text-[10px] shadow-soft bg-white/60">
                  <Cpu size={16} />
                  API STATUS
                </button>
             </div>
             
             <div className="mt-12 text-left md:text-right">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">
                  &copy; {currentYear} SLOPARA ENTERTAINMENT
                </p>
                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mt-2 opacity-30">
                  Designed for excellence in financial technology
                </p>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
