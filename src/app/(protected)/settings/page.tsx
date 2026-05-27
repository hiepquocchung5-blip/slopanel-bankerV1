"use client";

import React from 'react';
import { Shield, Bell, Database, HardDrive, Smartphone, Settings } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { title: 'Security', icon: Shield, desc: 'Manage access keys & firewall' },
    { title: 'Notifications', icon: Bell, desc: 'Configure system alerts' },
    { title: 'Database', icon: Database, desc: 'Backup and sync protocols' },
    { title: 'Infrastructure', icon: HardDrive, desc: 'Server health & scaling' },
    { title: 'Mobile Config', icon: Smartphone, desc: 'App-side interface settings' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Module: Core_Config</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">System Settings</h2>
      </div>

      <div className="space-y-6">
        {sections.map((item, i) => (
          <button 
            key={i}
            className="w-full bg-white border border-slate-200 p-8 rounded-[32px] flex flex-col md:flex-row items-center md:items-start gap-6 group hover:border-teal-500/30 transition-all text-center md:text-left shadow-sm"
          >
            <div className="w-16 h-16 rounded-[24px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
              <item.icon size={28} />
            </div>
            <div className="flex flex-col items-center md:items-start justify-center flex-1">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{item.title}</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
            </div>
          </button>
        ))}

        <div className="mt-12 p-12 bg-white border border-slate-200 rounded-[40px] shadow-sm flex flex-col items-center text-center">
           <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                 <Settings size={28} className="text-slate-400" />
              </div>
              <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Developer Console</h4>
           </div>
           <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-loose">
             System Version: v2.2.0-build.2026.05 <br/>
             Environment: Production (Encrypted)
           </p>
        </div>
      </div>
    </div>
  );
}
