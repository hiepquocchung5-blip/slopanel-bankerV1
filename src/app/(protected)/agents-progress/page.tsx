'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';
import { 
  TrendingUp, Search, Lock, Users,
  ArrowUpRight, ArrowDownLeft, Coins, Award,
  CheckCircle2, XCircle, Send
} from 'lucide-react';

interface AgentProgress {
  id: number;
  username: string | null;
  phone_number: string;
  user_type: string;
  commission_coins: string;
  total_commission_earned: string;
  handled_deposits_total: string;
  handled_deposits_count: number;
  deposit_commission_earned: string;
  transfer_remaining_to_ceo: string;
  total_transferred_to_ceo: string;
  outstanding_balance_to_ceo: string;
  handled_withdrawals_total: string;
  handled_withdrawals_count: number;
  referred_users_count: number;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentProgress[];
}

export default function AgentProgressPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Settlement Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentProgress | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProgress = async (pageNumber: number = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`users/admin/agents/progress/?page=${pageNumber}`) as PaginatedResponse;
      setAgents(res.results);
      setTotalPages(Math.ceil(res.count / 10)); // Assuming page_size = 10
    } catch (e) {
      toast.error('Failed to sync agent metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress(page);
  }, [page]);

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !settleAmount) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`users/admin/agents/${selectedAgent.id}/settle/`, {
        amount: settleAmount,
        note: settleNote
      }) as any;
      
      playSound('success');
      toast.success(res.message || 'Settlement logged successfully');
      setSettleModalOpen(false);
      setSettleAmount('');
      setSettleNote('');
      fetchProgress(page); // Refresh data
    } catch (error: any) {
      playSound('error');
      toast.error(error.message || 'Failed to log settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStaff = user?.is_staff;
  const isCEO = user?.user_type === 'CEO' || user?.is_superuser;

  if (!isStaff) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
         <Lock size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Access Denied</h2>
         <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Level 4 Clearance Required</p>
      </div>
    );
  }

  const filteredAgents = agents.filter(a => {
    const s = search.toLowerCase();
    return (a.username?.toLowerCase() || "").includes(s) || a.phone_number.includes(s);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-[10px] font-black px-2 py-0.5 rounded text-white tracking-widest uppercase">Growth_Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            AGENT PROGRESS
          </h1>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            Comprehensive recruitment and commission performance monitor
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
        <input 
          type="text" 
          placeholder="SEARCH BY PHONE OR USERNAME..."
          className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold tracking-widest outline-none transition-all placeholder:text-neutral-700 focus:border-amber-500/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MOBILE-FIRST CARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.length === 0 && !loading && (
           <div className="col-span-full py-20 text-center text-neutral-700 font-bold tracking-widest uppercase border-2 border-dashed border-white/5 rounded-3xl">
             No agents found
           </div>
        )}
        
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="bg-gradient-to-br from-neutral-900 to-black border border-white/5 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
            
            {/* Background Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 blur-3xl rounded-full opacity-20 transition-all duration-500 ${agent.user_type === 'VIP' ? 'bg-amber-500' : 'bg-teal-500'}`}></div>

            {/* Header: Identity */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${agent.user_type === 'VIP' ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-black' : 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white'}`}>
                  {agent.user_type[0]}
                </div>
                <div>
                  <h3 className="font-black text-xl text-white tracking-tight leading-none">{agent.username || 'NO_NAME'}</h3>
                  <p className="text-[11px] font-bold text-neutral-400 mt-1">{agent.phone_number}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-teal-400 mb-1">
                  <Users size={14} />
                  <span className="text-xl font-black">{agent.referred_users_count}</span>
                </div>
                <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Recruits</p>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-3 relative z-10">
              
              {/* Gross vs Net */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <h4 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ArrowUpRight size={12} className="text-green-500" /> Deposit Reconciliations
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-neutral-400">Total Handled</span>
                    <span className="text-sm font-black text-green-400">{Number(agent.handled_deposits_total).toLocaleString()} <span className="text-[10px] opacity-50">Ks</span></span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-neutral-400">10% Agent Cut</span>
                    <span className="text-sm font-black text-amber-400">- {Number(agent.deposit_commission_earned).toLocaleString()} <span className="text-[10px] opacity-50">Ks</span></span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-end">
                    <span className="text-xs font-black text-white">Net Owed to CEO</span>
                    <span className="text-base font-black text-white">{Number(agent.transfer_remaining_to_ceo).toLocaleString()} <span className="text-[10px] opacity-50">Ks</span></span>
                  </div>
                </div>
              </div>

              {/* Settlement Status */}
              <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl p-4 border border-indigo-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Send size={10} /> CEO Settlements</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-neutral-400">Already Sent</span>
                    <span className="text-sm font-black text-indigo-400">{Number(agent.total_transferred_to_ceo).toLocaleString()} <span className="text-[10px] opacity-50">Ks</span></span>
                  </div>
                  <div className="flex justify-between items-end bg-red-500/10 p-2 rounded-xl -mx-2">
                    <span className="text-xs font-black text-red-400">Outstanding Debt</span>
                    <span className="text-lg font-black text-red-400">{Number(agent.outstanding_balance_to_ceo).toLocaleString()} <span className="text-[10px] opacity-50">Ks</span></span>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-white/5 flex gap-3 relative z-10">
              {isCEO && Number(agent.outstanding_balance_to_ceo) > 0 && (
                <button 
                  onClick={() => { setSelectedAgent(agent); setSettleModalOpen(true); }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  Log Transfer
                </button>
              )}
              <div className="flex-1 bg-neutral-800/50 py-3 rounded-xl text-center border border-white/5">
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-0.5">Withdrawals</p>
                <p className="text-xs font-black text-red-400">{Number(agent.handled_withdrawals_total).toLocaleString()} Ks</p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
           <button 
             disabled={page === 1}
             onClick={() => setPage(p => p - 1)}
             className="px-6 py-3 rounded-2xl bg-neutral-900 border border-white/5 text-[10px] font-black text-neutral-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:text-neutral-500 active:scale-95"
           >
              PREV_PAGE
           </button>
           <div className="flex items-center px-6 bg-black/50 rounded-2xl border border-white/10 shadow-inner">
              <span className="text-[10px] font-black text-amber-500">PAGE_{page}_OF_{totalPages}</span>
           </div>
           <button 
             onClick={() => setPage(p => p + 1)}
             disabled={page >= totalPages}
             className="px-6 py-3 rounded-2xl bg-neutral-900 border border-white/5 text-[10px] font-black text-neutral-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:text-neutral-500 active:scale-95"
           >
              NEXT_PAGE
           </button>
        </div>
      )}

      {/* SETTLEMENT MODAL */}
      {settleModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSettleModalOpen(false)}></div>
          
          <div className="bg-neutral-900 border border-white/10 rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSettleModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>

            <div className="mb-8">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                <Send size={24} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter">Log Transfer</h2>
              <p className="text-sm font-bold text-neutral-400 mt-1">
                Record money received from <span className="text-white">{selectedAgent.username || selectedAgent.phone_number}</span>
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Current Outstanding Debt</p>
              <p className="text-2xl font-black text-red-500">{Number(selectedAgent.outstanding_balance_to_ceo).toLocaleString()} Ks</p>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-2">Amount Received (Ks)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-lg outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. 50000"
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 ml-2">Transfer Note / Ref ID</label>
                <input 
                  type="text"
                  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none focus:border-indigo-500 transition-colors placeholder:text-neutral-700"
                  placeholder="e.g. WavePay Transfer - June 9"
                  value={settleNote}
                  onChange={e => setSettleNote(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl mt-4 transition-all disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Receipt'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
