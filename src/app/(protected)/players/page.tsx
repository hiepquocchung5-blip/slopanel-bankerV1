"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Ban, Coins, Loader2, Landmark, Shield, ShieldCheck, UserX, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: number;
  phone_number: string;
  is_active: boolean;
  vip_tier: string;
  balance: string;
  lifetime_deposit: string;
}

interface ToggleBanResponse {
  is_active: boolean;
}

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [coinAmount, setCoinAmount] = useState<string>('');
  const [activeCoinId, setActiveCoinId] = useState<number | null>(null);

  const isAdmin = user?.is_staff;
  const isManagement = user?.is_staff || user?.is_cashier;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await API.request<Player[]>(`users/admin/players/?search=${searchQuery}`);
      setPlayers(data);
    } catch {
      console.error('Players search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (id: number) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to change this user\'s access status?')) return;

    setProcessingId(id);
    try {
      const res = await API.request<ToggleBanResponse>(`users/admin/players/${id}/toggle-ban/`, { method: 'POST' });
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: res.is_active } : p)));
    } catch {
      console.error('Toggle ban failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddCoins = async (id: number) => {
    if (!isAdmin || !coinAmount) return;
    
    setProcessingId(id);
    try {
      await API.request(`users/admin/players/${id}/add-coins/`, { 
        method: 'POST',
        body: JSON.stringify({ amount: coinAmount })
      });
      alert(`Successfully added ${coinAmount} Slopara Coins`);
      setCoinAmount('');
      setActiveCoinId(null);
      // Refresh user data
      const data = await API.request<Player[]>(`users/admin/players/?search=${searchQuery}`);
      setPlayers(data);
    } catch {
      alert('Failed to add coins');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isManagement) {
    return (
      <div className="py-32 text-center">
         <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Restricted</h2>
         <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Level 3 Clearance Required</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="panel-card p-6 md:p-8 lg:p-10 bg-gradient-to-br from-slate-900 to-slate-800 border-primary/20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker text-primary/80">Security Protocol v4.0</p>
            <h2 className="mt-3 page-title uppercase text-white">Player Search Hub</h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-slate-400 font-medium">
              Locate user accounts by phone number or username to manage assets and access permissions.
            </p>
          </div>
          <div className="nav-pill px-6 py-4 bg-white/5 border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">System Operator</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-primary">
              {isAdmin ? 'Full Authorization' : 'Audit Access'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search phone number or username..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary px-10 py-4 h-auto rounded-2xl flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Search Database'}
          </button>
        </form>
      </section>

      <div className="space-y-4">
        {players.length === 0 && !isLoading && searchQuery && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-slate-500 font-bold uppercase tracking-widest">No matching players found</p>
          </div>
        )}

        {players.map((p) => (
          <article
            key={p.id}
            className={cn(
              'panel-card p-5 md:p-6 transition-all hover:border-primary/30',
              !p.is_active && 'opacity-60 grayscale'
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 md:gap-5">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-lg',
                    p.is_active
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-danger/20 bg-danger/10 text-danger'
                  )}
                >
                  {p.is_active ? <Shield size={28} /> : <UserX size={28} />}
                </div>
                <div>
                  <p className="text-xl font-black uppercase tracking-[-0.04em] text-white">
                    {p.phone_number}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/10 text-primary">{p.vip_tier || 'NORMAL'}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <ShieldCheck size={14} className="text-primary" />
                      SECURE PROFILE
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[460px]">
                <div className="nav-pill flex items-center gap-4 px-5 py-5 bg-white/5 border-white/5">
                  <div className="w-12 h-12 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Slopara Coins</p>
                    <p className="mt-1 text-lg font-black tabular-nums text-white">{(p as any).slopara_coins?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="nav-pill flex items-center gap-4 px-5 py-5 bg-white/5 border-white/5">
                  <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-primary/60 shadow-inner">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Total Deposits</p>
                    <p className="mt-1 text-lg font-black tabular-nums text-white">{parseFloat(p.lifetime_deposit).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isAdmin && (
                  <>
                    {activeCoinId === p.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          className="w-24 bg-white/10 border border-primary/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          value={coinAmount}
                          onChange={(e) => setCoinAmount(e.target.value)}
                        />
                        <button 
                          onClick={() => handleAddCoins(p.id)}
                          disabled={processingId !== null}
                          className="btn-primary h-10 px-4 text-xs"
                        >
                          {processingId === p.id ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                        </button>
                        <button 
                          onClick={() => setActiveCoinId(null)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveCoinId(p.id)}
                        className="btn-secondary h-12 px-6 border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <Coins size={16} />
                        Add Coins
                      </button>
                    )}
                    
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleToggleBan(p.id)}
                      className={cn(
                        'btn-secondary h-12 px-6',
                        p.is_active ? 'border-danger/20 text-danger hover:bg-danger/5' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5'
                      )}
                    >
                      {processingId === p.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Ban size={14} />
                      )}
                      {p.is_active ? 'Restrict' : 'Restore'}
                    </button>
                  </>
                )}
                {!isAdmin && (
                  <div className="nav-pill px-5 py-3 border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Audit Only
                    </span>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
