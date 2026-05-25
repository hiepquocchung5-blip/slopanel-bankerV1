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
    <div className="animate-in fade-in duration-500">
      <Header 
        title="Payment Configuration" 
        subtitle="Team Deposit Gateways" 
      />

      <div className="p-6">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "w-full py-4 rounded-[24px] border border-white/5 font-black text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 mb-8 shadow-xl",
            isAdding ? "bg-white/10 text-white" : "bg-gold/5 text-gold border-gold/10"
          )}
        >
          {isAdding ? <Minus size={18} /> : <Plus size={18} />}
          {isAdding ? 'CANCEL ADDITION' : 'ADD TEAM ACCOUNT'}
        </button>

        {isAdding && (
          <div className="glass-panel p-8 rounded-[32px] border-gold/20 mb-10 animate-in slide-in-from-top duration-300">
             <form onSubmit={handleAdd} className="space-y-5">
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase ml-1">Financial Institution</p>
                   <div className="relative">
                      <Landmark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-gold/30"
                        placeholder="e.g. KBZ Pay"
                        value={newBank}
                        onChange={e => setNewBank(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase ml-1">Account Number</p>
                   <div className="relative">
                      <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-gold/30"
                        placeholder="09..."
                        value={newAcc}
                        onChange={e => setNewAcc(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase ml-1">Account Legal Name</p>
                   <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-gold/30"
                        placeholder="U AUNG..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <button 
                  disabled={processingId === -1}
                  className="w-full bg-gold py-4 rounded-2xl text-black font-black text-xs tracking-widest shadow-[0_0_25px_rgba(212,175,55,0.2)] mt-4 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingId === -1 && <Loader2 size={16} className="animate-spin" />}
                  COMMIT TO REGISTRY
                </button>
             </form>
          </div>
        )}

        <div className="space-y-4">
           {isLoading ? (
             <div className="h-40 flex items-center justify-center">
                <Loader2 size={32} className="text-gold animate-spin" />
             </div>
           ) : methods.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                <AlertCircle size={48} className="mb-4 text-gray-500" />
                <p className="text-sm font-black tracking-[0.2em] uppercase">No Methods Configured</p>
             </div>
           ) : (
             methods.map(m => (
               <div key={m.id} className={cn(
                 "glass-panel p-6 rounded-[28px] border-white/5 flex justify-between items-center",
                 !m.is_active && "opacity-40"
               )}>
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-black text-gold tracking-widest uppercase">{m.bank_name}</p>
                        <ShieldCheck size={10} className="text-gold/50" />
                     </div>
                     <p className="text-xl font-black text-white tracking-wide">{m.bank_account}</p>
                     <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">{m.account_name}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 ml-4">
                     <span className={cn(
                       "text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded",
                       m.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                     )}>
                        {m.is_active ? 'Online' : 'Disabled'}
                     </span>
                     <button 
                       disabled={processingId !== null}
                       onClick={() => handleToggle(m.id, m.is_active)}
                       className="p-1 hover:scale-110 active:scale-90 transition-transform disabled:opacity-50"
                     >
                        {processingId === m.id ? (
                          <Loader2 size={28} className="animate-spin text-gray-600" />
                        ) : m.is_active ? (
                          <ToggleRight size={36} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={36} className="text-gray-600" />
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
