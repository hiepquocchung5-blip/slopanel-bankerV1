"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import LiveClock from '@/components/ui/LiveClock';
import { Users, Wallet, TrendingUp, BarChart3, Fingerprint, QrCode, Zap, User as UserIcon, Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HouseStats {
  global: {
    house_profit: string;
    rtp_percentage: number;
    total_spins: number;
    total_wagered: string;
  }
}

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  commission_balance: string;
  total_commission_earned: string;
}

interface Transaction {
  id: number;
  user: number;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING';
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [houseStats, setHouseStats] = useState<HouseStats | null>(null);
  const [refStats, setRefStats] = useState<ReferralStats | null>(null);
  const [recentQueue, setRecentQueue] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isManagement = user?.is_staff || user?.is_cashier;
  const isCashier = user?.is_cashier;
  const isAgent = user?.user_type === 'AGENT';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchTasks: Promise<any>[] = [];
        
        if (isManagement) {
          fetchTasks.push(API.request<HouseStats>('game/admin/analytics/'));
          fetchTasks.push(API.request<Transaction[]>('payments/admin/transactions/'));
        } else {
          fetchTasks.push(API.request<ReferralStats>('users/referrals/'));
          fetchTasks.push(API.request<Transaction[]>('payments/admin/transactions/'));
        }

        const results = await Promise.all(fetchTasks);
        
        if (isManagement) {
          setHouseStats(results[0]);
          setRecentQueue(results[1].filter((t: any) => t.status === 'PENDING').slice(0, 3));
        } else {
          setRefStats(results[0]);
          setRecentQueue(results[1].filter((t: any) => t.status === 'PENDING').slice(0, 3));
        }
      } catch (e) {
        console.error("Dashboard data load failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, isManagement]);

  if (!user) return null;

  // Apply 90% visibility logic for Cashiers
  const displayProfit = houseStats ? (isCashier ? parseFloat(houseStats.global.house_profit) * 0.9 : parseFloat(houseStats.global.house_profit)) : 0;
  const displayWagered = houseStats ? (isCashier ? parseFloat(houseStats.global.total_wagered) * 0.9 : parseFloat(houseStats.global.total_wagered)) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 scrollable">
      <Header 
        title="Command Center" 
        subtitle="System Status: Operational" 
      />

      {/* Hero Greeting Section */}
      <div className="px-6 pt-8 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase opacity-70">Authorized Access</p>
          <h2 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-2">
            Welcome, {user.username || 'Staff'}
            <ShieldCheck size={20} className="text-primary-dark" />
          </h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-text-secondary">
                <Phone size={10} />
                <span className="text-[11px] font-bold tracking-widest">{user.phone_number}</span>
             </div>
             <div className="w-1 h-1 bg-black/10 rounded-full" />
             <span className="text-[10px] font-black text-primary-dark uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-soft">
               {user.is_staff ? 'ADMIN_SEC_4' : user.is_cashier ? 'CASHIER_SEC_3' : 'AGENT_CORE'}
             </span>
          </div>
        </div>
        <LiveClock />
      </div>

      <div className="p-6 space-y-8">
        {/* TOP STATS GRID */}
        {isManagement && houseStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="premium-card p-8 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
                 <TrendingUp size={64} className="text-primary-dark" />
              </div>
              <p className="text-[11px] text-text-secondary font-black mb-2 tracking-[0.2em] uppercase">House Revenue</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-text-primary tabular-nums leading-none">
                  {displayProfit.toLocaleString()}
                </p>
                <span className="text-[12px] text-text-secondary font-bold uppercase tracking-widest">MMK</span>
              </div>
              {isCashier && (
                <p className="text-[10px] text-primary-dark font-black mt-4 tracking-widest uppercase">Secured 90% Visibility</p>
              )}
            </div>

            <div className="glass-card p-8 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
                 <BarChart3 size={64} className="text-primary-dark" />
              </div>
              <p className="text-[11px] text-text-secondary font-black mb-2 tracking-[0.2em] uppercase">Global RTP</p>
              <p className={cn(
                "text-4xl font-black tabular-nums leading-none",
                houseStats.global.rtp_percentage > 100 ? 'text-red-500' : 'text-primary-dark'
              )}>
                {houseStats.global.rtp_percentage}%
              </p>
            </div>
          </div>
        ) : refStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-8 flex flex-col items-center text-center group hover:scale-[1.02] transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-soft">
                  <Users size={24} className="text-primary-dark" />
                </div>
                <p className="text-[11px] text-text-secondary font-black tracking-widest mb-1 uppercase opacity-60">Downline</p>
                <p className="text-3xl font-black text-text-primary tabular-nums leading-none">{refStats.total_referrals}</p>
             </div>

             <div className="premium-card p-8 flex flex-col items-center text-center group hover:scale-[1.02] transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-4 shadow-soft">
                  <Wallet size={24} className="text-primary-dark" />
                </div>
                <p className="text-[11px] text-text-secondary font-black tracking-widest mb-1 uppercase opacity-60">Earnings</p>
                <div className="flex flex-col items-center">
                  <p className="text-3xl font-black text-text-primary tabular-nums leading-none">
                    {parseFloat(refStats.total_commission_earned).toLocaleString()}
                  </p>
                  {isAgent && (
                    <p className="text-[9px] text-primary-dark font-black mt-2 tracking-widest uppercase">Includes 10% System Commission</p>
                  )}
                </div>
             </div>
          </div>
        ) : null}

        {/* AGENT INVITE BOX (If Agent) */}
        {!isManagement && refStats && (
          <div className="text-center py-4">
             <div className="inline-block p-10 glass-card shadow-card w-full max-w-[400px]">
                <p className="text-[11px] text-text-secondary font-black mb-6 tracking-[0.4em] uppercase opacity-60">Authentication Key</p>
                <p className="text-5xl font-black text-text-primary tracking-[0.2em] font-mono leading-none">
                  {refStats.referral_code}
                </p>
                <div className="flex justify-center mt-10">
                   <button className="btn-primary px-8">
                      <QrCode size={18} />
                      COPY REGISTRY KEY
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* RECENT QUEUE ACTIVITY (Both Management & Agent) */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                 <h3 className="text-[11px] font-black text-text-primary tracking-[0.3em] uppercase">Active Queue Traffic</h3>
              </div>
              <Link href="/queue" className="text-[10px] font-black text-primary-dark hover:text-primary tracking-widest uppercase flex items-center gap-2 transition-all group">
                 Open Terminal 
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="space-y-3">
              {isLoading ? (
                <div className="py-16 flex items-center justify-center">
                   <Loader2 size={32} className="text-primary animate-spin" />
                </div>
              ) : recentQueue.length === 0 ? (
                <div className="py-12 glass-card rounded-3xl flex items-center justify-center opacity-40 border-dashed">
                   <p className="text-[10px] font-black tracking-widest uppercase">No Active Requests</p>
                </div>
              ) : (
                recentQueue.map(tx => (
                  <div key={tx.id} className="transaction-item border border-border-soft">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft border",
                          tx.tx_type === 'DEPOSIT' ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-red-500/10 border-red-500/20 text-red-600"
                        )}>
                           <Zap size={18} className={cn(tx.tx_type === 'DEPOSIT' ? "fill-green-500/20" : "fill-red-500/20")} />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-text-primary tracking-widest uppercase">{tx.tx_type}</p>
                           <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">ID: {tx.id}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-text-primary tabular-nums leading-none mb-1">
                          {parseFloat(tx.amount).toLocaleString()}
                        </p>
                        <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">
                          {new Date(tx.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* SYSTEM INTEGRITY BLOCK (Management Only) */}
        {isManagement && houseStats && (
          <div className="premium-card p-10 group">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-primary/[0.05] rounded-full blur-[80px]" />
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-soft">
                 <Fingerprint size={32} className="text-primary-dark group-hover:text-primary transition-all duration-700" />
              </div>
              <div>
                 <p className="text-sm font-black text-text-primary tracking-widest uppercase">Registry Integrity</p>
                 <p className="text-[11px] text-green-600 font-bold uppercase mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Verified & Encrypted
                 </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-10 border-t border-black/5 pt-10">
              <div>
                 <p className="text-[10px] text-text-secondary font-black tracking-widest mb-2 uppercase opacity-40">Volume Transacted</p>
                 <p className="text-xl font-black text-text-primary tabular-nums leading-none">
                   {displayWagered.toLocaleString()}
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-text-secondary font-black tracking-widest mb-2 uppercase opacity-40">Machine Cycles</p>
                 <p className="text-xl font-black text-text-primary tabular-nums leading-none">{houseStats.global.total_spins.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
