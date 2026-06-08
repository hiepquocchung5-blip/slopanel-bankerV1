"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { 
  Shield, Bell, User as UserIcon, Smartphone, 
  Settings, CheckCircle2, Loader2, Save, LogOut 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';

export default function SettingsPage() {
  const { user, refreshProfile, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username === user?.username) return;
    
    setIsSaving(true);
    try {
      await apiClient.patch('users/profile/', { username });
      await refreshProfile();
      playSound('success');
      toast.success('Identity Updated');
    } catch (err: any) {
      playSound('error');
      toast.error(err.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-3">Module: Core_Identity</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROFILE SECTION */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 rounded-[30px] bg-slate-900 flex items-center justify-center text-amber-500 text-2xl font-black shadow-2xl">
                    {user?.username?.[0] || 'U'}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Operator Profile</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{user?.phone_number}</p>
                 </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Public Callsign (Username)</label>
                    <div className="relative">
                       <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                         type="text"
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         placeholder="ENTER CALLSIGN..."
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-black tracking-widest outline-none focus:border-amber-500/50 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                   disabled={isSaving || username === user?.username}
                   className="w-full h-16 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-black shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        <Save size={18} className="text-amber-500" />
                        SYNC CHANGES
                      </>
                    )}
                 </button>
              </form>
           </div>

           {/* SYSTEM STATUS */}
           <div className="bg-slate-950 rounded-[40px] p-10 border border-white/5 shadow-2xl">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 <Shield size={18} className="text-amber-500" />
                 Clearance & Security
              </h4>
              
              <div className="space-y-4">
                 {[
                   { label: 'Biometric Access', status: 'VERIFIED', color: 'text-green-500' },
                   { label: 'Session Integrity', status: 'SECURE', color: 'text-green-500' },
                   { label: 'Data Encryption', status: 'AES-256', color: 'text-amber-500' },
                   { label: 'Clearance Level', status: user?.is_staff ? 'L4_ADMIN' : (user?.is_agent && user?.is_cashier) ? 'L3_DEPOSITER' : user?.is_cashier ? 'L3_WITHDRAWER' : 'L2_AGENT', color: 'text-blue-500' }
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>{stat.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* SIDEBAR CONFIG */}
        <div className="space-y-6">
           <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm text-center">
              <Smartphone size={48} className="mx-auto text-amber-500 mb-6" />
              <h5 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Telegram Link</h5>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">
                 Securely link your account to the Slopara Telegram Portal.
              </p>
              <button className="w-full py-4 bg-slate-100 text-slate-900 font-black text-[10px] tracking-widest uppercase rounded-xl border border-slate-200 hover:bg-slate-200 transition-all">
                 CONNECT PORTAL
              </button>
           </div>

           <button 
             onClick={() => logout()}
             className="w-full p-8 bg-red-50 border border-red-100 rounded-[40px] flex flex-col items-center group hover:bg-red-500 transition-all"
           >
              <LogOut size={32} className="text-red-500 group-hover:text-white mb-4 transition-colors" />
              <span className="text-[11px] font-black text-red-600 group-hover:text-white uppercase tracking-[0.2em] transition-colors">Terminate Session</span>
           </button>

           <div className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] shadow-inner text-center">
              <Settings size={24} className="mx-auto text-slate-400 mb-4" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Slopara Banker Panel <br/>
                Build: v2.4.0-Final <br/>
                © 2026 Suropara Stealth
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
