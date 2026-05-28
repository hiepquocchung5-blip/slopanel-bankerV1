"use client";

import React from 'react';
import { CONFIG } from '@/lib/config';
import { Globe, Zap, ShieldCheck } from 'lucide-react';

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-[10001] border-t border-slate-200/70 bg-white/85 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Zap size={14} fill="white" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
              Slopara Banker
            </span>
          </div>
          <div className="hidden items-center gap-4 border-l border-slate-200 pl-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:flex">
            <span>v1.0.0 Release</span>
            <span className="flex items-center gap-1 text-teal-600">
              <ShieldCheck size={10} />
              Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={CONFIG.MAIN_DOMAIN}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Globe size={12} />
            Main_Hub
          </a>
          <p className="ml-4 hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 md:block">
            &copy; {currentYear} SLOPARA ENT.
          </p>
        </div>
      </div>
    </footer>
  );
}
