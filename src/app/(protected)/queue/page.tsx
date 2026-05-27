"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import { useAuth } from '@/context/AuthContext';
import { Check, X, Clock, Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
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
      setTxs(data.filter(t => t.status === 'PENDING'));
    } catch (e) {
      console.error("Queue load failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!isManagement) return;
    if (!confirm(`Confirm ${action.toUpperCase()} for this transaction?`)) return;
    
    setProcessingId(id);
    try {
      await API.request(`payments/admin/transactions/${id}/${action}/`, { method: 'POST' });
      setTxs(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Screenshot Preview" 
            className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10" 
          />
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors bg-white/5 p-3 rounded-full backdrop-blur-md">
            <X size={24} />
          </button>
        </div>
      )}

      <div className="p-6 space-y-8">
        {!isManagement && (
           <div className="glass-card bg-primary/5 border-primary/20 p-5 flex items-center gap-4 shadow-soft">
              <Eye size={20} className="text-primary-dark" />
              <p className="text-[11px] font-black text-primary-dark uppercase tracking-widest leading-relaxed">
                Agent Mode: Live transaction traffic view. Management clearance required for processing.
              </p>
           </div>
        )}

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
             <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : txs.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-20">
             <Check size={80} className="mb-6 text-primary" />
             <p className="text-sm font-black tracking-[0.4em] uppercase text-text-primary">Queue is Clear</p>
          </div>
        ) : (
          txs.map(tx => (
            <div key={tx.id} className="glass-card overflow-hidden group hover:scale-[1.01] transition-all duration-300 border-black/5 shadow-soft">
               <div className="p-7">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-5">
                      {tx.tx_type === 'DEPOSIT' && tx.screenshot && (
                        <div 
                          className="w-20 h-20 rounded-2xl bg-black/5 border border-black/5 overflow-hidden cursor-zoom-in relative group/img shadow-soft"
                          onClick={() => setSelectedImage(tx.screenshot)}
                        >
                          <img src={tx.screenshot} alt="Receipt" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-[2px]">
                            <Eye size={18} className="text-white" />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-[9px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase border shadow-soft",
                            tx.tx_type === 'DEPOSIT' ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                          )}>
                            {tx.tx_type}
                          </span>
                          <span className="text-[10px] font-black text-text-secondary tracking-widest uppercase opacity-40">ID: {tx.txd_id || '---'}</span>
                        </div>
                        <h3 className="text-lg font-black text-text-primary tracking-tight uppercase">{tx.user_name || 'Member'}</h3>
                        <p className="text-[11px] font-bold text-primary-dark/60 tracking-[0.1em]">{tx.user_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-text-primary tabular-nums leading-none tracking-tight">
                         {parseFloat(tx.amount).toLocaleString()}
                       </p>
                       <p className="text-[10px] text-text-secondary font-bold flex items-center justify-end gap-1.5 mt-2 uppercase tracking-widest opacity-60">
                          <Clock size={10} />
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                 </div>

                 {tx.tx_type === 'WITHDRAW' && (
                    <div className="mb-6 p-5 bg-black/[0.02] border border-black/5 rounded-2xl shadow-soft">
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 opacity-40">Destination Account</p>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-text-primary uppercase tracking-widest">{tx.user_bank_name}</span>
                          <span className="text-sm font-black text-primary-dark tabular-nums tracking-[0.1em]">{tx.user_bank_account}</span>
                       </div>
                    </div>
                 )}

                 {isManagement ? (
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        disabled={processingId !== null}
                        onClick={() => handleAction(tx.id, 'approve')}
                        className="btn-primary"
                      >
                        {processingId === tx.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        CONFIRM
                      </button>
                      <button 
                        disabled={processingId !== null}
                        onClick={() => handleAction(tx.id, 'reject')}
                        className="btn-secondary"
                      >
                        {processingId === tx.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        DECLINE
                      </button>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center py-4 bg-black/5 rounded-2xl border border-black/5 opacity-40">
                      <ShieldAlert size={14} className="text-text-secondary mr-2" />
                      <span className="text-[9px] font-black text-text-secondary tracking-[0.2em] uppercase">Awaiting Authorization</span>
                   </div>
                 )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
