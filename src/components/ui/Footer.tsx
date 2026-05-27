"use client";

import React from 'react';
import { CONFIG } from '@/lib/config';
import { Globe, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 px-4 md:px-0 pb-32">
      <div className="panel-card p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="page-kicker mb-3">Operator note</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-[-0.05em] uppercase">
              Banker portal tuned for live operations.
            </h2>
            <p className="mt-3 text-sm md:text-base text-text-secondary leading-relaxed">
              Real-time approvals, account controls, and player oversight exposed through a compact control-room interface.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-3">
              <a
                href={CONFIG.MAIN_DOMAIN}
                className="btn-secondary h-11 px-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={15} />
                Main portal
              </a>
              <button className="btn-secondary h-11 px-4">
                <Cpu size={15} />
                API status
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.24em] uppercase text-text-secondary">
              <ShieldCheck size={14} className="text-success" />
              Encrypted link active
            </div>
            <p className="text-[10px] font-black tracking-[0.28em] uppercase text-text-secondary">
              {currentYear} SLOPARA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
