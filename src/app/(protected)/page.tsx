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
          setRecentQueue(queue.filter((t) => t.status === 'PENDING').slice(0, 3));
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
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* PAGE DECLARATION */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Control :: Module_01</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Command Center</h2>
      </div>

      {/* HERO SECTION */}
      <div className="bg-white border border-slate-200 rounded-[40px] p-12 flex flex-col items-center text-center shadow-sm">
           <div className="w-24 h-24 bg-teal-50 rounded-[32px] flex items-center justify-center mb-8 border border-teal-100">
              <ShieldCheck size={48} className="text-teal-600" />
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3 uppercase">Identity Verified</h2>
           
           <div className="flex flex-col items-center">
              <p className="text-lg font-black text-slate-900 uppercase">{user.username || 'Operator'}</p>
              <p className="text-sm font-bold text-slate-400 tracking-widest">{user.phone_number}</p>
           </div>

           <div className="mt-8 px-6 py-2 rounded-full bg-teal-600 text-white text-[11px] font-black tracking-widest uppercase shadow-md">
             {user.is_staff ? 'SEC_CLEARANCE_04' : user.is_cashier ? 'SEC_CLEARANCE_03' : 'AGENT_CORE_ACCESS'}
           </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isManagement && houseStats ? (
          <>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm">
              <TrendingUp size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Revenue</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{displayProfit.toLocaleString()}</p>
              {isCashier && <span className="text-[9px] font-black text-teal-600 mt-2">ADJUSTED 90%</span>}
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm">
              <BarChart3 size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global RTP</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{houseStats.global.rtp_percentage}%</p>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm">
              <Zap size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Spins</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{houseStats.global.total_spins.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center rounded-[32px] shadow-sm">
              <Wallet size={32} className="text-teal-600 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{displayWagered.toLocaleString()}</p>
            </div>
          </>
        ) : refStats ? (
          <>
            <div className="bg-white border border-slate-200 p-10 flex flex-col items-center text-center rounded-[40px] lg:col-span-2 shadow-sm">
              <QrCode size={48} className="text-teal-600 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Registry Key</p>
              <p className="text-5xl font-black text-slate-900 tracking-widest font-mono mb-8">{refStats.referral_code}</p>
              <button 
                onClick={handleCopyCode} 
                className="bg-teal-600 text-white font-black tracking-widest px-12 h-14 rounded-2xl hover:bg-teal-700 transition-colors shadow-lg active:scale-95"
              >
                {copiedKey ? 'SUCCESS' : 'COPY REGISTRY KEY'}
              </button>
            </div>
            <div className="bg-white border border-slate-200 p-10 flex flex-col items-center text-center rounded-[40px] shadow-sm">
              <Users size={40} className="text-teal-600 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Downline</p>
              <p className="text-4xl font-black text-slate-900 tabular-nums">{refStats.total_referrals}</p>
            </div>
            <div className="bg-white border border-slate-200 p-10 flex flex-col items-center text-center rounded-[40px] shadow-sm">
              <Wallet size={40} className="text-teal-600 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Earnings</p>
              <p className="text-4xl font-black text-slate-900 tabular-nums">{parseFloat(refStats.total_commission_earned).toLocaleString()}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* SECONDARY INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm">
           <div className="flex justify-between items-center mb-10 text-center">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex-1">Recent Traffic</h3>
              <Link href="/queue" className="bg-slate-100 text-slate-900 font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors">
                Terminal View
              </Link>
           </div>
           <div className="space-y-4">
              {isLoading ? <Loader2 size={24} className="animate-spin mx-auto text-teal-600" /> : 
               recentQueue.length === 0 ? <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black tracking-widest">Feed Secure & Clear</p> :
               recentQueue.map(tx => (
                 <div key={tx.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <Zap size={20} className="text-teal-600" />
                       <span className="text-xs font-black uppercase text-slate-900">{tx.tx_type}</span>
                    </div>
                    <span className="text-base font-black tabular-nums">{parseFloat(tx.amount).toLocaleString()}</span>
                 </div>
               ))
              }
           </div>
        </div>

        <div className="bg-white border border-slate-200 p-12 flex flex-col justify-center items-center text-center rounded-[40px] shadow-sm">
           <Fingerprint size={64} className="text-teal-600 mb-8" />
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Registry Integrity</h3>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-sm">
              Terminal session established via L3 encrypted node.
              All registry modifications are historically logged.
           </p>
        </div>
      </div>
    </div>
  );
}
