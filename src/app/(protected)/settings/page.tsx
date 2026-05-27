"use client";

import React from 'react';
import { Bell, Database, HardDrive, Settings, Shield, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { title: 'Security', icon: Shield, desc: 'Manage access keys and clearance policy' },
    { title: 'Notifications', icon: Bell, desc: 'Control alert thresholds and delivery' },
    { title: 'Database', icon: Database, desc: 'Sync and backup behaviour' },
    { title: 'Infrastructure', icon: HardDrive, desc: 'Deployment and capacity tuning' },
    { title: 'Mobile config', icon: Smartphone, desc: 'App-side interface settings' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="panel-card p-6 md:p-8 lg:p-10">
        <p className="page-kicker">Core config</p>
        <h2 className="mt-3 page-title uppercase">System settings</h2>
        <p className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary">
          Keep the banker portal aligned with production rules, operator policy, and deployment constraints.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {sections.map((item) => (
          <button
            key={item.title}
            className="glass-card flex items-center gap-4 px-5 py-5 text-left transition-transform hover:scale-[1.01]"
          >
            <div className="w-14 h-14 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
              <item.icon size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">{item.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="panel-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-primary">
            <Settings size={20} />
          </div>
          <div>
            <p className="page-kicker">Developer console</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">
              Build and environment
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="nav-pill px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">System version</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-white">v2.1.0-build.2026.05</p>
          </div>
          <div className="nav-pill px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Environment</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-primary">Production</p>
          </div>
        </div>
      </section>
    </div>
  );
}
