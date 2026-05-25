"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import { Users, Wallet, TrendingUp, BarChart3, Fingerprint, QrCode } from 'lucide-react';

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

export default function Dashboard() {
  const { user } = useAuth();
  const [houseStats, setHouseStats] = useState<HouseStats | null>(null);
  const [refStats, setRefStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.is_staff) {
          const stats = await API.request<HouseStats>('game/admin/analytics/');
          setHouseStats(stats);
        } else {
          const stats = await API.request<ReferralStats>('users/referrals/');
          setRefStats(stats);
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
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Dashboard" 
        subtitle={`Session ID: ${user.phone_number.slice(-4)}-${user.user_type}`} 
      />

      <div className="p-6 space-y-6">
        {user.is_staff && houseStats ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-[24px] border-green-500/10 hover:border-green-500/20 transition-all group">
                <div className="flex items-center justify-between mb-4">
                   <TrendingUp size={18} className="text-green-500" />
                   <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">Live Profit</span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest uppercase">House Revenue</p>
                <p className="text-2xl font-black text-green-400 tabular-nums leading-none">
                  {parseFloat(houseStats.global.house_profit).toLocaleString()}
                  <span className="text-[10px] ml-1 opacity-50">MMK</span>
                </p>
              </div>

              <div className="glass-panel p-6 rounded-[24px] border-gold/10 hover:border-gold/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                   <BarChart3 size={18} className="text-gold" />
                   <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">Mathematics</span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold mb-1 tracking-widest uppercase">Global RTP</p>
                <p className={`text-2xl font-black tabular-nums leading-none ${houseStats.global.rtp_percentage > 100 ? 'text-red-500' : 'text-gold'}`}>
                  {houseStats.global.rtp_percentage}%
                </p>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[28px] border-white/5 bg-black/40">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                     <Fingerprint size={24} className="text-gray-400" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-white tracking-widest uppercase">Clearance Protocol</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Level: Executive Admin</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                  <div>
                     <p className="text-[9px] text-gray-600 font-black tracking-widest mb-1 uppercase">Total Wagered</p>
                     <p className="text-lg font-black text-white tabular-nums">{parseFloat(houseStats.global.total_wagered).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] text-gray-600 font-black tracking-widest mb-1 uppercase">Active Sessions</p>
                     <p className="text-lg font-black text-white tabular-nums">{houseStats.global.total_spins.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </>
        ) : refStats ? (
          <>
            <div className="text-center py-4">
               <div className="inline-block p-8 glass-panel rounded-[40px] border-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.05)] bg-black/20 mb-8 w-full max-w-[340px]">
                  <p className="text-[11px] text-gray-500 font-black mb-4 tracking-[0.4em] uppercase opacity-60">Invite Key</p>
                  <p className="text-5xl font-black text-white tracking-[0.2em] font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {refStats.referral_code}
                  </p>
                  <div className="flex justify-center mt-6">
                     <div className="px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full flex items-center gap-2">
                        <QrCode size={12} className="text-gold" />
                        <span className="text-[9px] font-black text-gold tracking-widest uppercase">Copy Code</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="glass-panel p-6 rounded-[24px] border-white/5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-4">
                    <Users size={18} className="text-gold" />
                  </div>
                  <p className="text-[9px] text-gray-500 font-black tracking-widest mb-1 uppercase">Downline</p>
                  <p className="text-2xl font-black text-white tabular-nums">{refStats.total_referrals}</p>
               </div>

               <div className="glass-panel p-6 rounded-[24px] border-green-500/10 flex flex-col items-center text-center bg-green-500/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-center mb-4">
                    <Wallet size={18} className="text-green-500" />
                  </div>
                  <p className="text-[9px] text-gray-500 font-black tracking-widest mb-1 uppercase">Commission</p>
                  <p className="text-2xl font-black text-green-400 tabular-nums">
                    {parseFloat(refStats.total_commission_earned).toLocaleString()}
                  </p>
               </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
