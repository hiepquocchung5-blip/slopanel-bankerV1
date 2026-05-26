"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import Header from '@/components/ui/Header';
import { Plus, Minus, Landmark, CreditCard, User, Loader2, ShieldCheck, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  is_active: boolean;
}

export default function PaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Form State
  const [newBank, setNewBank] = useState('');
  const [newAcc, setNewAcc] = useState('');
  const [newName, setNewName] = useState('');

  const fetchMethods = async () => {
    try {
      const data = await API.request<PaymentMethod[]>('payments/agent/methods/');
      setMethods(data);
    } catch (e) {
      console.error("Methods load failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank || !newAcc || !newName) return;
    
    setProcessingId(-1); // -1 for global loading
    try {
      await API.request('payments/agent/methods/', {
        method: 'POST',
        body: JSON.stringify({ bank_name: newBank, bank_account: newAcc, account_name: newName, is_active: true })
      });
      setNewBank(''); setNewAcc(''); setNewName('');
      setIsAdding(false);
      fetchMethods();
    } catch (e) {
      console.error("Add failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    setProcessingId(id);
    try {
      await API.request(`payments/agent/methods/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !current })
      });
      setMethods(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
    } catch (e) {
      console.error("Toggle failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-32 scrollable">
      <Header 
        title="Gateways" 
        subtitle="Financial Protocol Registry" 
      />

      <div className="p-6">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "w-full btn-primary mb-8",
            isAdding && "bg-white/10 text-text-primary border-black/5"
          )}
        >
          {isAdding ? <Minus size={18} /> : <Plus size={18} />}
          {isAdding ? 'CANCEL OPERATION' : 'REGISTER NEW GATEWAY'}
        </button>

        {isAdding && (
          <div className="glass-card p-8 mb-10 animate-in slide-in-from-top duration-300 border-primary/20 shadow-soft">
             <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-text-secondary tracking-widest uppercase ml-1 opacity-60">Financial Institution</p>
                   <div className="relative">
                      <Landmark size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        className="input-modern pl-14"
                        placeholder="e.g. KBZ Pay"
                        value={newBank}
                        onChange={e => setNewBank(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-text-secondary tracking-widest uppercase ml-1 opacity-60">Account Identifier</p>
                   <div className="relative">
                      <CreditCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        className="input-modern pl-14"
                        placeholder="09..."
                        value={newAcc}
                        onChange={e => setNewAcc(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-text-secondary tracking-widest uppercase ml-1 opacity-60">Legal Entity Name</p>
                   <div className="relative">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        className="input-modern pl-14"
                        placeholder="U AUNG..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <button 
                  disabled={processingId === -1}
                  className="w-full btn-primary shadow-soft"
                >
                  {processingId === -1 && <Loader2 size={16} className="animate-spin" />}
                  COMMIT TO REGISTRY
                </button>
             </form>
          </div>
        )}

        <div className="space-y-5">
           {isLoading ? (
             <div className="h-40 flex items-center justify-center">
                <Loader2 size={32} className="text-primary animate-spin" />
             </div>
           ) : methods.length === 0 ? (
             <div className="py-24 flex flex-col items-center justify-center text-center opacity-20">
                <AlertCircle size={64} className="mb-6 text-text-secondary" />
                <p className="text-sm font-black tracking-[0.4em] uppercase text-text-primary">No Active Protocols</p>
             </div>
           ) : (
             methods.map(m => (
               <div key={m.id} className={cn(
                 "glass-card p-6 flex justify-between items-center border-black/5 shadow-soft transition-all duration-500",
                 !m.is_active && "opacity-40 grayscale"
               )}>
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        <p className="text-[10px] font-black text-primary-dark tracking-widest uppercase">{m.bank_name}</p>
                        <ShieldCheck size={12} className="text-primary-dark/40" />
                     </div>
                     <p className="text-2xl font-black text-text-primary tracking-tight tabular-nums">{m.bank_account}</p>
                     <p className="text-[11px] font-bold text-text-secondary uppercase mt-2 tracking-widest opacity-60">{m.account_name}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 ml-6">
                     <span className={cn(
                       "text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full border shadow-soft",
                       m.is_active ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                     )}>
                        {m.is_active ? 'Online' : 'Offline'}
                     </span>
                     <button 
                       disabled={processingId !== null}
                       onClick={() => handleToggle(m.id, m.is_active)}
                       className="p-1 hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                     >
                        {processingId === m.id ? (
                          <Loader2 size={32} className="animate-spin text-primary" />
                        ) : m.is_active ? (
                          <ToggleRight size={44} className="text-primary-dark" />
                        ) : (
                          <ToggleLeft size={44} className="text-text-secondary/40" />
                        )}
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
