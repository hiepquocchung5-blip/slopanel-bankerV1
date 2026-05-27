"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import { useAuth } from '@/context/AuthContext';
import { Ban, Shield, Loader2, Coins, Landmark, User as UserIcon, ShieldCheck, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: number;
  phone_number: string;
  is_active: boolean;
  vip_tier: string;
  balance: string;
  lifetime_deposit: string;
}

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const isAdmin = user?.is_staff;

  const fetchPlayers = async () => {
    try {
      const data = await API.request<Player[]>('users/admin/players/');
      setPlayers(data);
    } catch (e) {
      console.error("Players load failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleToggleBan = async (id: number) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to change this user's access status?`)) return;
    
    setProcessingId(id);
    try {
      const res = await API.request<any>(`users/admin/players/${id}/toggle-ban/`, { method: 'POST' });
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, is_active: res.is_active } : p));
    } catch (e) {
      console.error("Toggle ban failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
             <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : players.map(p => (
          <div key={p.id} className={cn(
            "glass-card p-6 border-black/5 shadow-soft transition-all duration-300",
            !p.is_active && "opacity-50 grayscale bg-black/[0.02]"
          )}>
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-soft transition-colors duration-500",
                    p.is_active ? "bg-primary/10 border-primary/20 text-primary-dark" : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}>
                    {p.is_active ? <Shield size={24} /> : <UserX size={24} />}
                  </div>
                  <div>
                     <p className="text-base font-black text-text-primary tracking-widest">{p.phone_number}</p>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                          LVL: <span className="text-primary-dark">{p.vip_tier || 'NORMAL'}</span>
                        </span>
                        <div className="w-1 h-1 bg-black/10 rounded-full" />
                        <ShieldCheck size={12} className="text-primary-dark/40" />
                     </div>
                  </div>
               </div>

               {isAdmin ? (
                 <button 
                   disabled={processingId !== null}
                   onClick={() => handleToggleBan(p.id)}
                   className={cn(
                     "px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 shadow-soft border uppercase",
                     p.is_active ? "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-primary-dark text-white border-primary-dark"
                   )}
                 >
                   {processingId === p.id ? <Loader2 size={14} className="animate-spin" /> : (p.is_active ? 'Restrict' : 'Restore')}
                 </button>
               ) : (
                 <div className="px-4 py-2 bg-black/5 rounded-xl border border-black/5">
                    <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase opacity-40">Verified</span>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/40 border border-black/5 p-5 rounded-[24px] flex items-center gap-4 shadow-soft">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark">
                    <Coins size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] text-text-secondary font-black tracking-widest uppercase opacity-60">Total Balance</p>
                    <p className="text-sm font-black text-text-primary tabular-nums tracking-tighter">
                      {parseFloat(p.balance).toLocaleString()}
                    </p>
                  </div>
               </div>
               <div className="bg-white/40 border border-black/5 p-5 rounded-[24px] flex items-center gap-4 text-right shadow-soft">
                  <div className="flex-1">
                    <p className="text-[9px] text-text-secondary font-black tracking-widest uppercase opacity-60">Revenue Contrib.</p>
                    <p className="text-sm font-black text-primary-dark tabular-nums tracking-tighter">
                      {parseFloat(p.lifetime_deposit).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary-dark/40">
                    <Landmark size={16} />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
