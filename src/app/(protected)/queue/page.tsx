"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Check, Clock, Eye, EyeOff, Loader2, ShieldAlert, X } from 'lucide-react';
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
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isManagement = user?.is_staff || user?.is_cashier;

  const fetchQueue = async () => {
    try {
      const data = await API.request<Transaction[]>('payments/admin/transactions/');
      // Filter for Agents: only show their own login number requests
      const filtered = data.filter(t => {
        const isPending = t.status === 'PENDING';
        if (!isPending) return false;
        if (isManagement) return true;
        return t.user_phone === user?.phone_number;
      });
      setTxs(filtered);
    } catch {
      console.error('Queue load failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!isManagement) return;
    if (!confirm(`Confirm ${action.toUpperCase()} for this transaction?`)) return;

    setProcessingId(id);
    try {
      await API.request(`payments/admin/transactions/${id}/${action}/`, { method: 'POST' });
      setTxs((prev) => prev.filter((t) => t.id !== id));
    } catch {
      console.error('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* PAGE DECLARATION */}
      <div className="mb-12 border-l-4 border-teal-600 pl-8 py-2">
         <h2 className="text-xs font-black text-teal-600 uppercase tracking-[0.4em] mb-1">Module: Financial_Ops</h2>
         <p className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Live Traffic</p>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center bg-slate-900/98 p-4 backdrop-blur-2xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-5xl w-full"
               onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Screenshot preview"
                className="w-full h-auto rounded-[40px] border border-white/10 shadow-2xl"
              />
              <button 
                className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                onClick={() => setSelectedImage(null)}
              >
                <X size={28} strokeWidth={3} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isManagement && (
        <div className="glass-card flex items-center justify-center gap-4 p-8 mb-12 text-center bg-teal-50 border-teal-100">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
            <Eye size={24} />
          </div>
          <p className="text-[13px] font-black text-teal-900 uppercase tracking-widest">
            Personal Registry View Active
          </p>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-32 flex items-center justify-center">
            <Loader2 size={48} className="animate-spin text-teal-600" />
          </div>
        ) : txs.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center text-center p-20 opacity-40 border-dashed">
            <Check size={80} className="mb-6 text-slate-200" />
            <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">
              Queue is clear
            </p>
          </div>
        ) : (
          txs.map((tx) => (
            <article key={tx.id} className="glass-card overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
              <div className="p-8 md:p-10">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10 text-center lg:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {tx.tx_type === 'DEPOSIT' && tx.screenshot ? (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(tx.screenshot)}
                        className="group relative h-28 w-28 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100 shadow-md transition-transform hover:scale-105"
                      >
                        <img src={tx.screenshot} alt="Receipt" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 flex items-center justify-center bg-teal-600/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <Eye size={28} className="text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-slate-100 bg-slate-50 text-slate-300">
                        <EyeOff size={28} />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-center lg:justify-start gap-3">
                        <span
                          className={cn(
                            'rounded-full border px-4 py-1 text-[10px] font-black uppercase tracking-widest',
                            tx.tx_type === 'DEPOSIT'
                              ? 'border-teal-200 bg-teal-50 text-teal-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          )}
                        >
                          {tx.tx_type}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
                          ID: {tx.txd_id || '------'}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        {tx.user_name || 'Member'}
                      </h3>
                      <p className="text-base font-bold tracking-widest text-teal-600">
                        {tx.user_phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end">
                    <p className="text-5xl font-black text-slate-900 tabular-nums leading-none tracking-tighter mb-3">
                      {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em]">
                      <Clock size={12} />
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {tx.tx_type === 'WITHDRAW' && (
                  <div className="mt-10 rounded-[32px] bg-slate-50 border border-slate-100 p-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Destination Protocol</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-black uppercase tracking-widest text-slate-900">
                        {tx.user_bank_name}
                      </span>
                      <span className="text-2xl font-black tabular-nums tracking-widest text-teal-600">
                        {tx.user_bank_account}
                      </span>
                    </div>
                  </div>
                )}

                {isManagement ? (
                  <div className="mt-10 grid grid-cols-2 gap-6">
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleAction(tx.id, 'approve')}
                      className="btn-primary h-16 rounded-[24px] shadow-lg text-base"
                    >
                      {processingId === tx.id ? <Loader2 size={24} className="animate-spin" /> : <Check size={24} strokeWidth={3} />}
                      CONFIRM
                    </button>
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleAction(tx.id, 'reject')}
                      className="btn-secondary h-16 rounded-[24px] bg-slate-100 border-transparent hover:bg-red-50 hover:text-red-600"
                    >
                      {processingId === tx.id ? <Loader2 size={24} className="animate-spin" /> : <X size={24} strokeWidth={3} />}
                      REJECT
                    </button>
                  </div>
                ) : (
                  <div className="mt-10 flex items-center justify-center p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-slate-400">
                    <ShieldAlert size={20} className="mr-4" />
                    <span className="text-xs font-black tracking-[0.3em] uppercase">
                      Authorization Awaited
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
