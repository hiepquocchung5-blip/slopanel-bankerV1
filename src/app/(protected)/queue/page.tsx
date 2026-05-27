"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Check, Clock, Eye, EyeOff, Loader2, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      setTxs(data.filter((t) => t.status === 'PENDING'));
    } catch {
      console.error('Queue load failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchQueue();
    })();
  }, []);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="panel-card p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">Financial ops</p>
            <h2 className="mt-3 page-title uppercase">Approval queue</h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary">
              Review transaction traffic, inspect receipts, and resolve pending requests from the banker terminal.
            </p>
          </div>
          <div className="nav-pill px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Access</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-primary">
              {isManagement ? 'Action enabled' : 'View only'}
            </p>
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Screenshot preview"
            className="max-h-[80vh] max-w-full rounded-[28px] border border-white/10 shadow-2xl"
          />
          <button className="absolute right-8 top-8 rounded-full border border-white/10 bg-white/5 p-3 text-white/60 backdrop-blur-md transition-colors hover:text-white">
            <X size={24} />
          </button>
        </div>
      )}

      {!isManagement && (
        <div className="glass-card flex items-center gap-3 px-5 py-4 text-text-secondary">
          <ShieldAlert size={18} className="text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.24em]">
            Agent mode: live feed visible, transaction actions restricted.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 size={30} className="animate-spin text-primary" />
          </div>
        ) : txs.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/3 px-6 py-14 text-center">
            <Check size={42} className="mx-auto text-primary" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-text-secondary">
              Queue is clear
            </p>
          </div>
        ) : (
          txs.map((tx) => (
            <article key={tx.id} className="panel-card overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    {tx.tx_type === 'DEPOSIT' && tx.screenshot ? (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(tx.screenshot)}
                        className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                      >
                        <img src={tx.screenshot} alt="Receipt" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <Eye size={18} className="text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-text-secondary">
                        <EyeOff size={18} />
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em]',
                            tx.tx_type === 'DEPOSIT'
                              ? 'border-success/20 bg-success/10 text-success'
                              : 'border-danger/20 bg-danger/10 text-danger'
                          )}
                        >
                          {tx.tx_type}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">
                          ID {tx.txd_id || '---'}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-black uppercase tracking-[-0.04em]">
                        {tx.user_name || 'Member'}
                      </h3>
                      <p className="mt-1 text-sm font-bold tracking-[0.14em] text-primary">
                        {tx.user_phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-3xl font-black tabular-nums tracking-[-0.05em]">
                      {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary lg:justify-end">
                      <Clock size={10} />
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {tx.tx_type === 'WITHDRAW' && (
                  <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.26em] text-text-secondary">
                      Destination account
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-black uppercase tracking-[0.16em] text-white">
                        {tx.user_bank_name}
                      </span>
                      <span className="text-base font-black tabular-nums tracking-[0.1em] text-primary">
                        {tx.user_bank_account}
                      </span>
                    </div>
                  </div>
                )}

                {isManagement ? (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleAction(tx.id, 'approve')}
                      className="btn-primary"
                    >
                      {processingId === tx.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Confirm
                    </button>
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleAction(tx.id, 'reject')}
                      className="btn-secondary"
                    >
                      {processingId === tx.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.24em] text-text-secondary">
                      Awaiting authorization
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
