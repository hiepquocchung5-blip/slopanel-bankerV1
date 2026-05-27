"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, User, Phone, Loader2, Search, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: number;
  phone_number: string;
  username: string | null;
  is_staff: boolean;
  is_cashier: boolean;
  user_type: 'NORMAL' | 'AGENT' | 'VIP';
}

type AppRole = 'PLAYER' | 'AGENT' | 'VIP' | 'CASHIER' | 'ADMIN';

export default function RolesPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const isAdmin = user?.is_staff;

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await API.request<Player[]>('users/admin/players/');
      setPlayers(data);
    } catch {
      console.error('Registry load failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  const handleUpdateRole = async (userId: number, role: AppRole) => {
    if (!isAdmin) return;
    if (!confirm(`Switch user role to ${role}?`)) return;

    setProcessingId(userId);
    try {
      await API.request(`users/admin/players/${userId}/update-role/`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      // Refresh list to reflect changes
      await fetchPlayers();
    } catch {
      console.error('Role update failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.phone_number.includes(searchTerm) || 
    (p.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleLabel = (p: Player): AppRole => {
    if (p.is_staff) return 'ADMIN';
    if (p.is_cashier) return 'CASHIER';
    if (p.user_type === 'AGENT') return 'AGENT';
    if (p.user_type === 'VIP') return 'VIP';
    return 'PLAYER';
  };

  const roleConfigs: { id: AppRole; label: string; color: string }[] = [
    { id: 'PLAYER', label: 'Player', color: 'bg-slate-100 text-slate-600' },
    { id: 'AGENT', label: 'Agent', color: 'bg-blue-100 text-blue-700' },
    { id: 'VIP', label: 'VIP', color: 'bg-purple-100 text-purple-700' },
    { id: 'CASHIER', label: 'Cashier', color: 'bg-orange-100 text-orange-700' },
    { id: 'ADMIN', label: 'Admin', color: 'bg-teal-100 text-teal-700' },
  ];

  if (!isAdmin) {
    return (
      <div className="py-32 text-center">
         <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 uppercase">Access Restricted</h2>
         <p className="text-slate-400 mt-2">Level 4 clearance required for role modification.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* PAGE DECLARATION */}
      <div className="mb-12 border-l-4 border-teal-600 pl-8 py-2">
         <h2 className="text-xs font-black text-teal-600 uppercase tracking-[0.4em] mb-1">Module: Auth_Registry</h2>
         <p className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Role Management</p>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-card p-6 mb-12 flex items-center gap-4">
         <Search size={20} className="text-slate-400" />
         <input 
           type="text"
           placeholder="Search registry by phone or username..."
           className="input-modern flex-1 !text-left !px-4 h-12"
           value={searchTerm}
           onChange={e => setSearchSearchTerm(e.target.value)}
         />
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-32 flex items-center justify-center">
            <Loader2 size={48} className="animate-spin text-teal-600" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="glass-card p-20 text-center opacity-40">
             <User size={80} className="mx-auto mb-6 text-slate-200" />
             <p className="text-sm font-black uppercase tracking-widest text-slate-400">Registry Entry Not Found</p>
          </div>
        ) : (
          filteredPlayers.map((p) => (
            <article key={p.id} className="glass-card overflow-hidden">
               <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                           <UserCheck size={20} />
                        </div>
                        <span className="text-xs font-black text-teal-600 uppercase tracking-widest">Active Member</span>
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1">
                        {p.username || 'Staff_Registry'}
                     </h3>
                     <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                        <Phone size={12} />
                        <span>{p.phone_number}</span>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                        <span className="text-slate-900">Current: {getRoleLabel(p)}</span>
                     </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                     {roleConfigs.map((config) => {
                        const isCurrent = getRoleLabel(p) === config.id;
                        return (
                           <button
                             key={config.id}
                             disabled={processingId === p.id || isCurrent}
                             onClick={() => handleUpdateRole(p.id, config.id)}
                             className={cn(
                               "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                               isCurrent 
                                 ? cn(config.color, "border-transparent opacity-100 shadow-sm")
                                 : "bg-white border-slate-200 text-slate-400 hover:border-teal-500 hover:text-teal-600"
                             )}
                           >
                              {processingId === p.id && !isCurrent ? <Loader2 size={12} className="animate-spin" /> : config.label}
                           </button>
                        );
                     })}
                  </div>
               </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
