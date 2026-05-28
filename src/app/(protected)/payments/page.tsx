"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CreditCard, Landmark, Loader2, Minus, Plus, ToggleLeft, ToggleRight, User } from 'lucide-react';
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
                 "bg-white border-2 p-8 rounded-[40px] flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-10 shadow-sm transition-all duration-500",
                 m.is_active ? "border-teal-500/20" : "border-slate-100 opacity-60 grayscale-[0.5]"
               )}>
                  <div className="flex flex-col items-center md:items-start flex-1">
                     <div className="flex items-center gap-4 mb-5">
                        <div className={cn(
                          "w-3 h-3 rounded-full shadow-lg",
                          m.is_active ? "bg-green-500 animate-pulse" : "bg-slate-300"
                        )} />
                        <span className="text-[12px] font-black text-teal-600 tracking-[0.4em] uppercase">{m.bank_name}</span>
                     </div>
                     <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-3">{m.bank_account}</p>
                     <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{m.account_name}</p>
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-8">
                     <div className={cn(
                       "text-[11px] font-black tracking-[0.2em] uppercase px-6 py-2 rounded-full border-2 shadow-sm transition-all duration-500",
                       m.is_active 
                         ? "bg-green-50 text-green-700 border-green-200" 
                         : "bg-slate-50 text-slate-400 border-slate-200"
                     )}>
                        {m.is_active ? 'Registry_Online' : 'Node_Offline'}
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Toggle Status</span>
                        <button 
                          disabled={processingId !== null}
                          onClick={() => handleToggle(m.id, m.is_active)}
                          className="p-1 hover:scale-105 active:scale-90 transition-all disabled:opacity-50"
                        >
                           {processingId === m.id ? (
                             <Loader2 size={44} className="animate-spin text-teal-600" />
                           ) : m.is_active ? (
                             <ToggleRight size={64} className="text-teal-600 drop-shadow-md" />
                           ) : (
                             <ToggleLeft size={64} className="text-slate-200" />
                           )}
                        </button>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
