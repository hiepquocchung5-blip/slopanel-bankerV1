"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, Fingerprint, QrCode, ShieldCheck,
  TrendingUp, Users, Wallet, Zap, Loader2
} from 'lucide-react';

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
  commission_coins: string;
  total_commission_earned: string;
}

interface Transaction {
  id: number;
  user: number;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [houseStats, setHouseStats] = useState<HouseStats | null>(null);
  const [refStats, setRefStats] = useState<ReferralStats | null>(null);
  const [recentTraffic, setRecentTraffic] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  const isManagement = user?.is_staff || user?.is_cashier;
  const isCashier = user?.is_cashier;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isManagement) {
          const [house, traffic] = await Promise.all([
            API.request<HouseStats>('game/admin/analytics/'),
            API.request<Transaction[]>('payments/admin/transactions/'),
          ]);
          setHouseStats(house);
          setRecentTraffic(traffic.slice(0, 5));
        } else {
          const [referrals, traffic] = await Promise.all([
            API.request<ReferralStats>('users/referrals/'),
            API.request<Transaction[]>('payments/admin/transactions/'),
          ]);
          setRefStats(referrals);
          setRecentTraffic(traffic.slice(0, 5));
        }
      } catch {
        console.error('Dashboard load failed');
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
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* PAGE DECLARATION */}
      <div className="flex flex-col items-center text-center pt-8">
         <span className="text-[12px] font-black text-amber-500 uppercase tracking-[0.5em] mb-4">Command_Node :: V4_ACTIVE</span>
         <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tight">System Monitor</h2>
      </div>

      {/* HERO SECTION */}
      <div className="bg-slate-950 border border-amber-500/20 rounded-[50px] p-14 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />
           <div className="w-28 h-28 bg-amber-500/10 rounded-[35px] flex items-center justify-center mb-10 border border-amber-500/20 shadow-inner">
              <ShieldCheck size={56} className="text-amber-500" />
           </div>
           
           <div className="space-y-4">
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Clearance Verified</h2>
              <div className="flex flex-col items-center gap-2">
                 <p className="text-xl font-black text-amber-500 uppercase tracking-widest">{user.username || 'OPERATOR'}</p>
                 <p className="text-sm font-bold text-slate-600 tracking-[0.2em]">{user.phone_number}</p>
              </div>
           </div>

           <div className="mt-12 px-10 py-3 rounded-2xl bg-amber-500 text-black text-[12px] font-black tracking-widest uppercase shadow-[0_0_40px_rgba(245,158,11,0.25)]">
             {user.is_staff ? 'UNRESTRICTED_ACCESS' : user.is_cashier ? 'TRANSACTION_MODE' : 'CORE_AGENT_LINK'}
           </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isManagement && houseStats ? (
          <>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm hover:border-amber-500/50 transition-colors">
              <TrendingUp size={32} className="text-amber-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Profit (Coins)</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{Math.floor(displayProfit).toLocaleString()}</p>
              {isCashier && <span className="text-[9px] font-black text-amber-600 mt-2">ADJUSTED 90%</span>}
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm hover:border-amber-500/50 transition-colors">
              <BarChart3 size={32} className="text-amber-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global RTP</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{houseStats.global.rtp_percentage}%</p>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm hover:border-amber-500/50 transition-colors">
              <Zap size={32} className="text-amber-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Spins</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{houseStats.global.total_spins.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm hover:border-amber-500/50 transition-colors">
              <Wallet size={32} className="text-amber-500 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wagered (Coins)</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{Math.floor(displayWagered).toLocaleString()}</p>
            </div>
          </>
        ) : refStats ? (
          <>
            <div className="bg-white border border-slate-200 p-10 flex flex-col items-center text-center rounded-[40px] lg:col-span-2 shadow-sm">
              <QrCode size={48} className="text-amber-500 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Registry Key</p>
              <p className="text-5xl font-black text-slate-900 tracking-widest font-mono mb-8">{refStats.referral_code}</p>
              <button 
                onClick={handleCopyCode} 
                className="bg-amber-500 text-black font-black tracking-widest px-12 h-14 rounded-2xl hover:bg-amber-600 transition-colors shadow-lg active:scale-95"
              >
                {copiedKey ? 'SUCCESS' : 'COPY REGISTRY KEY'}
              </button>
            </div>
            <div className="bg-white border border-slate-200 p-10 flex flex-col items-center text-center rounded-[40px] shadow-sm">
              <Users size={40} className="text-amber-500 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Downline</p>
              <p className="text-4xl font-black text-slate-900 tabular-nums">{refStats.total_referrals}</p>
            </div>
            <div className="bg-white border border-slate-200 p-10 flex flex-col items-center text-center rounded-[40px] shadow-sm">
              <Wallet size={40} className="text-amber-500 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Coins Earned</p>
              <p className="text-4xl font-black text-slate-900 tabular-nums">{Math.floor(parseFloat(refStats.total_commission_earned)).toLocaleString()}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* SECONDARY INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm">
           <div className="flex justify-between items-center mb-10 text-center">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex-1">Recent Flow</h3>
              <Link href="/payments" className="bg-slate-900 text-amber-500 font-black text-[10px] tracking-widest uppercase px-6 py-2.5 rounded-xl border border-amber-500/20 hover:bg-black transition-colors">
                Audit History
              </Link>
           </div>
           <div className="space-y-4">
              {isLoading ? <Loader2 size={24} className="animate-spin mx-auto text-amber-500" /> : 
               recentTraffic.length === 0 ? <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black tracking-widest">Feed Secure & Clear</p> :
               recentTraffic.map(tx => (
                 <div key={tx.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-500/20 transition-all">
                    <div className="flex items-center gap-4">
                       <Zap size={20} className={tx.tx_type === 'DEPOSIT' ? 'text-amber-500' : 'text-slate-400'} />
                       <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-slate-900">{tx.tx_type}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{tx.status}</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-base font-black tabular-nums text-slate-900">{Math.floor(parseFloat(tx.amount)).toLocaleString()}</span>
                       <span className="text-[9px] font-black text-amber-600 uppercase">
                         {tx.tx_type === 'WITHDRAW' ? (tx as any).user_bank_name || 'COINS' : 'COINS'}
                       </span>
                    </div>
                 </div>
               ))
              }
           </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-12 flex flex-col justify-center items-center text-center rounded-[40px] shadow-inner relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Fingerprint size={200} className="text-slate-900" />
           </div>
           <Fingerprint size={64} className="text-amber-500 mb-8" />
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Registry Integrity</h3>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-sm">
              All Slopara Coin movements are cryptographically logged.
              Security Clearances are audited every 24 hours.
           </p>
        </div>
      </div>
    </div>
  );
}
