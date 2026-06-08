'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'react-hot-toast';
import { playSound } from '@/lib/sound';
import { 
  CheckCircle2, XCircle, Search, Filter, Users,
  ArrowUpRight, ArrowDownLeft, Clock, History, AlertTriangle, Image as ImageIcon
} from 'lucide-react';

interface Transaction {
  id: number;
  user_phone: string;
  user_type: string;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  txd_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bank_info: string;
  user_bank_name: string;
  user_bank_account: string;
  user_account_name: string;
  created_at: string;
  screenshot: string | null;
  referrer_username?: string;
  payment_method_details?: {
    bank_name: string;
    bank_account: string;
    account_name: string;
    created_by_name: string;
  };
}

export default function AuditQueuePage() {
  const { user } = useAuth();
  const [activeTab] = useState<'WITHDRAW'>('WITHDRAW');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchTxs = async () => {
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.BANKER.TRANSACTIONS}?page=${page}`) as any;
      // V2: slopanel-banker use fetch wrapper which returns data directly
      const newTxs = Array.isArray(res) ? res : (res?.results || []);
      
      // V2: Detect new pending transactions for alerting
      const currentPendingIds = new Set(txs.filter(t => t.status === 'PENDING').map(t => t.id));
      const hasNewPending = newTxs.some((t: any) => t.status === 'PENDING' && !currentPendingIds.has(t.id));

      if (hasNewPending && txs.length > 0) {
        playSound('alert');
        toast.success('NEW PENDING REQUEST DETECTED!', {
          icon: '🔔',
          duration: 8000,
          style: {
            borderRadius: '12px',
            background: '#18181b',
            color: '#fff',
            fontWeight: 'black',
            border: '2px solid #fbbf24',
            padding: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          },
        });
      }

      setTxs(newTxs);
    } catch (e) {
      playSound('error');
      toast.error('Failed to sync transaction queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
    const interval = setInterval(fetchTxs, 15000); 
    return () => clearInterval(interval);
  }, [page]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setProcessingId(id);
    try {
      await apiClient.post(API_ENDPOINTS.BANKER.TRANSACTION_ACTION(id, action));
      playSound('success');
      toast.success(`Transaction #${id} ${action}ed successfully`);
      setTxs(prev => prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : t));
    } catch (e: any) {
      playSound('error');
      toast.error(e.response?.data?.error || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTxs = txs.filter(t => {
    const matchesTab = t.tx_type === 'WITHDRAW';
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    
    const searchLower = search.toLowerCase();
    const phone = (t.user_phone || "").toLowerCase();
    const idStr = (t.id || "").toString();
    const agent = (t.referrer_username || "").toLowerCase();

    const matchesSearch = 
      phone.includes(searchLower) || 
      idStr.includes(searchLower) || 
      agent.includes(searchLower);

    return matchesTab && matchesStatus && matchesSearch;
  });

  const pendingCount = txs.filter(t => t.tx_type === 'WITHDRAW' && t.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            WITHDRAWAL QUEUE
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse border border-red-400">
                {pendingCount} PENDING
              </span>
            )}
          </h1>
          <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest mt-1">Real-time Payout Ledger</p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH BY PHONE, ID, AGENT, OR BANK..."
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold tracking-widest outline-none transition-all placeholder:text-neutral-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lg:col-span-2 flex bg-neutral-900/50 p-1 rounded-xl border border-white/5">
           {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
             <button
               key={s}
               onClick={() => setStatusFilter(s)}
               className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${statusFilter === s ? 'bg-neutral-700 text-white' : 'text-neutral-600 hover:text-neutral-400'}`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-neutral-900/50 rounded-3xl border border-white/5 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-black/40 border-bottom border-white/5">
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">User Identity</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase text-center">Source Agent</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Amount</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Payout Destination</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Status</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Created At</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-sm">
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-20 text-center text-neutral-700 font-bold tracking-widest uppercase">No transactions found in queue</td>
              </tr>
            ) : (
              filteredTxs.map((tx) => (
                <tr key={tx.id} className={`hover:bg-white/5 transition-colors ${tx.status === 'PENDING' ? 'text-white' : 'text-neutral-500'}`}>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-black ${tx.user_type === 'VIP' ? 'bg-amber-500/10 text-amber-500' : 'bg-neutral-700 text-neutral-400'}`}>
                          [{tx.user_type}]
                        </span>
                        <span className="font-bold tracking-tighter text-sm">{tx.user_phone}</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-600 tracking-widest uppercase pl-0.5">ID: {tx.user_id || '---'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-neutral-800 border border-white/5">
                         <Users size={12} className="text-amber-500" />
                         <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                            {tx.referrer_username || 'SYSTEM'}
                         </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-black">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-lg text-amber-500 tracking-tighter">{Number(tx.amount).toLocaleString()} <span className="text-[10px] opacity-50">Ks</span></span>
                      <span className="text-[10px] font-black text-amber-600/50 uppercase tracking-widest">SLOPARA_COINS</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                         <span className="font-bold text-white text-xs tracking-tight uppercase">
                           {tx.user_bank_name}
                         </span>
                       </div>
                       <span className="text-[11px] font-black text-neutral-300 tracking-widest ml-3">
                         {tx.user_bank_account}
                       </span>
                       <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-3">
                         HOLDER: {tx.user_account_name || 'UNKNOWN'}
                       </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${
                      tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                      tx.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-neutral-500">
                    <span className="hidden lg:inline">
                      {new Date(tx.created_at).toLocaleString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
                      })}
                    </span>
                    <span className="lg:hidden">
                      {new Date(tx.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2 lg:gap-3">
                      {tx.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleAction(tx.id, 'approve')}
                            disabled={processingId === tx.id}
                            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center bg-green-500 text-black rounded-xl lg:rounded-2xl hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 active:scale-90"
                            title="Authorize"
                          >
                            <CheckCircle2 size={18} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleAction(tx.id, 'reject')}
                            disabled={processingId === tx.id}
                            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center bg-red-600 text-white rounded-xl lg:rounded-2xl hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 active:scale-90"
                            title="Reject"
                          >
                            <XCircle size={18} strokeWidth={3} />
                          </button>
                        </>
                      )}
                      {tx.status !== 'PENDING' && (
                        <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center opacity-30">
                          {tx.status === 'APPROVED' ? <CheckCircle2 size={20} className="text-green-500" /> : <XCircle size={20} className="text-red-500" />}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 mt-8">
         <button 
           disabled={page === 1}
           onClick={() => setPage(p => p - 1)}
           className="px-6 py-2 rounded-xl bg-neutral-900 border border-white/5 text-[10px] font-black text-neutral-500 hover:text-white transition-all disabled:opacity-30"
         >
            PREV_PAGE
         </button>
         <div className="flex items-center px-4 bg-neutral-900 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-amber-500">PAGE_{page}</span>
         </div>
         <button 
           onClick={() => setPage(p => p + 1)}
           disabled={filteredTxs.length < 10}
           className="px-6 py-2 rounded-xl bg-neutral-900 border border-white/5 text-[10px] font-black text-neutral-500 hover:text-white transition-all disabled:opacity-30"
         >
            NEXT_PAGE
         </button>
      </div>

      {/* IMAGE EXPAND MODAL */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl animate-in fade-in zoom-in duration-300"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2 font-black text-xs tracking-widest uppercase transition-colors"
              onClick={() => setExpandedImage(null)}
            >
              Close <XCircle size={24} />
            </button>
            <img 
              src={expandedImage} 
              alt="Receipt" 
              className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
