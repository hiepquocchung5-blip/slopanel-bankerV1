"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, CreditCard, Landmark, Loader2, Minus, Plus, ShieldCheck, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
  is_active: boolean;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [newBank, setNewBank] = useState('');
  const [newAcc, setNewAcc] = useState('');
  const [newName, setNewName] = useState('');

  const isManagement = user?.is_staff || user?.is_cashier;

  const fetchMethods = async () => {
    try {
      const data = await API.request<PaymentMethod[]>('payments/agent/methods/');
      setMethods(data);
    } catch {
      console.error('Methods load failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchMethods();
    })();
  }, []);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newBank || !newAcc || !newName) return;

    setProcessingId(-1);
    try {
      await API.request('payments/agent/methods/', {
        method: 'POST',
        body: JSON.stringify({
          bank_name: newBank,
          bank_account: newAcc,
          account_name: newName,
          is_active: true,
        }),
      });
      setNewBank('');
      setNewAcc('');
      setNewName('');
      setIsAdding(false);
      fetchMethods();
    } catch {
      console.error('Add failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    setProcessingId(id);
    try {
      await API.request(`payments/agent/methods/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !current }),
      });
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: !current } : m)));
    } catch {
      console.error('Toggle failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="panel-card p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">Gateway config</p>
            <h2 className="mt-3 page-title uppercase">Payment methods</h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-text-secondary">
              Register, activate, and retire settlement endpoints from a single banker control surface.
            </p>
          </div>
          <div className="nav-pill px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Mode</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-primary">
              {isManagement ? 'Manageable' : 'Read only'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel-card p-6 md:p-8">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary w-full"
          >
            {isAdding ? <Minus size={18} /> : <Plus size={18} />}
            {isAdding ? 'Cancel setup' : 'Register gateway'}
          </button>

          {isAdding && (
            <form onSubmit={handleAdd} className="mt-6 space-y-4">
              <div className="relative">
                <Landmark size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input className="input-modern pl-14" placeholder="Bank / Wallet name" value={newBank} onChange={(e) => setNewBank(e.target.value)} required />
              </div>
              <div className="relative">
                <CreditCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input className="input-modern pl-14" placeholder="Account number" value={newAcc} onChange={(e) => setNewAcc(e.target.value)} required />
              </div>
              <div className="relative">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input className="input-modern pl-14" placeholder="Account holder" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <button disabled={processingId === -1} className="btn-primary w-full">
                {processingId === -1 && <Loader2 size={16} className="animate-spin" />}
                Commit to registry
              </button>
            </form>
          )}
        </section>

        <section className="panel-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="page-kicker">Live registry</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">Bank links</h3>
            </div>
            <ShieldCheck size={20} className="text-primary" />
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : methods.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/3 px-6 py-12 text-center">
                <AlertCircle size={40} className="mx-auto text-text-secondary/50" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                  No active payment methods
                </p>
              </div>
            ) : (
              methods.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'glass-card p-5 md:p-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between',
                    !m.is_active && 'opacity-45 grayscale'
                  )}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                      {m.bank_name}
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black tracking-[-0.05em] tabular-nums">
                      {m.bank_account}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-text-secondary">
                      {m.account_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em]',
                        m.is_active
                          ? 'border-success/20 bg-success/10 text-success'
                          : 'border-danger/20 bg-danger/10 text-danger'
                      )}
                    >
                      {m.is_active ? 'Online' : 'Offline'}
                    </span>
                    {isManagement && (
                      <button
                        disabled={processingId !== null}
                        onClick={() => handleToggle(m.id, m.is_active)}
                        className="text-white/80 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {processingId === m.id ? (
                          <Loader2 size={36} className="animate-spin text-primary" />
                        ) : m.is_active ? (
                          <ToggleRight size={44} className="text-primary" />
                        ) : (
                          <ToggleLeft size={44} className="text-text-secondary/50" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
