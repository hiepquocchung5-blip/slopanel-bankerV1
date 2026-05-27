"use client";

import React from 'react';
import { BarChart3, ArrowDownRight, ArrowUpRight, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isManagement = user?.is_staff || user?.is_cashier;
  const bars = [40, 70, 45, 90, 65, 80, 55];

  if (!isManagement) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
         <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Restricted</h2>
         <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Level 3 Clearance Required</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Telemetry :: Module_04</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Performance Hub</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-[40px] p-10 flex flex-col items-center text-center shadow-sm">
          <p className="text-[11px] text-slate-400 font-black mb-3 tracking-[0.3em] uppercase">Network Integrity</p>
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Optimal_Active</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-[32px] p-10 flex flex-col items-center text-center shadow-sm">
            <div className="flex justify-between items-start w-full mb-6">
              <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <Users size={28} />
              </div>
              <span className="text-[12px] text-green-500 font-black flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                +12% <ArrowUpRight size={14} />
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Personnel</p>
            <p className="text-4xl font-black text-slate-900 mt-1 tabular-nums">1,284</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-10 flex flex-col items-center text-center shadow-sm">
            <div className="flex justify-between items-start w-full mb-6">
              <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <TrendingUp size={28} />
              </div>
              <span className="text-[12px] text-red-500 font-black flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
                -2% <ArrowDownRight size={14} />
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-1">Avg Session Link</p>
            <p className="text-4xl font-black text-slate-900 mt-1 tabular-nums">14m 32s</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[40px] p-12 shadow-sm">
           <div className="flex flex-col items-center mb-12">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em] mb-2">Registry Traffic Flow</h4>
              <div className="flex gap-2">
                 <div className="w-6 h-1.5 bg-teal-600 rounded-full" />
                 <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
              </div>
           </div>
           
           <div className="flex items-end justify-between h-48 gap-4 px-4 md:px-10">
              {bars.map((h, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-full rounded-t-2xl transition-all duration-700",
                    i === 3 ? "bg-teal-600 shadow-[0_0_25px_rgba(13,148,136,0.3)]" : "bg-slate-100 hover:bg-slate-200"
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
