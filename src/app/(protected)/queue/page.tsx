"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { API } from '@/lib/api';
import { CONFIG } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';
import { Check, Clock, Eye, EyeOff, Loader2, ShieldAlert, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: number;
  user: number;
  user_phone: string;
  user_name: string;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  txd_id: string;
  screenshot: string | null;
  user_bank_name: string | null;
  user_bank_account: string | null;
  created_at: string;
}

export default function QueuePage() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isManagement = user?.is_staff || user?.is_cashier;

  const resolveReceiptUrl = useCallback((url: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;

    const cleanPath = url.replace(/^\/+/, '');
    if (cleanPath.startsWith('media/receipts/')) {
      return `https://api.suropara.com/${cleanPath}`;
    }

    if (cleanPath.startsWith('receipts/')) {
      return `${CONFIG.MEDIA_BASE}${cleanPath.replace(/^receipts\//, '')}`;
    }

    return `${CONFIG.MEDIA_BASE}${cleanPath}`;
  }, []);

  const fetchQueue = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await API.request<Transaction[]>('payments/admin/transactions/?_ts=' + Date.now());
      const filtered = data.filter(t => {
        const isPending = t.status === 'PENDING';
        if (!isPending) return false;
        if (isManagement) return true;
        return t.user_phone === user?.phone_number;
      });
      setTxs(filtered);
      setLastSyncedAt(new Date());
    } catch {
      console.error('Queue load failed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isManagement, user?.phone_number]);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchQueue(true);
    }, 8000);

    const handleFocus = () => {
      void fetchQueue(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchQueue]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!isManagement) return;
    if (!confirm(`Confirm ${action.toUpperCase()} for this transaction?`)) return;

    setProcessingId(id);
    try {
      await API.request(`payments/admin/transactions/${id}/${action}/`, { method: 'POST' });
      await fetchQueue(true);
    } catch {
      console.error('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
        <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Registry :: Module_02</span>
        <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Live Traffic</h2>
        <div className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 shadow-sm">
          <span className={cn("h-2 w-2 rounded-full", isRefreshing ? "bg-amber-400 animate-pulse" : "bg-teal-500")} />
          <span>{isRefreshing ? 'Syncing live feed' : 'Live sync enabled'}</span>
          {lastSyncedAt && (
            <span className="text-slate-500">
              Last update {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center bg-slate-900/95 p-6 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
               initial={{ scale: 0.9 }}
               animate={{ scale: 1 }}
               exit={{ scale: 0.9 }}
               className="relative max-w-4xl"
               onClick={e => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Receipt"
                width={1200}
                height={900}
                unoptimized
                className="h-auto w-full rounded-[32px] border border-white/10 shadow-2xl"
              />
              <button 
                className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} strokeWidth={3} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={48} className="animate-spin text-teal-600" />
          </div>
        ) : txs.length === 0 ? (
          <div className="py-20 border-dashed border-2 border-slate-200 rounded-[32px] flex flex-col items-center text-center">
            <Check size={64} className="text-slate-200 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Queue is clear</p>
          </div>
        ) : (
          txs.map((tx) => (
            <div key={tx.id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:border-teal-500/30">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    {tx.tx_type === 'DEPOSIT' && tx.screenshot ? (
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setSelectedImage(resolveReceiptUrl(tx.screenshot))}
                      >
                        <Image
                          src={resolveReceiptUrl(tx.screenshot) || ''}
                          alt="Receipt"
                          width={112}
                          height={112}
                          unoptimized
                          className="h-28 w-28 rounded-[28px] border border-slate-100 object-cover shadow-sm transition-transform hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-[28px]">
                           <Eye size={24} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                        <EyeOff size={32} />
                      </div>
                    )}

                    <div className="flex flex-col items-center md:items-start gap-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          tx.tx_type === 'DEPOSIT' ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {tx.tx_type}
                        </span>
                        <span className="text-[11px] font-black text-slate-300 tracking-widest uppercase">ID: {tx.txd_id || '------'}</span>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-start">
                         <p className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{tx.user_name || 'Member'}</p>
                         <div className="flex items-center gap-2 mt-2 px-4 py-1.5 bg-teal-50 rounded-full border border-teal-100 shadow-sm">
                            <Phone size={12} className="text-teal-600" strokeWidth={3} />
                            <p className="text-sm font-black text-teal-700 tracking-[0.1em]">{tx.user_phone}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-3">
                    <p className="text-5xl font-black text-slate-900 tabular-nums leading-none tracking-tighter">
                      {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                       <Clock size={12} />
                       {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {tx.tx_type === 'WITHDRAW' && (
                  <div className="mt-10 p-8 bg-slate-50 rounded-[28px] border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Destination Registry</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{tx.user_bank_name}</span>
                      <span className="text-2xl font-black text-teal-600 tabular-nums tracking-widest">{tx.user_bank_account}</span>
                    </div>
                  </div>
                )}

                {isManagement ? (
                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAction(tx.id, 'approve')}
                      disabled={processingId !== null}
                      className="h-16 rounded-[24px] bg-teal-600 text-white font-black tracking-widest text-base shadow-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {processingId === tx.id ? <Loader2 size={24} className="animate-spin" /> : <Check size={24} strokeWidth={3} />}
                      CONFIRM
                    </button>
                    <button
                      onClick={() => handleAction(tx.id, 'reject')}
                      disabled={processingId !== null}
                      className="h-16 rounded-[24px] bg-slate-100 text-slate-500 font-black tracking-widest text-base border-transparent hover:text-red-600 transition-colors flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {processingId === tx.id ? <Loader2 size={24} className="animate-spin" /> : <X size={24} strokeWidth={3} />}
                      REJECT
                    </button>
                  </div>
                ) : (
                  <div className="mt-10 p-8 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-center text-slate-300">
                    <ShieldAlert size={20} className="mr-3" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Registry Access Restricted</span>
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
