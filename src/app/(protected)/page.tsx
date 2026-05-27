"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, BarChart3, Fingerprint, Loader2, QrCode, ShieldCheck, TrendingUp, User, Users, Wallet, Zap, Phone, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HouseStats {
  global: {
    house_profit: string;
    rtp_percentage: number;
    total_spins: number;
    total_wagered: string;
  };
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
  const [copiedKey, setCopiedKey] = useState(false);

  const isManagement = user?.is_staff || user?.is_cashier;
  const isCashier = user?.is_cashier;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isManagement) {
          const [house, queue] = await Promise.all([
            API.request<HouseStats>('game/admin/analytics/'),
            API.request<Transaction[]>('payments/admin/transactions/'),
          ]);
          setHouseStats(house);
          setRecentQueue(queue.filter((t) => t.status === 'PENDING').slice(0, 3));
        } else {
          const [referrals, queue] = await Promise.all([
            API.request<ReferralStats>('users/referrals/'),
            API.request<Transaction[]>('payments/admin/transactions/'),
          ]);
          setRefStats(referrals);
          // For agents, the queue view is filtered on its own page, 
          // here we just show recent general pending for consistency if permitted
          setRecentQueue(queue.filter((t) => t.status === 'PENDING').slice(0, 3));
        }
      } catch {
        console.error('Dashboard data load failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isManagement]);

  const displayProfit = houseStats
    ? isCashier
      ? parseFloat(houseStats.global.house_profit) * 0.9
      : parseFloat(houseStats.global.house_profit)
    : 0;

  const displayWagered = houseStats
    ? isCashier
      ? parseFloat(houseStats.global.total_wagered) * 0.9
      : parseFloat(houseStats.global.total_wagered)
    : 0;

  const handleCopyCode = async () => {
    if (!refStats?.referral_code) return;
    try {
      await navigator.clipboard.writeText(refStats.referral_code);
      setCopiedKey(true);
      window.setTimeout(() => setCopiedKey(false), 1400);
    } catch {
      console.error('Copy failed');
    }
  };

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* PAGE DECLARATION */}
      <div className="mb-12 border-l-4 border-teal-600 pl-8 py-2">
         <h2 className="text-xs font-black text-teal-600 uppercase tracking-[0.4em] mb-1">Module: Core_Control</h2>
         <p className="text-5xl font-black text-slate-900 uppercase tracking-tighter">System Dashboard</p>
      </div>

      {/* HERO SECTION - Standardized and Centered */}
      <div className="grid grid-cols-1 gap-8 mb-12">
        <div className="glass-card p-12 flex flex-col items-center text-center">
           <div className="w-24 h-24 bg-teal-50 rounded-[32px] flex items-center justify-center mb-8 border border-teal-100 shadow-sm">
              <ShieldCheck size={48} className="text-teal-600" />
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Welcome back, {user.username || 'Staff'}</h2>
           <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
              <div className="flex items-center gap-1.5">
                 <Phone size={12} />
                 <span>{user.phone_number}</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              <span className="text-teal-600 font-black">
                {user.is_staff ? 'ADMIN_SEC_4' : user.is_cashier ? 'CASHIER_SEC_3' : 'AGENT_CORE'}
              </span>
           </div>
        </div>
      </div>

      {/* STATS GRID - 4 Column Elite */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {isManagement && houseStats ? (
          <>
            <div className="premium-card p-8 flex flex-col items-center text-center">
              <TrendingUp size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">House Revenue</p>
              <p className="text-2xl font-black text-slate-900">{displayProfit.toLocaleString()}</p>
              {isCashier && <span className="text-[8px] font-black text-teal-600 mt-2">SECURED 90%</span>}
            </div>
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <BarChart3 size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global RTP</p>
              <p className="text-2xl font-black text-slate-900">{houseStats.global.rtp_percentage}%</p>
            </div>
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <Zap size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spins</p>
              <p className="text-2xl font-black text-slate-900">{houseStats.global.total_spins.toLocaleString()}</p>
            </div>
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <Wallet size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume</p>
              <p className="text-2xl font-black text-slate-900">{displayWagered.toLocaleString()}</p>
            </div>
          </>
        ) : refStats ? (
          <>
            <div className="premium-card p-8 flex flex-col items-center text-center lg:col-span-2">
              <QrCode size={40} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Key</p>
              <p className="text-4xl font-black text-slate-900 tracking-widest font-mono mb-6">{refStats.referral_code}</p>
              <button onClick={handleCopyCode} className="btn-primary px-10 h-12">
                {copiedKey ? <Check size={18} /> : 'COPY KEY'}
              </button>
            </div>
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <Users size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Downline</p>
              <p className="text-3xl font-black text-slate-900">{refStats.total_referrals}</p>
            </div>
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <Wallet size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Earnings</p>
              <p className="text-3xl font-black text-slate-900">{parseFloat(refStats.total_commission_earned).toLocaleString()}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* SECONDARY INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="glass-card p-10">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Traffic</h3>
              <Link href="/queue" className="text-xs font-black text-teal-600 flex items-center gap-1 hover:gap-2 transition-all">
                VIEW FULL <ArrowRight size={14} />
              </Link>
           </div>
           <div className="space-y-4">
              {isLoading ? <Loader2 className="animate-spin mx-auto text-teal-600" /> : 
               recentQueue.length === 0 ? <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black tracking-widest">Queue Clear</p> :
               recentQueue.map(tx => (
                 <div key={tx.id} className="transaction-item">
                    <div className="flex items-center gap-4">
                       <Zap size={18} className="text-teal-600" />
                       <span className="text-xs font-black uppercase text-slate-900">{tx.tx_type}</span>
                    </div>
                    <span className="text-sm font-black tabular-nums">{parseFloat(tx.amount).toLocaleString()}</span>
                 </div>
               ))
              }
           </div>
        </div>

        <div className="premium-card p-10 flex flex-col justify-center items-center text-center">
           <Fingerprint size={48} className="text-teal-600 mb-6" />
           <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">Registry Integrity</h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
              System active in L3 encryption mode.<br/>
              All administrative actions are logged.
           </p>
        </div>
      </div>
    </div>
  );
}
