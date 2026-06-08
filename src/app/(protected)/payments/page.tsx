"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertCircle, Plus, Minus, Landmark, CreditCard, User, 
  ToggleLeft, ToggleRight, Loader2, Settings, Trash2, 
  ShieldCheck, Search, Globe, Lock, CheckCircle2
} from 'lucide-react';
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
  notes?: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [newBank, setNewBank] = useState('');
  const [newAcc, setNewAcc] = useState('');
  const [newName, setNewName] = useState('');

  const isStaff = user?.is_staff;
  const isCashier = user?.is_cashier;
  const canManage = isStaff || isCashier;
  const isAdminView = isStaff; 

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = 'payments/admin/methods/'; 
      const data = await API.request<PaymentMethod[]>(endpoint);
      setMethods(data);
    } catch {
      console.error('Methods load failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMethods();
  }, [fetchMethods]);

  const handleToggle = async (id: number, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      const endpoint = `payments/admin/methods/${id}/`;
      const res = await API.request<{ is_active: boolean }>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      playSound('success');
      toast.success(currentStatus ? 'Gateway Deactivated' : 'Gateway Activated');
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
      toast.success('New Gateway Registered');
      setMethods((prev) => [res, ...prev]);
      setIsAdding(false);
      resetForm();
    } catch {
      playSound('error');
      toast.error('Registration failed');
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
      toast.success('Configuration Updated');
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
    if (!confirm('PERMANENTLY DELETE THIS GATEWAY? This action cannot be undone.')) return;
    setProcessingId(id);
    try {
      const endpoint = `payments/admin/methods/${id}/`;
      await API.request(endpoint, { method: 'DELETE' });
      playSound('success');
      toast.success('Gateway Expunged');
      setMethods((prev) => prev.filter(m => m.id !== id));
    } catch {
      playSound('error');
      toast.error('Deletion failed');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMethods = methods.filter(m => {
    const searchLower = search.toLowerCase();
    return (
      m.bank_name.toLowerCase().includes(searchLower) ||
      m.bank_account.toLowerCase().includes(searchLower) ||
      m.account_name.toLowerCase().includes(searchLower) ||
      m.created_by_name.toLowerCase().includes(searchLower)
    );
  });

  if (!canManage) {
    return (
      <div className="py-40 text-center">
         <Lock size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-white uppercase tracking-widest">Unauthorized Access</h2>
         <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Clearance Level CASHIER or Higher Required</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto px-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md">FINANCIAL_SEC_V4</span>
              {isAdminView ? (
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                  <ShieldCheck size={10} /> ROOT_ACCESS :: GLOBAL_AUDIT
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                  <Lock size={10} /> OWNED_PROTOCOL :: ISOLATED_VIEW
                </span>
              )}
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
             {isAdminView ? 'Gateway Registry' : 'My Personal Gateways'}
           </h1>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
             {isAdminView ? 'Managing global financial entrypoints' : `Securely managing gateways for ${user?.username || 'Authorized User'}`}
           </p>
        </div>

        <button 
          onClick={() => {
            if (isAdding) { setEditingId(null); resetForm(); }
            setIsAdding(!isAdding);
          }}
          className={cn(
            "h-14 px-8 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95",
            isAdding ? "bg-slate-100 text-slate-500 border border-slate-200" : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20"
          )}
        >
          {isAdding ? <Minus size={18} /> : <Plus size={18} />}
          {isAdding ? 'CANCEL_OPERATION' : 'REGISTER_NEW_GATEWAY'}
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text"
          placeholder="FILTER BY BANK, ACCOUNT, OWNER OR NAME..."
          className="w-full bg-white border border-slate-200 py-6 pl-16 pr-8 rounded-[32px] text-sm font-bold tracking-widest outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all shadow-sm uppercase placeholder:text-slate-300"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isAdding && (
        <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-[48px] animate-in slide-in-from-top-10 duration-500 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-2 h-full bg-teal-500" />
           
           <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingId ? 'Modify Protocol' : 'Identity Verification'}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Ensure all financial data is synchronized with banking provider</p>
           </div>

           <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase ml-1">Provider_Type</label>
                    <div className="relative group">
                       <Landmark size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                       <input 
                         className="w-full bg-slate-50 border border-slate-100 py-5 pl-16 pr-6 rounded-2xl text-sm font-black tracking-widest outline-none focus:bg-white focus:border-teal-500/50 transition-all shadow-inner"
                         placeholder="e.g. KBZ_PAY"
                         value={newBank}
                         onChange={e => setNewBank(e.target.value)}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase ml-1">Account_Hash</label>
                    <div className="relative group">
                       <CreditCard size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                       <input 
                         className="w-full bg-slate-50 border border-slate-100 py-5 pl-16 pr-6 rounded-2xl text-sm font-black tracking-widest outline-none focus:bg-white focus:border-teal-500/50 transition-all shadow-inner"
                         placeholder="09..."
                         value={newAcc}
                         onChange={e => setNewAcc(e.target.value)}
                         required
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase ml-1">Legal_Identity_Holder</label>
                 <div className="relative group">
                    <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 py-5 pl-16 pr-6 rounded-2xl text-sm font-black tracking-widest outline-none focus:bg-white focus:border-teal-500/50 transition-all shadow-inner"
                      placeholder="FULL NAME AS PER BANK RECORD"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      required
                    />
                 </div>
              </div>

              <button 
                disabled={processingId !== null}
                className="w-full h-18 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[12px] rounded-2xl hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98]"
              >
                {processingId !== null && processingId === (editingId || -1) ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    {editingId ? 'EXECUTE_UPDATE' : 'COMMIT_TO_REGISTRY'}
                  </>
                )}
              </button>
           </form>
        </div>
      )}

      {/* LISTING SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {isLoading ? (
           <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4">
              <Loader2 size={48} className="text-teal-500 animate-spin" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Decrypting financial vault...</p>
           </div>
         ) : filteredMethods.length === 0 ? (
           <div className="col-span-full py-32 bg-white border border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-slate-200" />
              </div>
              <p className="text-sm font-black tracking-[0.4em] uppercase text-slate-300">No active protocols detected</p>
              {search && <button onClick={() => setSearch('')} className="mt-4 text-teal-500 font-black text-[10px] uppercase underline underline-offset-4 tracking-widest">Clear search filters</button>}
           </div>
         ) : (
           filteredMethods.map(m => {
             const isOwner = m.created_by === user?.id;
             const canEdit = isStaff || isOwner;

             return (
               <div key={m.id} className={cn(
                 "bg-white border-2 p-8 rounded-[40px] flex flex-col justify-between gap-8 transition-all duration-500 relative overflow-hidden group hover:shadow-2xl hover:border-teal-500/20",
                 m.is_active ? "border-slate-100" : "border-slate-50 opacity-60 grayscale-[0.8]"
               )}>
                  
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-1",
                    m.is_active ? "bg-teal-500" : "bg-slate-300"
                  )} />

                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center",
                             m.is_active ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400"
                           )}>
                              <Landmark size={20} />
                           </div>
                           <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{m.bank_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           {isOwner && (
                             <span className="px-2 py-1 bg-teal-500/10 text-teal-600 text-[8px] font-black uppercase tracking-tighter rounded-md flex items-center gap-1">
                               <Lock size={10} /> PERSONAL
                             </span>
                           )}
                           {isAdminView && !isOwner && (
                             <span className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-tighter rounded-md flex items-center gap-1">
                               <Globe size={10} /> {m.created_by_name}
                             </span>
                           )}
                        </div>
                     </div>

                     <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Entrypoint_ID</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums break-all">{m.bank_account}</p>
                     </div>

                     <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                        <User size={16} className="text-slate-300" />
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account_Holder</span>
                           <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[180px]">{m.account_name}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                     <div className="flex items-center gap-2">
                        {canEdit && (
                          <>
                             <button 
                               onClick={() => startEdit(m)}
                               className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                               title="Edit Configuration"
                             >
                                <Settings size={18} />
                             </button>
                             <button 
                               onClick={() => handleDelete(m.id)}
                               disabled={processingId === m.id}
                               className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                               title="Expunge Gateway"
                             >
                                <Trash2 size={18} />
                             </button>
                          </>
                        )}
                     </div>

                     <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          m.is_active ? "text-teal-600" : "text-slate-400"
                        )}>
                          {m.is_active ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <button 
                          disabled={processingId !== null || !canEdit}
                          onClick={() => handleToggle(m.id, m.is_active)}
                          className={cn(
                            "p-1 hover:scale-110 active:scale-90 transition-all disabled:opacity-50",
                            !canEdit && "cursor-not-allowed opacity-10"
                          )}
                        >
                           {processingId === m.id ? (
                             <Loader2 size={32} className="animate-spin text-teal-500" />
                           ) : m.is_active ? (
                             <ToggleRight size={48} className="text-teal-500 drop-shadow-sm" />
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
  );
}
