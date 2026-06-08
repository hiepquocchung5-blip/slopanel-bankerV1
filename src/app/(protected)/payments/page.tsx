"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Plus, Minus, Landmark, CreditCard, User, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';

interface PaymentMethod {
  id: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  is_active: boolean;
  created_by: number | null;
  created_by_name: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [newBank, setNewBank] = useState('');
  const [newAcc, setNewAcc] = useState('');
  const [newName, setNewName] = useState('');

  const isManagement = user?.is_staff || user?.is_cashier;
  const isAdmin = user?.is_staff;
  const canManage = isManagement || user?.user_type === 'AGENT' || user?.user_type === 'VIP';

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      // isManagement (Admin/Cashier) uses the /admin/ endpoint which now returns ALL methods.
      // Agents use the /agent/ endpoint which returns their own.
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
      const res = await API.request<any>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      playSound('success');
      toast.success(currentStatus ? 'Gateway disabled' : 'Gateway activated');
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: res.is_active } : m)));
    } catch {
      playSound('error');
      toast.error('Toggle failed');
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
      playSound('success');
      toast.success('Gateway added');
      setMethods((prev) => [res, ...prev]);
      setIsAdding(false);
      resetForm();
    } catch {
      playSound('error');
      toast.error('Add failed');
      console.error('Add failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setProcessingId(editingId);
    try {
      const endpoint = isManagement ? `payments/admin/methods/${editingId}/` : `payments/agent/methods/${editingId}/`;
      const res = await API.request<PaymentMethod>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ bank_name: newBank, bank_account: newAcc, account_name: newName }),
      });
      playSound('success');
      toast.success('Gateway updated');
      setMethods((prev) => prev.map(m => m.id === editingId ? res : m));
      setEditingId(null);
      resetForm();
    } catch {
      playSound('error');
      toast.error('Update failed');
      console.error('Update failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this payment method?')) return;
    setProcessingId(id);
    try {
      const endpoint = isManagement ? `payments/admin/methods/${id}/` : `payments/agent/methods/${id}/`;
      await API.request(endpoint, { method: 'DELETE' });
      playSound('success');
      toast.success('Gateway deleted');
      setMethods((prev) => prev.filter(m => m.id !== id));
    } catch {
      playSound('error');
      toast.error('Delete failed');
      console.error('Delete failed');
    } finally {
      setProcessingId(null);
    }
  };

  const resetForm = () => {
    setNewBank('');
    setNewAcc('');
    setNewName('');
  };

  const startEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setNewBank(m.bank_name);
    setNewAcc(m.bank_account);
    setNewName(m.account_name);
    setIsAdding(true);
  };

  if (!canManage) {
    return (
      <div className="py-40 text-center">
         <AlertCircle size={64} className="mx-auto text-red-500 mb-6 opacity-20" />
         <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Unauthorized Access</h2>
         <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Clearance Level AGENT or Higher Required</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Module: Pay_Protocols</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Gateway Config</h2>
      </div>

      <div className="space-y-8">
        <button 
          onClick={() => {
            if (isAdding) { setEditingId(null); resetForm(); }
            setIsAdding(!isAdding);
          }}
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
             <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-6">
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
                  disabled={processingId !== null}
                  className="w-full btn-primary h-16 rounded-[24px] mt-8 text-base shadow-md"
                >
                  {processingId !== null && processingId === (editingId || -1) && <Loader2 size={24} className="animate-spin mr-2" />}
                  {editingId ? 'UPDATE GATEWAY' : 'COMMIT TO REGISTRY'}
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
             methods.map(m => {
               const isOwner = m.created_by === user?.id;
               const canEdit = isAdmin || isOwner;

               return (
                 <div key={m.id} className={cn(
                   "bg-white border-2 p-8 rounded-[40px] flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-10 shadow-sm transition-all duration-500",
                   m.is_active ? "border-teal-500/20" : "border-slate-100 opacity-60 grayscale-[0.5]"
                 )}>
                    <div className="flex flex-col items-center lg:items-start flex-1">
                       <div className="flex items-center gap-4 mb-5">
                          <div className={cn(
                            "w-3 h-3 rounded-full shadow-lg",
                            m.is_active ? "bg-green-500 animate-pulse" : "bg-slate-300"
                          )} />
                          <span className="text-[12px] font-black text-teal-600 tracking-[0.4em] uppercase">{m.bank_name}</span>
                          <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase tracking-tighter">Owner: {m.created_by_name}</span>
                       </div>
                       <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-3">{m.bank_account}</p>
                       <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{m.account_name}</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-center lg:items-end gap-6">
                       {canEdit && (
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => startEdit(m)}
                              className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-black transition-all"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(m.id)}
                              disabled={processingId === m.id}
                              className="px-4 py-2 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-red-700 transition-all"
                            >
                              Delete
                            </button>
                         </div>
                       )}

                       <div className="flex items-center gap-4 border-t border-slate-100 pt-6 lg:border-none lg:pt-0">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
                          <button 
                            disabled={processingId !== null || !canEdit}
                            onClick={() => handleToggle(m.id, m.is_active)}
                            className={cn(
                              "p-1 hover:scale-105 active:scale-90 transition-all disabled:opacity-50",
                              !canEdit && "cursor-not-allowed opacity-30"
                            )}
                          >
                             {processingId === m.id ? (
                               <Loader2 size={32} className="animate-spin text-teal-600" />
                             ) : m.is_active ? (
                               <ToggleRight size={48} className="text-teal-600" />
                             ) : (
                               <ToggleLeft size={48} className="text-slate-200" />
                             )}
                          </button>
                       </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
}
