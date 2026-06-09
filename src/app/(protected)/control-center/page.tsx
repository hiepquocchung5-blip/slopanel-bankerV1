'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';
import { 
  Monitor, Search, RefreshCw, Lock, 
  User, Activity, Smartphone, Clock, Map
} from 'lucide-react';

interface OccupiedMachine {
  id: number;
  floor: number;
  machine_number: number;
  player_phone: string;
  player_username: string | null;
  last_ping: string;
}

interface Island {
  id: number;
  name: string;
  occupied_machines: OccupiedMachine[];
}

export default function ControlCenterPage() {
  const { user } = useAuth();
  const [islands, setIslands] = useState<Island[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStatus = async () => {
    try {
      // Note: Need to add this endpoint to API_ENDPOINTS.GAME.CONTROL_CENTER
      const res = await apiClient.get('/api/game/admin/control-center/') as Island[];
      setIslands(res);
      setLastUpdated(new Date());
    } catch (e) {
      toast.error('Failed to sync live status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
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

  const totalActive = islands.reduce((acc, island) => acc + island.occupied_machines.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-[10px] font-black px-2 py-0.5 rounded text-white tracking-widest uppercase">Live_Stream</span>
            <span className="bg-neutral-800 text-[10px] font-black px-2 py-0.5 rounded text-neutral-400 tracking-widest uppercase">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            CONTROL CENTER
            <span className="bg-teal-500 text-black text-[10px] px-3 py-1 rounded-full border border-teal-400 font-black">
              {totalActive} ACTIVE PLAYERS
            </span>
          </h1>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            Real-time machine occupancy across all sectors
          </p>
        </div>

        <button 
          onClick={() => { setLoading(true); fetchStatus(); }}
          className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black text-white hover:bg-white hover:text-black transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          FORCE_SYNC
        </button>
      </div>

      {/* ISLAND GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {islands.map((island) => (
          <div key={island.id} className="bg-neutral-900/50 rounded-[40px] border border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <Map size={20} className="text-teal-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">{island.name}</h3>
                  <p className="text-[10px] text-neutral-500 font-bold tracking-widest">SECTOR_NODE_{island.id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white tabular-nums">{island.occupied_machines.length}</span>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-tighter">Occupied</p>
              </div>
            </div>

            <div className="p-6 flex-1">
              {island.occupied_machines.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/5 rounded-3xl">
                  <Activity size={24} className="text-neutral-700" />
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">No active sessions</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {island.occupied_machines.map((m) => (
                    <div key={m.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-teal-500/30 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-neutral-800 text-[10px] font-black px-2 py-0.5 rounded text-neutral-400 group-hover:text-teal-400 transition-colors">
                          M-{m.machine_number} | FL-{m.floor}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-teal-500 uppercase">Live</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <User size={14} className="text-neutral-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">{m.player_username || 'ANONYMOUS'}</p>
                          <p className="text-[10px] font-bold text-neutral-500 truncate">{m.player_phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Clock size={10} className="text-neutral-600" />
                        <span className="text-[9px] font-bold text-neutral-600 uppercase">
                          Last Ping: {new Date(m.last_ping).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
