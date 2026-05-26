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
    <div className="animate-in fade-in duration-500 pb-20">
      <Header 
        title="Financial Queue" 
        subtitle={isManagement ? `${txs.length} Pending Requests` : "Read-Only Terminal"} 
      />

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Screenshot Preview" 
            className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" 
          />
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>
      )}

      <div className="p-6 space-y-6">
        {!isManagement && (
           <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Eye size={18} className="text-blue-400" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">
                Agent Mode: You are viewing live transaction traffic. Management clearance required for processing.
              </p>
           </div>
        )}

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
             <Loader2 size={32} className="text-gold animate-spin" />
          </div>
        ) : txs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
             <Check size={64} className="mb-4 text-green-500" />
             <p className="text-sm font-black tracking-[0.3em] uppercase">Queue is Clear</p>
          </div>
        ) : (
          txs.map(tx => (
            <div key={tx.id} className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      {tx.tx_type === 'DEPOSIT' && tx.screenshot && (
                        <div 
                          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden cursor-zoom-in relative group/img"
                          onClick={() => setSelectedImage(tx.screenshot)}
                        >
                          <img src={tx.screenshot} alt="Receipt" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[8px] font-black tracking-[0.2em] px-2 py-0.5 rounded-full uppercase border",
                            tx.tx_type === 'DEPOSIT' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                          )}>
                            {tx.tx_type}
                          </span>
                          <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">ID: {tx.txd_id || '---'}</span>
                        </div>
                        <h3 className="text-base font-black text-white tracking-widest uppercase">{tx.user_name || 'Anonymous User'}</h3>
                        <p className="text-[10px] font-bold text-gold/60 tracking-[0.1em]">{tx.user_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-white tabular-nums leading-none tracking-tighter">
                         {parseFloat(tx.amount).toLocaleString()}
                       </p>
                       <p className="text-[9px] text-gray-500 font-bold flex items-center justify-end gap-1 mt-1 uppercase tracking-widest">
                          <Clock size={8} />
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                 </div>

                 {tx.tx_type === 'WITHDRAW' && (
                    <div className="mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Target Bank Account</p>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-white uppercase tracking-widest">{tx.user_bank_name}</span>
                          <span className="text-xs font-black text-gold tabular-nums tracking-widest">{tx.user_bank_account}</span>
                       </div>
                    </div>
                 )}

                 {isManagement ? (
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        disabled={processingId !== null}
                        onClick={() => handleAction(tx.id, 'approve')}
                        className="bg-green-500 text-black py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                      >
                        {processingId === tx.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        APPROVE
                      </button>
                      <button 
                        disabled={processingId !== null}
                        onClick={() => handleAction(tx.id, 'reject')}
                        className="bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 border border-white/10 hover:border-red-500/50 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === tx.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        REJECT
                      </button>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center py-4 bg-white/5 border border-white/5 rounded-2xl">
                      <ShieldAlert size={12} className="text-gray-500 mr-2" />
                      <span className="text-[8px] font-black text-gray-500 tracking-[0.2em] uppercase">Pending Management Clearance</span>
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
