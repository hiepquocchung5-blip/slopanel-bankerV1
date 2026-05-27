"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CreditCard, Landmark, Loader2, Minus, Plus, ShieldCheck, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  is_active: boolean;
  created_by: number;
}

interface ToggleMethodResponse {
  is_active: boolean;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [newBank, setNewBank] = useState('');
  const [newAcc, setNewAcc] = useState('');
  const [newName, setNewName] = useState('');

  const isManagement = user?.is_staff || user?.is_cashier;

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = isManagement ? 'payments/admin/methods/' : 'payments/agent/methods/';
      const data = await API.request<PaymentMethod[]>(endpoint);
      setMethods(data);
    } catch {
      console.error('Methods load failed');
    } finally {
      setIsLoading(false);
    }
  }, [isManagement]);

  useEffect(() => {
    void fetchMethods();
  }, [fetchMethods]);

  const handleToggle = async (id: number, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      const endpoint = isManagement ? `payments/admin/methods/${id}/` : `payments/agent/methods/${id}/`;
      const res = await API.request<ToggleMethodResponse>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: res.is_active } : m)));
    } catch {
      console.error('Toggle failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingId(-1);
    try {
      const endpoint = isManagement ? 'payments/admin/methods/' : 'payments/agent/methods/';
      const res = await API.request<PaymentMethod>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ bank_name: newBank, bank_account: newAcc, account_name: newName, is_active: true }),
      });
      setMethods((prev) => [res, ...prev]);
      setIsAdding(false);
      setNewBank('');
      setNewAcc('');
      setNewName('');
    } catch {
      console.error('Add failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Module: Pay_Protocols</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Gateway Config</h2>
      </div>

      <div className="space-y-8">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "w-full h-16 rounded-[24px] font-black text-base tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-sm",
            isAdding ? "bg-slate-100 text-slate-500 border border-slate-200" : "btn-primary"
          )}
        >
          {isAdding ? <Minus size={20} /> : <Plus size={20} />}
          {isAdding ? 'CANCEL OPERATION' : 'REGISTER NEW GATEWAY'}
        </button>

        {isAdding && (
          <div className="bg-white border border-teal-200 p-10 rounded-[32px] animate-in slide-in-from-top duration-300 shadow-lg text-center">
             <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-3">
                   <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">Financial Institution</p>
                   <div className="relative">
                      <Landmark size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        className="input-modern pl-16 h-16 rounded-[24px]"
                        placeholder="e.g. KBZ Pay"
                        value={newBank}
                        onChange={e => setNewBank(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">Account Identifier</p>
                   <div className="relative">
                      <CreditCard size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        className="input-modern pl-16 h-16 rounded-[24px]"
                        placeholder="09..."
                        value={newAcc}
                        onChange={e => setNewAcc(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">Legal Entity Name</p>
                   <div className="relative">
                      <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        className="input-modern pl-16 h-16 rounded-[24px]"
                        placeholder="U AUNG..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <button 
                  disabled={processingId === -1}
                  className="w-full btn-primary h-16 rounded-[24px] mt-8 text-base shadow-md"
                >
                  {processingId === -1 && <Loader2 size={24} className="animate-spin" />}
                  COMMIT TO REGISTRY
                </button>
             </form>
          </div>
        )}

        <div className="space-y-6">
           {isLoading ? (
             <div className="py-32 flex items-center justify-center">
                <Loader2 size={48} className="text-teal-600 animate-spin" />
             </div>
           ) : methods.length === 0 ? (
             <div className="py-20 border-dashed border-2 border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center opacity-60">
                <AlertCircle size={64} className="mb-6 text-slate-300" />
                <p className="text-sm font-black tracking-[0.4em] uppercase text-slate-400">No Active Protocols</p>
             </div>
           ) : (
             methods.map(m => (
               <div key={m.id} className={cn(
                 "bg-white border border-slate-200 p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8 shadow-sm transition-all duration-500 hover:border-teal-500/30",
                 !m.is_active && "opacity-50 grayscale"
               )}>
                  <div className="flex flex-col items-center md:items-start flex-1">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="text-[11px] font-black text-teal-600 tracking-[0.3em] uppercase">{m.bank_name}</span>
                        <ShieldCheck size={14} className="text-teal-600/50" />
                     </div>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-2">{m.bank_account}</p>
                     <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{m.account_name}</p>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-6">
                     <span className={cn(
                       "text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border shadow-sm",
                       m.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                     )}>
                        {m.is_active ? 'Online' : 'Offline'}
                     </span>
                     <button 
                       disabled={processingId !== null}
                       onClick={() => handleToggle(m.id, m.is_active)}
                       className="p-2 hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                     >
                        {processingId === m.id ? (
                          <Loader2 size={40} className="animate-spin text-teal-600" />
                        ) : m.is_active ? (
                          <ToggleRight size={56} className="text-teal-600" />
                        ) : (
                          <ToggleLeft size={56} className="text-slate-300" />
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
