"use client";

import React from 'react';
import Header from '@/components/ui/Header';
import { Settings, Shield, Bell, Database, HardDrive, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { title: 'Security', icon: Shield, desc: 'Manage access keys & firewall' },
    { title: 'Notifications', icon: Bell, desc: 'Configure system alerts' },
    { title: 'Database', icon: Database, desc: 'Backup and sync protocols' },
    { title: 'Infrastructure', icon: HardDrive, desc: 'Server health & scaling' },
    { title: 'Mobile Config', icon: Smartphone, desc: 'App-side interface settings' },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-32 scrollable">
      <Header 
        title="System Config" 
        subtitle="Registry & Protocol Management" 
      />

      <div className="p-6 space-y-4">
        {sections.map((item, i) => (
          <button 
            key={i}
            className="w-full glass-card p-6 flex items-center gap-6 group hover:scale-[1.01] transition-all text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-dark shadow-soft group-hover:bg-primary-dark group-hover:text-white transition-all duration-500">
              <item.icon size={24} />
            </div>
            <div>
               <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-1">{item.title}</h3>
               <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60">{item.desc}</p>
            </div>
          </button>
        ))}

        <div className="mt-8 p-8 premium-card">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                 <Settings size={20} className="text-white/40" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Developer Console</h4>
           </div>
           <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
             System Version: v2.1.0-build.2026.05 <br/>
             Environment: Production (Encrypted)
           </p>
        </div>
      </div>
    </div>
  );
}
