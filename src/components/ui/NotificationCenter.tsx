"use client";

import React, { useEffect, useState, useRef } from 'react';
import { API } from '@/lib/api';
import { Bell, BellRing, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PendingStats {
  deposits: number;
  withdrawals: number;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [stats, setPendingStats] = useState<PendingStats>({ deposits: 0, withdrawals: 0 });
  const [showToast, setShowToast] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isManagement = user?.is_staff || user?.is_cashier;

  useEffect(() => {
    if (!isManagement) return;

    const fetchStats = async () => {
      try {
        const data = await API.get<PendingStats>('payments/admin/pending-stats/');
        const currentTotal = data.deposits + data.withdrawals;
        
        if (currentTotal > lastTotal) {
          setShowToast(true);
          playNotifySound();
          // Auto hide after 10s
          setTimeout(() => setShowToast(false), 10000);
        }
        
        setPendingStats(data);
        setLastTotal(currentTotal);
      } catch (e) {
        console.error("Failed to fetch pending stats", e);
      }
    };

    const playNotifySound = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isManagement, lastTotal]);

  if (!isManagement) return null;

  return (
    <>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      
      {/* FLOAT INDICATOR */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4 pointer-events-none">
        {showToast && (
          <div className="pointer-events-auto bg-slate-900 border-2 border-amber-500/50 text-white p-6 rounded-[30px] shadow-2xl flex items-center gap-6 animate-in slide-in-from-right-full duration-500 max-w-md">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center animate-pulse">
               <BellRing className="text-amber-500" size={28} />
            </div>
            <div className="flex-1">
               <h4 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-1">New System Alert</h4>
               <p className="text-xs font-bold text-slate-300 leading-relaxed">
                 You have {stats.deposits + stats.withdrawals} pending transactions requiring immediate attention.
               </p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors">
               <X size={20} />
            </button>
          </div>
        )}

        <div className="pointer-events-auto relative group">
           <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className={`w-16 h-16 rounded-full border-2 border-slate-800 bg-slate-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-90 relative ${stats.deposits + stats.withdrawals > 0 ? 'border-amber-500/50' : ''}`}>
              <Bell className={stats.deposits + stats.withdrawals > 0 ? 'text-amber-500' : 'text-slate-600'} size={24} />
              {stats.deposits + stats.withdrawals > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-slate-950">
                  {stats.deposits + stats.withdrawals}
                </span>
              )}
           </div>
        </div>
      </div>
    </>
  );
}
