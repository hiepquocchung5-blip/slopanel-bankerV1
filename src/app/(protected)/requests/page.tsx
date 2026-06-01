'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle2, XCircle, Search, Filter, 
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
  created_at: string;
}

export default function AuditQueuePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchTxs = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.BANKER.TRANSACTIONS);
      setTxs(res.data?.results || res.data || []);
    } catch (e) {
      toast.error('Failed to sync transaction queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
    const interval = setInterval(fetchTxs, 15000); 
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setProcessingId(id);
    try {
      await apiClient.post(API_ENDPOINTS.BANKER.TRANSACTION_ACTION(id, action));
      toast.success(`Transaction #${id} ${action}ed successfully`);
      setTxs(prev => prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : t));
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTxs = txs.filter(t => 
    t.tx_type === activeTab && 
    (statusFilter === 'ALL' || t.status === statusFilter) &&
    (t.user_phone.includes(search) || t.id.toString() === search || (t.txd_id && t.txd_id.includes(search)))
  );

  const pendingCount = txs.filter(t => t.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            AUDIT QUEUE
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse border border-red-400">
                {pendingCount} PENDING
              </span>
            )}
          </h1>
          <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest mt-1">Real-time Financial Ledger</p>
        </div>

        <div className="flex bg-neutral-900/50 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('DEPOSIT')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'DEPOSIT' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
          >
            DEPOSITS
          </button>
          <button 
            onClick={() => setActiveTab('WITHDRAW')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'WITHDRAW' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
          >
            WITHDRAWALS
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH BY PHONE, ID, OR TXD_ID..."
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
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/40 border-bottom border-white/5">
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">User Identity</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Tx Type</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">Amount</th>
              <th className="p-4 text-[10px] font-black tracking-widest text-neutral-500 uppercase">TXD ID</th>
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
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-black ${tx.user_type === 'VIP' ? 'bg-amber-500/10 text-amber-500' : 'bg-neutral-700 text-neutral-400'}`}>
                        [{tx.user_type}]
                      </span>
                      <span className="font-bold tracking-tighter">{tx.user_phone}</span>
                    </div>
                  </td>
                  <td className="p-4 font-black">{tx.tx_type}</td>
                  <td className="p-4 font-black text-amber-500">{Number(tx.amount).toLocaleString()}</td>
                  <td className="p-4 font-bold text-neutral-400">{tx.txd_id || '-'}</td>
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
                    {new Date(tx.created_at).toLocaleString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {tx.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleAction(tx.id, 'approve')}
                            disabled={processingId === tx.id}
                            className="p-2 bg-green-600 hover:bg-green-500 text-black rounded-lg transition-all"
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction(tx.id, 'reject')}
                            disabled={processingId === tx.id}
                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {tx.status !== 'PENDING' && (
                        <div className="w-8 h-8 flex items-center justify-center opacity-20">
                          {tx.status === 'APPROVED' ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
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
    </div>
  );
}
