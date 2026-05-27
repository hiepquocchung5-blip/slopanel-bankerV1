"use client";

import React from 'react';
import { BarChart3, ArrowDownRight, ArrowUpRight, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const bars = [40, 70, 45, 90, 65, 80, 55];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="panel-card p-6 md:p-8 lg:p-10">
        <p className="page-kicker">Network analytics</p>
        <h2 className="mt-3 page-title uppercase">Performance hub</h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary">
          View the portal&apos;s live health, traffic shape, and activity mix through a cleaner operator dashboard.
          </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="stat-tile">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
              <Users size={18} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-success">
              +12% <ArrowUpRight size={10} />
            </span>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.26em] text-text-secondary">Active users</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.06em] tabular-nums">1,284</p>
        </article>

        <article className="stat-tile">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-danger">
              -2% <ArrowDownRight size={10} />
            </span>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.26em] text-text-secondary">Avg session</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.06em] tabular-nums">14m 32s</p>
        </article>

        <article className="stat-tile">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Peak</span>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.26em] text-text-secondary">Traffic load</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.06em] tabular-nums">92%</p>
        </article>

        <article className="stat-tile">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-success">
              Healthy
            </span>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.26em] text-text-secondary">System state</p>
          <p className="mt-3 text-4xl font-black tracking-[-0.06em] tabular-nums">Stable</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="page-kicker">Transaction flow</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">
                Live chart
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="mt-10 flex h-48 items-end gap-2 md:gap-3">
            {bars.map((h, i) => (
              <div key={i} className="flex flex-1 items-end">
                <div
                  className={cn('chart-bar w-full', i === 3 && 'active')}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card p-6 md:p-8">
          <p className="page-kicker">Health summary</p>
          <div className="mt-6 space-y-4">
            {[
              ['Queue latency', 'Low'],
              ['Payment drift', 'Minimal'],
              ['Operator load', 'Balanced'],
              ['Security state', 'Encrypted'],
            ].map(([label, value]) => (
              <div key={label} className="nav-pill flex items-center justify-between px-4 py-4">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-text-secondary">{label}</span>
                <span className="text-sm font-black uppercase tracking-[0.18em] text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
