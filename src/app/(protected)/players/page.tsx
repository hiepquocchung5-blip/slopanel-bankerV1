"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import { Ban, Shield, Loader2, Coins, Landmark } from 'lucide-react';
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
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

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
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Player Management" 
        subtitle="Access Control & Monitoring" 
      />

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
             <Loader2 size={32} className="text-gold animate-spin" />
          </div>
        ) : players.map(p => (
          <div key={p.id} className={cn(
            "glass-panel p-5 rounded-[24px] border-white/5 transition-opacity",
            !p.is_active && "opacity-40"
          )}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border",
                    p.is_active ? "bg-gold/5 border-gold/20" : "bg-red-500/5 border-red-500/20"
                  )}>
                    {p.is_active ? <Shield size={22} className="text-gold" /> : <Ban size={22} className="text-red-500" />}
                  </div>
                  <div>
                     <p className="text-sm font-black text-white tracking-widest">{p.phone_number}</p>
                     <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                       Tier: <span className="text-gold">{p.vip_tier || 'NORMAL'}</span>
                     </span>
                  </div>
               </div>

               <button 
                 disabled={processingId !== null}
                 onClick={() => handleToggleBan(p.id)}
                 className={cn(
                   "px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all active:scale-95 disabled:opacity-50",
                   p.is_active ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                 )}
               >
                 {processingId === p.id ? <Loader2 size={14} className="animate-spin" /> : (p.is_active ? 'RESTRICT' : 'RESTORE')}
               </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-black/40 border border-white/5 p-4 rounded-[20px] flex items-center gap-3">
                  <Coins size={14} className="text-gray-600" />
                  <div>
                    <p className="text-[8px] text-gray-600 font-black tracking-widest uppercase">Balance</p>
                    <p className="text-xs font-black text-white tabular-nums">{parseFloat(p.balance).toLocaleString()}</p>
                  </div>
               </div>
               <div className="bg-black/40 border border-white/5 p-4 rounded-[20px] flex items-center gap-3 text-right">
                  <div className="flex-1">
                    <p className="text-[8px] text-gray-600 font-black tracking-widest uppercase">Lifetime</p>
                    <p className="text-xs font-black text-gold tabular-nums">{parseFloat(p.lifetime_deposit).toLocaleString()}</p>
                  </div>
                  <Landmark size={14} className="text-gray-600" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
