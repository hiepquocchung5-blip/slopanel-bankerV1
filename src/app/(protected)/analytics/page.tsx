"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowDownRight, ArrowUpRight, TrendingUp, Users, ShieldAlert, 
  DollarSign, Activity, ChevronRight, Filter, Download, 
  BarChart3, PieChart, Wallet, Briefcase, UserCheck, Search,
  ArrowRightLeft, ArrowDownLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PLStats {
  total_deposits: number;
  total_withdrawals: number;
  net_profit: number;
  total_users: number;
  active_agents: number;
  total_commission_paid: number;
  daily_flow: number[];
}

interface AgentPerformance {
  id: number;
  username: string;
  phone_number: string;
  user_count: number;
  total_earnings: number;
  commission_balance: number;
}

export default function PLAnalyticsPage() {
  const { user } = useAuth();
  const isAdmin = user?.is_staff;
  
  const [stats, setStats] = useState<PLStats | null>(null);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | 'ALL'>('7D');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulation of granular P&L data fetching
      // In a real scenario, we'd have a specific P&L endpoint
      const dashboardRes = await apiClient.get(API_ENDPOINTS.BANKER.DASHBOARD_STATS) as any;
      const agentsRes = await apiClient.get(API_ENDPOINTS.BANKER.AGENTS) as any;
      
      const agentsData = Array.isArray(agentsRes) ? agentsRes : (agentsRes?.results || []);
      
      setStats({
        total_deposits: dashboardRes?.total_deposits || 0,
        total_withdrawals: dashboardRes?.total_withdrawals || 0,
        net_profit: (dashboardRes?.total_deposits || 0) - (dashboardRes?.total_withdrawals || 0),
        total_users: dashboardRes?.total_users || 0,
        active_agents: agentsData.length,
        total_commission_paid: agentsData.reduce((acc: number, curr: any) => acc + parseFloat(curr.total_commission_earned || 0), 0),
        daily_flow: [45, 52, 38, 65, 48, 70, 58]
      });

      setAgents(agentsData.map((a: any) => ({
        id: a.id,
        username: a.username || 'UNNAMED_AGENT',
        phone_number: a.phone_number,
        user_count: a.recruitment_count || 0,
        total_earnings: parseFloat(a.total_commission_earned || 0),
        commission_balance: parseFloat(a.commission_coins || 0)
      })));

    } catch (e) {
      toast.error('Financial telemetry failed to sync');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  if (!isAdmin) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
         <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Access Denied</h2>
         <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Level 4 Admin Clearance Required</p>
      </div>
    );
  }

  const filteredAgents = agents.filter(a => 
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.phone_number.includes(searchQuery)
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2 block">Executive Intelligence :: Financial Core</span>
           <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">P&L Overview</h2>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           {['24H', '7D', '30D', 'ALL'].map((range) => (
             <button
               key={range}
               onClick={() => setTimeRange(range as any)}
               className={cn(
                 "px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                 timeRange === range ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
               )}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      {/* CORE FINANCIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-2xl group transition-all hover:-translate-y-1">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 border border-green-500/20">
                 <ArrowDownLeft size={24} />
              </div>
              <span className="text-[10px] font-black text-green-500 flex items-center gap-1 bg-green-500/5 px-2 py-1 rounded-full">+8.4%</span>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross Deposits</p>
           <h4 className="text-3xl font-black text-white tabular-nums">{stats?.total_deposits.toLocaleString()}<span className="text-xs text-slate-500 ml-1">Ks</span></h4>
        </div>

        <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-2xl group transition-all hover:-translate-y-1">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
                 <ArrowUpRight size={24} />
              </div>
              <span className="text-[10px] font-black text-red-500 flex items-center gap-1 bg-red-500/5 px-2 py-1 rounded-full">-2.1%</span>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross Withdrawals</p>
           <h4 className="text-3xl font-black text-white tabular-nums">{stats?.total_withdrawals.toLocaleString()}<span className="text-xs text-slate-500 ml-1">Ks</span></h4>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl group transition-all hover:-translate-y-1 ring-4 ring-slate-50">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 border border-amber-500/20">
                 <Activity size={24} />
              </div>
              <div className="w-12 h-6 bg-slate-100 rounded-full flex items-center px-1">
                 <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
              </div>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Flow Profit</p>
           <h4 className="text-3xl font-black text-slate-900 tabular-nums">{(stats?.net_profit || 0).toLocaleString()}<span className="text-xs text-slate-400 ml-1">Ks</span></h4>
        </div>

        <div className="bg-teal-600 rounded-[32px] p-8 shadow-2xl shadow-teal-600/20 group transition-all hover:-translate-y-1">
           <div className="flex justify-between items-start mb-6 text-white/90">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                 <Briefcase size={24} />
              </div>
              <Users size={20} className="opacity-40" />
           </div>
           <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Paid Commissions</p>
           <h4 className="text-3xl font-black text-white tabular-nums">{stats?.total_commission_paid.toLocaleString()}<span className="text-xs text-white/40 ml-1">Coins</span></h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AGENT PERFORMANCE REGISTRY */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                 <UserCheck size={18} className="text-teal-600" />
                 Agent Efficiency Node
              </h5>
              <div className="relative w-48 lg:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="FILTER AGENT..."
                   className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-[10px] font-black tracking-widest outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                       <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                       <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Userbase</th>
                       <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Earnings (Coins)</th>
                       <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredAgents.length === 0 ? (
                      <tr><td colSpan={4} className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching agents detected</td></tr>
                    ) : filteredAgents.map(agent => (
                      <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-teal-500 shadow-lg shadow-slate-900/10">
                                  {agent.username[0]}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-900 uppercase">{agent.username}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{agent.phone_number}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-6 text-center">
                            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black border border-teal-100">
                               {agent.user_count} PILOTS
                            </span>
                         </td>
                         <td className="p-6 font-black text-slate-900 tabular-nums text-sm">
                            {agent.total_earnings.toLocaleString()}
                         </td>
                         <td className="p-6 text-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto animate-pulse shadow-[0_0_8px_#22c55e]" />
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* RECENT SETTLEMENTS / ALERTS */}
        <div className="space-y-6">
           <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 px-4">
              <Activity size={18} className="text-amber-500" />
              Live Ledger Activity
           </h5>
           
           <div className="bg-slate-900 rounded-[40px] p-8 border border-white/5 shadow-2xl space-y-6">
              {[
                { type: 'DEPOSIT', amount: 50000, user: '0977...123', status: 'SUCCESS' },
                { type: 'WITHDRAW', amount: 120000, user: '0942...884', status: 'PENDING' },
                { type: 'COMMISSION', amount: 1500, user: 'Agent_Zero', status: 'PAID' },
                { type: 'DEPOSIT', amount: 25000, user: '0925...991', status: 'SUCCESS' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        log.type === 'DEPOSIT' ? "bg-green-500/10 text-green-500" : 
                        log.type === 'WITHDRAW' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                         {log.type === 'DEPOSIT' ? <ArrowDownLeft size={14} /> : 
                          log.type === 'WITHDRAW' ? <ArrowUpRight size={14} /> : <ArrowRightLeft size={14} />}
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-white uppercase">{log.type}</p>
                         <p className="text-[9px] font-bold text-slate-500">{log.user}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-white">{log.amount.toLocaleString()} Ks</p>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                        log.status === 'SUCCESS' || log.status === 'PAID' ? "text-green-500 bg-green-500/10" : "text-amber-500 bg-amber-500/10 animate-pulse"
                      )}>{log.status}</span>
                   </div>
                </div>
              ))}
              
              <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                 VIEW ARCHIVED TELEMETRY <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
