'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, UserPlus, Link as LinkIcon, BarChart3, 
  Search, ExternalLink, ShieldCheck, Zap, TrendingUp, Copy, Plus, X, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InviteLink {
  id: number;
  slug: string;
  click_count: number;
  created_at: string;
}

interface Agent {
  id: number;
  phone_number: string;
  username: string;
  commission_coins: string;
  total_commission_earned: string;
  recruitment_count: number;
  invite_links: InviteLink[];
}

export default function AgentNetworkPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isAdmin = user?.is_staff || user?.is_cashier;

  const fetchAgents = async () => {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.BANKER.AGENTS);
      const data = Array.isArray(res) ? res : (res?.results || []);
      setAgents(data);
    } catch (e) {
      playSound('error');
      toast.error('Failed to load agent network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateLink = async () => {
    if (!activeAgent || !newSlug) return;
    setIsCreating(true);
    try {
      await apiClient.post(API_ENDPOINTS.BANKER.AGENT_LINKS(activeAgent.id), { slug: newSlug });
      playSound('success');
      toast.success('Recruitment link activated');
      setNewSlug('');
      fetchAgents(); // Refresh data
      setActiveAgent(null);
    } catch (e: any) {
      playSound('error');
      toast.error(e.message || 'Slug already taken');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.phone_number.includes(search) || (a.username && a.username.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRecruits = agents.reduce((acc, curr) => acc + curr.recruitment_count, 0);

  if (!user) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2 block">
             {isAdmin ? 'Management Registry :: Global Agents' : 'Personal Agency :: My Profile'}
           </span>
           <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">
             {isAdmin ? 'Agent Network' : 'My Agency'}
           </h2>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={80} className="text-white" />
           </div>
           <p className="text-[10px] font-black text-amber-500 tracking-[0.2em] uppercase mb-4">{isAdmin ? 'Total Force' : 'Agent Status'}</p>
           <h3 className="text-4xl font-black text-white">{isAdmin ? agents.length : 'ACTIVE'}</h3>
           <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest italic underline decoration-amber-500/30">
             {isAdmin ? 'Verified Recruitment Units' : 'Level 2 Agency Clearance'}
           </p>
        </div>

        <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserPlus size={80} className="text-white" />
           </div>
           <p className="text-[10px] font-black text-teal-500 tracking-[0.2em] uppercase mb-4">{isAdmin ? 'Net Recruitment' : 'Total Referrals'}</p>
           <h3 className="text-4xl font-black text-white">{isAdmin ? totalRecruits : (agents[0]?.recruitment_count || 0)}</h3>
           <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest italic underline decoration-teal-500/30">
             {isAdmin ? 'Total Global Conversions' : 'Direct Downline Network'}
           </p>
        </div>

        <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} className="text-white" />
           </div>
           <p className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase mb-4">Total Earnings</p>
           <h3 className="text-4xl font-black text-white">
              {agents.reduce((acc, curr) => acc + parseFloat(curr.total_commission_earned), 0).toLocaleString()}
           </h3>
           <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest italic underline decoration-blue-500/30">Accumulated Coins (Ks)</p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[28px] border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="LOCATE AGENT BY PHONE OR NAME..."
               className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-black tracking-widest outline-none focus:border-teal-500/50 transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
      )}

      {/* AGENT LIST / PROFILE */}
      <div className="space-y-6">
         {isAdmin && (
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest px-4 flex items-center gap-3">
             <BarChart3 size={18} className="text-teal-500" />
             Registry Records
           </h4>
         )}
         
         <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="p-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Agent Identity</th>
                     <th className="p-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase text-center">Referrals</th>
                     <th className="p-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase text-center">Short Links</th>
                     <th className="p-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Commission</th>
                     <th className="p-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase text-center">Security</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center"><Loader2 size={32} className="animate-spin mx-auto text-teal-500" /></td></tr>
                  ) : filteredAgents.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No active records found</td></tr>
                  ) : filteredAgents.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="p-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-teal-500 font-black shadow-lg shadow-slate-900/10 transition-transform group-hover:scale-110">
                                {agent.username?.[0] || agent.phone_number?.[agent.phone_number.length - 1]}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{agent.username || 'UNNAMED_AGENT'}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{agent.phone_number}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-6 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                             <TrendingUp size={12} />
                             <span className="text-xs font-black tabular-nums">{agent.recruitment_count}</span>
                          </div>
                       </td>
                       <td className="p-6">
                          <div className="flex flex-wrap justify-center gap-2">
                             {agent.invite_links.map(link => (
                               <button 
                                 key={link.id}
                                 onClick={() => {
                                   navigator.clipboard.writeText(`https://tinyslo.site/${link.slug}`);
                                   playSound('success');
                                   toast.success(`Copied: tinyslo.site/${link.slug}`);
                                 }}
                                 className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-200 active:scale-95"
                               >
                                  /{link.slug} <span className="ml-1 opacity-40">({link.click_count})</span>
                               </button>
                             ))}
                             <button 
                               onClick={() => setActiveAgent(agent)}
                               className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-all active:scale-90 shadow-lg shadow-teal-500/20"
                             >
                                <Plus size={20} strokeWidth={3} />
                             </button>
                          </div>
                       </td>
                       <td className="p-6">
                          <div>
                             <p className="text-base font-black text-slate-900 tabular-nums">
                                {parseFloat(agent.total_commission_earned).toLocaleString()}
                             </p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Earned</p>
                          </div>
                       </td>
                       <td className="p-6 text-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 mx-auto animate-pulse shadow-[0_0_10px_#22c55e]" />
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* CREATE LINK MODAL */}
      <AnimatePresence>
        {activeAgent && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setActiveAgent(null)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
               className="relative w-full max-w-[400px] bg-white rounded-[40px] p-10 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-8">
                   <div className="bg-teal-500/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                      <LinkIcon size={14} className="text-teal-600" />
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Link Generator</span>
                   </div>
                   <button onClick={() => setActiveAgent(null)}><X size={20} className="text-slate-300" /></button>
                </div>

                <div className="text-center mb-8">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Create short link for</p>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activeAgent.phone_number}</h3>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Slug</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase tracking-widest">tinyslo.site/</span>
                         <input 
                           type="text" 
                           placeholder="PRO_AGENT"
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-[145px] pr-4 text-sm font-black tracking-widest outline-none focus:border-teal-500/50"
                           value={newSlug}
                           onChange={(e) => setNewSlug(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                         />
                      </div>
                   </div>

                   <button 
                     disabled={!newSlug || isCreating}
                     onClick={handleCreateLink}
                     className="w-full h-16 bg-teal-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      {isCreating ? <Loader2 size={18} className="animate-spin" /> : (
                        <>
                           <ShieldCheck size={18} />
                           ACTIVATE LINK
                        </>
                      )}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
