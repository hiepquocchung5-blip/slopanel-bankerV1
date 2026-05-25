"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: number;
  user: number;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export default function QueuePage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

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
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Financial Queue" 
        subtitle={`${txs.length} Pending Requests`} 
      />

      <div className="p-6 space-y-4">
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
            <div key={tx.id} className="glass-panel p-5 rounded-[24px] border-white/5 relative overflow-hidden group">
               {/* Type Indicator Line */}
               <div className={cn(
                 "absolute left-0 top-0 bottom-0 w-1.5",
                 tx.tx_type === 'DEPOSIT' ? "bg-green-500 shadow-[2px_0_15px_rgba(34,197,94,0.3)]" : "bg-red-500 shadow-[2px_0_15px_rgba(239,68,68,0.3)]"
               )} />

               <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                    <span className={cn(
                      "text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase",
                      tx.tx_type === 'DEPOSIT' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {tx.tx_type}
                    </span>
                    <p className="text-xs font-black text-white mt-2 tracking-widest">USER_ID: {tx.user}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xl font-black text-gold tabular-nums leading-none mb-1">
                       {parseFloat(tx.amount).toLocaleString()}
                     </p>
                     <p className="text-[9px] text-gray-500 font-bold flex items-center justify-end gap-1">
                        <Clock size={8} />
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
                  </div>
               </div>

               <div className="flex gap-3 mt-6">
                  <button 
                    disabled={processingId !== null}
                    onClick={() => handleAction(tx.id, 'approve')}
                    className="flex-1 bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processingId === tx.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    APPROVE
                  </button>
                  <button 
                    disabled={processingId !== null}
                    onClick={() => handleAction(tx.id, 'reject')}
                    className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processingId === tx.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    REJECT
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
