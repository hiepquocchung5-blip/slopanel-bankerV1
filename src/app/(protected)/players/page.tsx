"use client";

import React, { useEffect, useState, useCallback, memo } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Ban, Coins, Loader2, Landmark, Shield, 
  ShieldCheck, User, UserX, ShieldAlert, X, ChevronRight, 
  Delete, RotateCcw, CheckCircle2, LayoutDashboard, Users, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';

interface Player {
  id: number;
  phone_number: string;
  is_active: boolean;
  user_type: string;
  is_staff: boolean;
  is_cashier: boolean;
  slopara_coins: number;
  slopara_credits: number;
  lifetime_deposit: string;
}

interface ToggleBanResponse {
  is_active: boolean;
}

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // States
  const [activeTopupPlayer, setActiveTopupPlayer] = useState<Player | null>(null);
  const [activeRolePlayer, setActiveRolePlayer] = useState<Player | null>(null);
  const [coinAmount, setCoinAmount] = useState<string>('');

  const isAdmin = user?.is_staff;
  const isManagement = user?.is_staff || user?.is_cashier;

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    try {
      const data = await API.request<Player[]>(`users/admin/players/?search=${searchQuery}`);
      setPlayers(data);
    } catch {
      playSound('error');
      toast.error('Players search failed');
      console.error('Players search failed');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleToggleBan = async (id: number) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to change this user\'s access status?')) return;

    setProcessingId(id);
    try {
      const res = await API.request<ToggleBanResponse>(`users/admin/players/${id}/toggle-ban/`, { method: 'POST' });
      playSound('success');
      toast.success(res.is_active ? 'User activated' : 'User banned');
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: res.is_active } : p)));
    } catch {
      playSound('error');
      toast.error('Toggle ban failed');
      console.error('Toggle ban failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearSession = async (id: number) => {
    if (!confirm('This will force the player out of all machines. Proceed?')) return;
    setProcessingId(id);
    try {
      await API.request(`users/admin/players/${id}/clear-session/`, { method: 'POST' });
      playSound('success');
      toast.success('Active sessions cleared successfully.');
    } catch {
      playSound('error');
      toast.error('Failed to clear sessions.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleImpersonate = async (id: number) => {
    if (!confirm('Login as this user for support? Your current session will be saved in memory.')) return;
    setProcessingId(id);
    try {
      const res = await API.request<{ access: string }>(`users/admin/players/${id}/impersonate/`, { method: 'POST' });
      // Save current token in session storage to allow "Switch Back" (Future Feature)
      const currentToken = localStorage.getItem('banker_token');
      if (currentToken) sessionStorage.setItem('original_banker_token', currentToken);
      
      localStorage.setItem('banker_token', res.access);
      window.location.href = '/'; // Reload to apply new identity
    } catch {
      playSound('error');
      toast.error('Impersonation Failed. Root clearance required.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (id: number, role: string) => {
    if (!isAdmin) return;
    setProcessingId(id);
    try {
      await API.request(`users/admin/players/${id}/update-role/`, { 
        method: 'POST',
        body: JSON.stringify({ role })
      });
      playSound('success');
      toast.success('Role updated successfully');
      setActiveRolePlayer(null);
      handleSearch(); // Refresh list
    } catch {
      playSound('error');
      toast.error('Role Update Failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddCoinsFinal = async () => {
    if (!isAdmin || !coinAmount || !activeTopupPlayer) return;
    
    setProcessingId(activeTopupPlayer.id);
    try {
      await API.request(`users/admin/players/${activeTopupPlayer.id}/add-coins/`, { 
        method: 'POST',
        body: JSON.stringify({ amount: coinAmount })
      });
      playSound('success');
      toast.success('Assets transferred successfully');
      setCoinAmount('');
      setActiveTopupPlayer(null);
      // Refresh current player list
      handleSearch();
    } catch {
      playSound('error');
      toast.error('Transaction Failed. Check secure node connection.');
    } finally {
      setProcessingId(null);
    }
  };

  // --- CUSTOM KEYPAD LOGIC ---
  const handleKeyPress = (val: string) => {
    if (coinAmount.length >= 7) return; // Cap at 9,999,999
    setCoinAmount(prev => prev + val);
  };

  const handleDelete = () => setCoinAmount(prev => prev.slice(0, -1));
  const handleClear = () => setCoinAmount('');

  if (!isManagement) {
    return (
      <div className="py-32 text-center">
         <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Restricted</h2>
         <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Level 3 Clearance Required</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SEARCH HUB */}
      <section className="bg-slate-900 rounded-[40px] p-8 md:p-12 shadow-2xl border border-amber-500/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div>
             <span className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase">Staff Node :: Registry_Scan</span>
             <h2 className="mt-2 text-4xl font-black text-white uppercase tracking-tight">Registry Search</h2>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Node Operator</p>
             <p className="mt-1 text-sm font-black uppercase text-amber-500">{user?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Input Phone or Username..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white text-lg placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all focus:ring-4 focus:ring-amber-500/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => { setSearchQuery(''); setPlayers([]); handleSearch(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-amber-500 text-black font-black uppercase tracking-widest px-12 py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-amber-600 transition-all active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Execute Scan'}
          </button>
        </form>
      </section>

      {/* RESULTS LIST */}
      <div className="space-y-6">
        {players.length === 0 && !isLoading && searchQuery && (
          <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px]">
            <RotateCcw size={48} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Zero Matching Records Found</p>
          </div>
        )}

        {players.map((p) => (
          <motion.article
            layout
            key={p.id}
            className={cn(
              'bg-white border border-slate-200 p-6 md:p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-amber-500/20 transition-all group',
              !p.is_active && 'opacity-60 grayscale bg-slate-50'
            )}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <div
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-[28px] border-2 shadow-inner transition-transform group-hover:scale-105',
                    p.is_active
                      ? 'border-amber-500/20 bg-amber-50 text-amber-600'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                  )}
                >
                  {p.is_active ? <Shield size={32} /> : <UserX size={32} />}
                </div>
                <div>
                  <p className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    {p.phone_number}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
                      p.is_staff ? "bg-red-600 text-white" : p.is_cashier ? "bg-teal-600 text-white" : p.user_type === 'AGENT' ? "bg-blue-600 text-white" : "bg-slate-900 text-amber-500"
                    )}>
                      {p.is_staff ? 'ADMIN' : p.is_cashier ? 'CASHIER' : p.user_type}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                       ID_{p.id.toString().padStart(6, '0')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[700px]">
                <div className="bg-slate-50 border border-slate-100 px-6 py-6 rounded-3xl flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm">
                    <Coins size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Withdrawable Coins</p>
                    <p className="text-xl font-black tabular-nums text-slate-900">{(p as any).slopara_coins?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-6 py-6 rounded-3xl flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
                    <Zap size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Playable Credits</p>
                    <p className="text-xl font-black tabular-nums text-slate-900">{(p as any).slopara_credits?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-6 py-6 rounded-3xl flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/5 border border-slate-900/10 flex items-center justify-center text-slate-400 shadow-sm">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Lifetime Deposit</p>
                    <p className="text-xl font-black tabular-nums text-slate-900">{parseFloat(p.lifetime_deposit).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isManagement && (
                  <button
                    disabled={processingId === p.id}
                    onClick={() => handleClearSession(p.id)}
                    className="h-16 px-5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm group"
                    title="Force Exit Session"
                  >
                    {processingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                  </button>
                )}

                {user?.is_staff && (
                  <button
                    disabled={processingId === p.id}
                    onClick={() => handleImpersonate(p.id)}
                    className="h-16 px-5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-teal-500 hover:border-teal-100 transition-all active:scale-95 shadow-sm"
                    title="Login As User"
                  >
                    {processingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <User size={18} />}
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => setActiveRolePlayer(p)}
                    className="h-16 px-6 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <Shield size={18} className="text-teal-500" />
                    Role
                  </button>
                )}

                {isManagement && (
                  <>
                    <button
                      onClick={() => setActiveTopupPlayer(p)}
                      className="h-16 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg"
                    >
                      <Zap size={18} className="text-amber-500" />
                      Add Credits
                    </button>
                    
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleToggleBan(p.id)}
                      className={cn(
                        'h-16 w-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md border',
                        p.is_active ? 'border-red-100 bg-red-50 text-red-500' : 'border-emerald-100 bg-emerald-50 text-emerald-500'
                      )}
                    >
                      {processingId === p.id ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <Ban size={24} />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* --- PREMIUM TOPUP MODAL --- */}
      <AnimatePresence>
        {activeTopupPlayer && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setActiveTopupPlayer(null)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
             />
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-[500px] bg-white rounded-[50px] shadow-2xl overflow-hidden"
             >
                <div className="p-8 md:p-10">
                   <div className="flex justify-between items-center mb-8">
                      <div className="bg-blue-500/10 border border-blue-500/20 px-5 py-2 rounded-full flex items-center gap-2">
                         <Zap size={16} className="text-blue-600" />
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Credit Allocation Mode</span>
                      </div>
                      <button onClick={() => setActiveTopupPlayer(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                         <X size={24} className="text-slate-400" />
                      </button>
                   </div>

                   <div className="text-center mb-10">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Target Account</p>
                      <h3 className="text-3xl font-black text-slate-900 text-center">{activeTopupPlayer.phone_number}</h3>
                   </div>

                   {/* AMOUNT DISPLAY */}
                   <div className="bg-slate-900 border-2 border-blue-500/20 rounded-[32px] p-10 mb-10 flex flex-col items-center shadow-xl">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 text-center">Allocation Value</span>
                      <div className="flex items-baseline gap-4 justify-center">
                         <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                            {coinAmount ? Number(coinAmount).toLocaleString() : '0'}
                         </span>
                         <span className="text-blue-500 font-black text-lg uppercase text-center">Credits</span>
                      </div>
                      <p className="mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center italic">
                        Note: Credits are for gameplay only and non-withdrawable.
                      </p>
                   </div>

                   {/* QUICK PRESETS */}
                   <div className="grid grid-cols-4 gap-4 mb-10">
                      {[100, 500, 1000, 5000].map(val => (
                        <button 
                          key={val}
                          onClick={() => setCoinAmount(val.toString())}
                          className="bg-slate-50 border border-slate-200 h-16 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500/40 hover:bg-blue-50 transition-all group active:scale-95"
                        >
                           <span className="text-base font-black text-slate-900 text-center group-hover:text-blue-600">{val}</span>
                           <span className="text-[8px] font-black text-slate-400 uppercase text-center">{val.toLocaleString()} CR</span>
                        </button>
                      ))}
                   </div>

                   {/* CUSTOM KEYPAD */}
                   <div className="grid grid-cols-3 gap-5 mb-12">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button 
                          key={n}
                          onClick={() => handleKeyPress(n.toString())}
                          className="h-20 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-800 hover:bg-slate-50 hover:border-amber-500/30 active:scale-90 transition-all shadow-sm"
                        >
                          {n}
                        </button>
                      ))}
                      <button onClick={handleClear} className="h-20 rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all active:scale-90">
                        <RotateCcw size={24} />
                      </button>
                      <button onClick={() => handleKeyPress('0')} className="h-20 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-800 hover:bg-slate-50 active:scale-90 transition-all shadow-sm">
                        0
                      </button>
                      <button onClick={handleDelete} className="h-20 rounded-[24px] bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm">
                        <Delete size={24} />
                      </button>
                   </div>

                   <button 
                     disabled={!coinAmount || processingId !== null}
                     onClick={handleAddCoinsFinal}
                     className="w-full h-20 bg-blue-600 text-white font-black uppercase tracking-widest text-base rounded-[24px] flex items-center justify-center gap-4 hover:bg-blue-700 transition-all active:scale-95 shadow-[0_15px_40px_rgba(37,99,235,0.3)]"
                   >
                     {processingId ? <Loader2 className="animate-spin" /> : (
                        <>
                          <CheckCircle2 size={24} />
                          Finalize Credit Transfer
                        </>
                     )}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ROLE MANAGEMENT MODAL --- */}
      <AnimatePresence>
        {activeRolePlayer && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setActiveRolePlayer(null)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
             />
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-[450px] bg-white rounded-[50px] shadow-2xl overflow-hidden"
             >
                <div className="p-8 md:p-10">
                   <div className="flex justify-between items-center mb-8">
                      <div className="bg-teal-500/10 border border-teal-500/20 px-5 py-2 rounded-full flex items-center gap-2">
                         <ShieldCheck size={16} className="text-teal-600" />
                         <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Role Authorization</span>
                      </div>
                      <button onClick={() => setActiveRolePlayer(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                         <X size={24} className="text-slate-400" />
                      </button>
                   </div>

                   <div className="text-center mb-10">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Account ID</p>
                      <h3 className="text-3xl font-black text-slate-900 text-center">{activeRolePlayer.phone_number}</h3>
                   </div>

                   <div className="grid grid-cols-1 gap-3 mb-8">
                      {[
                        { id: 'PLAYER', label: 'NORMAL PLAYER', desc: 'Standard user access', icon: LayoutDashboard },
                        { id: 'AGENT', label: 'OFFICIAL AGENT', desc: 'Recruitment & Referral access', icon: Users },
                        { id: 'CASHIER', label: 'FINANCE CASHIER', desc: 'Approve deposits/withdraws', icon: CreditCard },
                        { id: 'ADMIN', label: 'SYSTEM ADMIN', desc: 'Full core access level 4', icon: ShieldAlert },
                      ].map(role => (
                        <button 
                          key={role.id}
                          onClick={() => handleUpdateRole(activeRolePlayer.id, role.id)}
                          disabled={processingId !== null}
                          className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-5 hover:bg-teal-50 hover:border-teal-500/30 transition-all group"
                        >
                           <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 shadow-sm transition-colors">
                              <role.icon size={20} />
                           </div>
                           <div className="flex-1 text-left">
                              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{role.label}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{role.desc}</p>
                           </div>
                           <ChevronRight size={16} className="text-slate-200 group-hover:text-teal-300" />
                        </button>
                      ))}
                   </div>

                   <button 
                     onClick={() => setActiveRolePlayer(null)}
                     className="w-full h-16 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all"
                   >
                     Cancel Authorization
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
