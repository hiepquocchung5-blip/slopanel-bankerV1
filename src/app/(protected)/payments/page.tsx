"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Plus, Minus, Landmark, CreditCard, User, ToggleLeft, ToggleRight, Loader2, Settings, Trash2 } from 'lucide-react';
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

  const isStaff = user?.is_staff;
  const isManagement = isStaff || user?.is_cashier;
  const canManage = isManagement || user?.user_type === 'AGENT' || user?.user_type === 'VIP';
  const isAdminView = isStaff; // Only true staff get the global registry view

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      // Admins (Staff) fetch everything from admin endpoint.
      // Others fetch only their own.
      const endpoint = isStaff ? 'payments/admin/methods/' : 'payments/admin/methods/'; 
      // Note: The backend already handles filtering based on is_staff in BankerPaymentMethodListView
      const data = await API.request<PaymentMethod[]>(endpoint);
      setMethods(data);
    } catch {
      console.error('Methods load failed');
    } finally {
      setIsLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    void fetchMethods();
  }, [fetchMethods]);

  const handleToggle = async (id: number, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      // Admins use the admin detail endpoint. Agents use it too but backend filters ownership.
      const endpoint = `payments/admin/methods/${id}/`;
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
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingId(-1);
    try {
      const endpoint = 'payments/admin/methods/';
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
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setProcessingId(editingId);
    try {
      const endpoint = `payments/admin/methods/${editingId}/`;
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
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this payment method?')) return;
    setProcessingId(id);
    try {
      const endpoint = `payments/admin/methods/${id}/`;
      await API.request(endpoint, { method: 'DELETE' });
      playSound('success');
      toast.success('Gateway deleted');
      setMethods((prev) => prev.filter(m => m.id !== id));
    } catch {
      playSound('error');
      toast.error('Delete failed');
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
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-3">
           {isAdminView ? 'Module: Global_Gateways' : 'Module: My_Gateways'}
         </span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">
           {isAdminView ? 'Gateway Registry' : 'My Protocols'}
         </h2>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => {
            if (isAdding) { setEditingId(null); resetForm(); }
            setIsAdding(!isAdding);
          }}
          className={cn(
            "w-full h-16 rounded-[24px] font-black text-base tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-sm",
            isAdding ? "bg-slate-100 text-slate-500 border border-slate-200" : "bg-slate-900 text-white hover:bg-black"
          )}
        >
          {isAdding ? <Minus size={20} /> : <Plus size={20} />}
          {isAdding ? 'CANCEL OPERATION' : 'REGISTER NEW GATEWAY'}
        </button>

        {isAdding && (
          <div className="bg-white border border-slate-200 p-10 rounded-[40px] animate-in slide-in-from-top duration-300 shadow-xl text-center">
             <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-left ml-2">Financial Institution</p>
                      <div className="relative">
                         <Landmark size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input 
                           className="w-full bg-slate-50 border border-slate-100 py-4 pl-16 pr-6 rounded-2xl text-sm font-black tracking-widest outline-none focus:border-amber-500/50 transition-all"
                           placeholder="e.g. KBZ Pay"
                           value={newBank}
                           onChange={e => setNewBank(e.target.value)}
                           required
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-left ml-2">Account Identifier</p>
                      <div className="relative">
                         <CreditCard size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input 
                           className="w-full bg-slate-50 border border-slate-100 py-4 pl-16 pr-6 rounded-2xl text-sm font-black tracking-widest outline-none focus:border-amber-500/50 transition-all"
                           placeholder="09..."
                           value={newAcc}
                           onChange={e => setNewAcc(e.target.value)}
                           required
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-left ml-2">Legal Entity Name</p>
                   <div className="relative">
                      <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 py-4 pl-16 pr-6 rounded-2xl text-sm font-black tracking-widest outline-none focus:border-amber-500/50 transition-all"
                        placeholder="U AUNG..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                   </div>
                </div>

                <button 
                  disabled={processingId !== null}
                  className="w-full h-16 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-black shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {processingId !== null && processingId === (editingId || -1) ? <Loader2 size={24} className="animate-spin" /> : (editingId ? 'UPDATE GATEWAY' : 'COMMIT TO REGISTRY')}
                </button>
             </form>
          </div>
        )}

        <div className="space-y-6">
           {isLoading ? (
             <div className="py-32 flex items-center justify-center">
                <Loader2 size={48} className="text-amber-500 animate-spin" />
             </div>
           ) : methods.length === 0 ? (
             <div className="py-20 bg-white border border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center shadow-sm">
                <AlertCircle size={64} className="mb-6 text-slate-200" />
                <p className="text-sm font-black tracking-[0.4em] uppercase text-slate-300">No Active Protocols</p>
             </div>
           ) : (
             methods.map(m => {
               const isOwner = m.created_by === user?.id;
               const canEdit = isStaff || isOwner;

               return (
                 <div key={m.id} className={cn(
                   "bg-white border border-slate-200 p-8 rounded-[40px] flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8 shadow-sm transition-all duration-500 group",
                   !m.is_active && "opacity-60 grayscale-[0.5]"
                 )}>
                    <div className="flex flex-col items-center md:items-start flex-1">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                          <span className="text-[11px] font-black text-amber-500 tracking-[0.3em] uppercase">{m.bank_name}</span>
                          {isStaff && (
                            <span className="text-[9px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-widest">
                               Owner: {m.created_by_name}
                            </span>
                          )}
                          {!isStaff && isOwner && (
                            <span className="text-[9px] font-black bg-green-500 text-white px-2.5 py-1 rounded-lg uppercase tracking-widest">
                               MY GATEWAY
                            </span>
                          )}
                       </div>
                       <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-3">{m.bank_account}</p>
                       <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{m.account_name}</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-6">
                       {canEdit && (
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={() => startEdit(m)}
                              className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                            >
                               <Settings size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(m.id)}
                              disabled={processingId === m.id}
                              className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                            >
                               <Minus size={18} />
                            </button>
                         </div>
                       )}

                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol</span>
                          <button 
                            disabled={processingId !== null || !canEdit}
                            onClick={() => handleToggle(m.id, m.is_active)}
                            className={cn(
                              "p-1 hover:scale-105 active:scale-90 transition-all disabled:opacity-50",
                              !canEdit && "cursor-not-allowed opacity-10"
                            )}
                          >
                             {processingId === m.id ? (
                               <Loader2 size={32} className="animate-spin text-amber-500" />
                             ) : m.is_active ? (
                               <ToggleRight size={48} className="text-amber-500" />
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
