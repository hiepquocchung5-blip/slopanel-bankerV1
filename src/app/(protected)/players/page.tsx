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
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const isAdmin = user?.is_staff;
  const isManagement = user?.is_staff || user?.is_cashier;

  const fetchPlayers = async () => {
    try {
      const data = await API.request<Player[]>('users/admin/players/');
      setPlayers(data);
    } catch {
      console.error('Players load failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchPlayers();
    })();
  }, []);

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
      <section className="panel-card p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">User registry</p>
            <h2 className="mt-3 page-title uppercase">Player hub</h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary">
              Inspect account health, balance state, and lifecycle access from a single registry screen.
            </p>
          </div>
          <div className="nav-pill px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Admin</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-primary">
              {isAdmin ? 'Restriction enabled' : 'Read only'}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 size={30} className="animate-spin text-primary" />
          </div>
        ) : (
          players.map((p) => (
            <article
              key={p.id}
              className={cn(
                'panel-card p-5 md:p-6',
                !p.is_active && 'opacity-60 grayscale'
              )}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4 md:gap-5">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl border',
                      p.is_active
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-danger/20 bg-danger/10 text-danger'
                    )}
                  >
                    {p.is_active ? <Shield size={22} /> : <UserX size={22} />}
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase tracking-[-0.04em]">
                      {p.phone_number}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">
                      <span>Tier: {p.vip_tier || 'NORMAL'}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={12} className="text-primary" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[460px]">
                  <div className="nav-pill flex items-center gap-3 px-4 py-4">
                    <div className="w-10 h-10 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
                      <Coins size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Balance</p>
                      <p className="mt-1 text-sm font-black tabular-nums">{parseFloat(p.balance).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="nav-pill flex items-center gap-3 px-4 py-4">
                    <div className="w-10 h-10 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-primary">
                      <Landmark size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Lifetime deposit</p>
                      <p className="mt-1 text-sm font-black tabular-nums">{parseFloat(p.lifetime_deposit).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleToggleBan(p.id)}
                      className={cn(
                        'btn-secondary h-12 px-5',
                        p.is_active ? 'border-danger/20 text-danger' : 'border-primary/20 text-primary'
                      )}
                    >
                      {processingId === p.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Ban size={14} />
                      )}
                      {p.is_active ? 'Restrict' : 'Restore'}
                    </button>
                  ) : (
                    <div className="nav-pill px-4 py-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.24em] text-text-secondary">
                        Read only
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
