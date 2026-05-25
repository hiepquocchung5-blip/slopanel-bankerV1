"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import LiveClock from '@/components/ui/LiveClock';
import { Users, Wallet, TrendingUp, BarChart3, Fingerprint, QrCode, Zap, User as UserIcon, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchTasks: Promise<any>[] = [];
        
        if (user?.is_staff) {
          fetchTasks.push(API.request<HouseStats>('game/admin/analytics/'));
          fetchTasks.push(API.request<Transaction[]>('payments/admin/transactions/'));
        } else {
          fetchTasks.push(API.request<ReferralStats>('users/referrals/'));
          fetchTasks.push(API.request<Transaction[]>('payments/admin/transactions/'));
        }

        const results = await Promise.all(fetchTasks);
        
        if (user?.is_staff) {
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
  }, [user]);

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header 
        title="Command Center" 
        subtitle="System Status: Operational" 
      />

      {/* Hero Greeting Section */}
      <div className="px-6 pt-6 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gold tracking-[0.3em] uppercase opacity-70">Authorized Access</p>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Welcome, {user.username || 'Agent'}
            <ShieldCheck size={18} className="text-blue-500 fill-blue-500/10" />
          </h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-gray-500">
                <Phone size={10} />
                <span className="text-[10px] font-bold tracking-widest">{user.phone_number}</span>
             </div>
             <div className="w-1 h-1 bg-white/10 rounded-full" />
             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
               LVL: {user.is_staff ? 'ADMIN_SEC_4' : 'AGENT_CORE'}
             </span>
          </div>
        </div>
        <LiveClock />
      </div>

      <div className="p-6 space-y-6">
        {/* TOP STATS GRID */}
        {user.is_staff && houseStats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-[24px] border-green-500/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                 <TrendingUp size={40} className="text-green-500" />
              </div>
              <p className="text-[9px] text-gray-500 font-black mb-1 tracking-[0.2em] uppercase">House Revenue</p>
              <p className="text-2xl font-black text-green-400 tabular-nums leading-none">
                {parseFloat(houseStats.global.house_profit).toLocaleString()}
                <span className="text-[10px] ml-1 opacity-50 font-bold">MMK</span>
              </p>
            </div>

            <div className="glass-panel p-6 rounded-[24px] border-gold/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                 <BarChart3 size={40} className="text-gold" />
              </div>
              <p className="text-[9px] text-gray-500 font-black mb-1 tracking-[0.2em] uppercase">Global RTP</p>
              <p className={`text-2xl font-black tabular-nums leading-none ${houseStats.global.rtp_percentage > 100 ? 'text-red-500' : 'text-gold'}`}>
                {houseStats.global.rtp_percentage}%
              </p>
            </div>
          </div>
        ) : refStats ? (
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-panel p-6 rounded-[32px] border-white/5 flex flex-col items-center text-center group hover:border-white/10 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-gold" />
                </div>
                <p className="text-[9px] text-gray-500 font-black tracking-widest mb-1 uppercase opacity-60">Downline</p>
                <p className="text-2xl font-black text-white tabular-nums leading-none">{refStats.total_referrals}</p>
             </div>

             <div className="glass-panel p-6 rounded-[32px] border-green-500/10 flex flex-col items-center text-center bg-green-500/[0.01] group hover:border-green-500/20 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wallet size={20} className="text-green-500" />
                </div>
                <p className="text-[9px] text-gray-500 font-black tracking-widest mb-1 uppercase opacity-60">Earnings</p>
                <p className="text-2xl font-black text-green-400 tabular-nums leading-none">
                  {parseFloat(refStats.total_commission_earned).toLocaleString()}
                </p>
             </div>
          </div>
        ) : null}

        {/* AGENT INVITE BOX (If Agent) */}
        {!user.is_staff && refStats && (
          <div className="text-center py-2">
             <div className="inline-block p-8 glass-panel rounded-[40px] border-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.08)] bg-black/20 w-full max-w-[340px]">
                <p className="text-[11px] text-gray-500 font-black mb-5 tracking-[0.4em] uppercase opacity-60">Authentication Key</p>
                <p className="text-4xl font-black text-white tracking-[0.2em] font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.25)] leading-none">
                  {refStats.referral_code}
                </p>
                <div className="flex justify-center mt-8">
                   <button className="px-6 py-2.5 bg-gold/10 border border-gold/20 rounded-full flex items-center gap-3 hover:bg-gold/20 transition-all active:scale-95 group">
                      <QrCode size={14} className="text-gold group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-gold tracking-[0.2em] uppercase">Copy Registry Key</span>
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* RECENT QUEUE ACTIVITY (Both Admin & Agent) */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                 <Zap size={14} className="text-gold fill-gold/20" />
                 <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Active Queue Traffic</h3>
              </div>
              <Link href="/queue" className="text-[9px] font-black text-gold/60 hover:text-gold tracking-widest uppercase flex items-center gap-1 transition-colors">
                 View Terminal <ArrowRight size={10} />
              </Link>
           </div>

           <div className="space-y-2">
              {isLoading ? (
                <div className="py-12 flex items-center justify-center">
                   <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
              ) : recentQueue.length === 0 ? (
                <div className="py-8 glass-panel rounded-2xl flex items-center justify-center opacity-30 border-dashed border-white/10">
                   <p className="text-[9px] font-black tracking-widest uppercase">No Active Requests</p>
                </div>
              ) : (
                recentQueue.map(tx => (
                  <div key={tx.id} className="glass-panel p-4 rounded-2xl border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center border",
                          tx.tx_type === 'DEPOSIT' ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400"
                        )}>
                           <Zap size={14} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white tracking-widest uppercase">{tx.tx_type}</p>
                           <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">USER_ID: {tx.user}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-gold tabular-nums leading-none mb-1">{parseFloat(tx.amount).toLocaleString()}</p>
                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{new Date(tx.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* SYSTEM INTEGRITY BLOCK (Admin Only) */}
        {user.is_staff && houseStats && (
          <div className="glass-panel p-8 rounded-[28px] border-white/5 bg-black/40 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[80%] bg-gold/[0.03] rounded-full blur-[60px]" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                 <Fingerprint size={24} className="text-gray-400 group-hover:text-gold transition-colors duration-500" />
              </div>
              <div>
                 <p className="text-xs font-black text-white tracking-widest uppercase">Registry Integrity</p>
                 <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 text-green-500/80">Status: Verified & Encrypted</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
              <div>
                 <p className="text-[9px] text-gray-600 font-black tracking-widest mb-1 uppercase">Volume Transacted</p>
                 <p className="text-lg font-black text-white tabular-nums leading-none">{parseFloat(houseStats.global.total_wagered).toLocaleString()}</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] text-gray-600 font-black tracking-widest mb-1 uppercase">Machine Cycles</p>
                 <p className="text-lg font-black text-white tabular-nums leading-none">{houseStats.global.total_spins.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
