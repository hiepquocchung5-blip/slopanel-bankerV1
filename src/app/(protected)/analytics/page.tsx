"use client";

import React from 'react';
import Header from '@/components/ui/Header';
import { BarChart3, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <div className="p-6 space-y-8">
        <div className="premium-card p-8 group">
          <p className="text-[11px] text-white/40 font-black mb-2 tracking-[0.2em] uppercase">Network Health</p>
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Optimal</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary-dark">
                <Users size={20} />
              </div>
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                +12% <ArrowUpRight size={10} />
              </span>
            </div>
            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Active Users</p>
            <p className="text-2xl font-black text-text-primary mt-1">1,284</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary-dark">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                -2% <ArrowDownRight size={10} />
              </span>
            </div>
            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Avg Session</p>
            <p className="text-2xl font-black text-text-primary mt-1">14m 32s</p>
          </div>
        </div>

        <div className="glass-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Transaction Flow</h4>
              <div className="flex gap-2">
                 <div className="w-2 h-2 bg-primary-dark rounded-full" />
                 <div className="w-2 h-2 bg-primary/20 rounded-full" />
              </div>
           </div>
           
           <div className="flex items-end justify-between h-32 gap-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "chart-bar flex-1",
                    i === 3 && "active"
                  )} 
                  style={{ height: `${h}%` }} 
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
