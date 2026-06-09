'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';
import { 
  TrendingUp, Search, Lock, Users,
  ArrowUpRight, ArrowDownLeft, Coins, Award
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
  handled_withdrawals_total: string;
  handled_withdrawals_count: number;
  referred_users_count: number;
}

export default function AgentProgressPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProgress = async () => {
    try {
      const res = await apiClient.get('/api/users/admin/agents/progress/') as AgentProgress[];
      setAgents(res);
    } catch (e) {
      toast.error('Failed to sync agent metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const isStaff = user?.is_staff;
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-[10px] font-black px-2 py-0.5 rounded text-white tracking-widest uppercase">Growth_Engine</span>
            <span className="bg-neutral-800 text-[10px] font-black px-2 py-0.5 rounded text-neutral-400 tracking-widest uppercase">
              {agents.length} Registered Agents
            </span>
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

      {/* AGENT TABLE */}
      <div className="bg-neutral-900/50 rounded-[40px] border border-white/5 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-black/40 border-bottom border-white/5">
              <th className="p-6 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Agent Identity</th>
              <th className="p-6 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Recruits</th>
              <th className="p-6 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Handled Deposits</th>
              <th className="p-6 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Handled Withdrawals</th>
              <th className="p-6 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Commissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-sm">
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-neutral-700 font-bold tracking-widest uppercase">No agents found</td>
              </tr>
            ) : (
              filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${agent.user_type === 'VIP' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                        {agent.user_type[0]}
                      </div>
                      <div>
                        <p className="font-black text-white tracking-tight">{agent.username || 'NO_NAME'}</p>
                        <p className="text-[10px] font-bold text-neutral-500">{agent.phone_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <Users size={14} className="text-teal-500" />
                       <span className="text-lg font-black text-white">{agent.referred_users_count}</span>
                       <span className="text-[10px] font-bold text-neutral-600 uppercase">Users</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-green-500">
                         <ArrowUpRight size={14} />
                         <span className="text-md font-black tracking-tighter">{Number(agent.handled_deposits_total).toLocaleString()} Ks</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-600 uppercase pl-5">{agent.handled_deposits_count} TXs</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-red-500">
                         <ArrowDownLeft size={14} />
                         <span className="text-md font-black tracking-tighter">{Number(agent.handled_withdrawals_total).toLocaleString()} Ks</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-600 uppercase pl-5">{agent.handled_withdrawals_count} TXs</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-amber-500">
                         <Award size={16} />
                         <span className="text-lg font-black tracking-tighter">{Number(agent.total_commission_earned).toLocaleString()} Ks</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                         <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                           Balance: {Number(agent.commission_coins).toLocaleString()} Ks
                         </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
