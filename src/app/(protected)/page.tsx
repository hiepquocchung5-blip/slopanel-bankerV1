"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, BarChart3, Fingerprint, Loader2, QrCode, ShieldCheck, TrendingUp, User, Users, Wallet, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HouseStats {
  global: {
    house_profit: string;
    rtp_percentage: number;
    total_spins: number;
    total_wagered: string;
  };
}

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  commission_balance: string;
  total_commission_earned: string;
}

interface Transaction {
  id: number;
  user: number;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING';
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [houseStats, setHouseStats] = useState<HouseStats | null>(null);
  const [refStats, setRefStats] = useState<ReferralStats | null>(null);
  const [recentQueue, setRecentQueue] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  const isManagement = user?.is_staff || user?.is_cashier;
  const isCashier = user?.is_cashier;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isManagement) {
          const [house, queue] = await Promise.all([
            API.request<HouseStats>('game/admin/analytics/'),
            API.request<Transaction[]>('payments/admin/transactions/'),
          ]);
          setHouseStats(house);
          setRecentQueue(queue.filter((t) => t.status === 'PENDING').slice(0, 3));
        } else {
          const [referrals, queue] = await Promise.all([
            API.request<ReferralStats>('users/referrals/'),
            API.request<Transaction[]>('payments/admin/transactions/'),
          ]);
          setRefStats(referrals);
          setRecentQueue(queue.filter((t) => t.status === 'PENDING').slice(0, 3));
        }
      } catch {
        console.error('Dashboard data load failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isManagement]);

  const displayProfit = houseStats
    ? isCashier
      ? parseFloat(houseStats.global.house_profit) * 0.9
      : parseFloat(houseStats.global.house_profit)
    : 0;

  const displayWagered = houseStats
    ? isCashier
      ? parseFloat(houseStats.global.total_wagered) * 0.9
      : parseFloat(houseStats.global.total_wagered)
    : 0;

  const handleCopyCode = async () => {
    if (!refStats?.referral_code) return;

    try {
      await navigator.clipboard.writeText(refStats.referral_code);
      setCopiedKey(true);
      window.setTimeout(() => setCopiedKey(false), 1400);
    } catch {
      console.error('Copy failed');
    }
  };

  const heroStats = useMemo(() => {
    if (isManagement && houseStats) {
      return [
        {
          label: 'House revenue',
          value: displayProfit.toLocaleString(),
          meta: 'MMK',
          icon: TrendingUp,
          tone: 'text-primary',
        },
        {
          label: 'Global RTP',
          value: `${houseStats.global.rtp_percentage}%`,
          meta: 'Performance',
          icon: BarChart3,
          tone: houseStats.global.rtp_percentage > 100 ? 'text-danger' : 'text-primary',
        },
        {
          label: 'Total spins',
          value: houseStats.global.total_spins.toLocaleString(),
          meta: 'Machine cycles',
          icon: Zap,
          tone: 'text-white',
        },
        {
          label: 'Wagered volume',
          value: displayWagered.toLocaleString(),
          meta: 'MMK',
          icon: Wallet,
          tone: 'text-white',
        },
      ];
    }

    if (refStats) {
      return [
        {
          label: 'Network size',
          value: refStats.total_referrals.toString(),
          meta: 'Referrals',
          icon: Users,
          tone: 'text-primary',
        },
        {
          label: 'Commission earned',
          value: parseFloat(refStats.total_commission_earned).toLocaleString(),
          meta: 'MMK',
          icon: Wallet,
          tone: 'text-white',
        },
        {
          label: 'Available code',
          value: refStats.referral_code,
          meta: 'Registry key',
          icon: QrCode,
          tone: 'text-primary',
        },
      ];
    }

    return [];
  }, [displayProfit, displayWagered, houseStats, isManagement, refStats]);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="panel-card p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="page-kicker">Authorized access</p>
            <h2 className="mt-3 page-title uppercase">
              Welcome back, {user.username || 'Staff'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-text-secondary">
              Control the live banker portal from one place. Review payment traffic, check player access, and monitor house performance with a layout tuned for fast operator decisions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:grid-cols-1">
            <div className="nav-pill flex items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Clearance</p>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    {user.is_staff ? 'Admin' : user.is_cashier ? 'Cashier' : 'Agent'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                Online
              </span>
            </div>

            <div className="nav-pill flex items-center gap-3 px-4 py-4">
              <div className="w-11 h-11 rounded-2xl bg-white/6 border border-white/8 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Phone</p>
                <p className="truncate text-sm font-black uppercase tracking-[0.14em] text-white">
                  {user.phone_number}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {heroStats.map((item, index) => (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="stat-tile"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label">{item.label}</p>
                <p className={cn('mt-4 text-3xl md:text-4xl font-black tracking-[-0.06em] tabular-nums', item.tone)}>
                  {item.value}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-text-secondary">
                  {item.meta}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center text-primary">
                <item.icon size={18} />
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      {!isManagement && refStats && (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="premium-card p-6 md:p-8">
            <p className="page-kicker">Agent registry</p>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em]">
              Referral code
            </h3>
            <p className="mt-3 text-sm text-text-secondary max-w-xl">
              Share this key to register new players under your network and track commission activity from one terminal.
            </p>

            <div className="mt-8 rounded-[28px] border border-primary/20 bg-primary/10 p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Registry key</p>
                  <p className="mt-2 font-mono text-4xl md:text-5xl font-black tracking-[0.16em] text-white">
                    {refStats.referral_code}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center text-primary">
                  <QrCode size={24} />
                </div>
              </div>
              <button onClick={handleCopyCode} className="btn-primary mt-6 w-full sm:w-auto px-6">
                {copiedKey ? 'Copied' : 'Copy registry key'}
              </button>
            </div>
          </div>

          <div className="panel-card p-6 md:p-8">
            <p className="page-kicker">Network status</p>
            <div className="mt-4 space-y-4">
              <div className="nav-pill flex items-center justify-between px-4 py-4">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-text-secondary">Total referrals</span>
                <span className="text-xl font-black tabular-nums">{refStats.total_referrals}</span>
              </div>
              <div className="nav-pill flex items-center justify-between px-4 py-4">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-text-secondary">Commission balance</span>
                <span className="text-xl font-black tabular-nums">
                  {parseFloat(refStats.commission_balance).toLocaleString()}
                </span>
              </div>
              <div className="nav-pill flex items-center justify-between px-4 py-4">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-text-secondary">System mode</span>
                <span className="text-sm font-black uppercase tracking-[0.22em] text-primary">Live</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="page-kicker">Live traffic</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">
                Active queue feed
              </h3>
            </div>
            <Link href="/queue" className="btn-secondary h-11 px-4">
              Open queue
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 size={28} className="text-primary animate-spin" />
              </div>
            ) : recentQueue.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                  No pending requests
                </p>
              </div>
            ) : (
              recentQueue.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl border flex items-center justify-center',
                        tx.tx_type === 'DEPOSIT'
                          ? 'border-success/20 bg-success/10 text-success'
                          : 'border-danger/20 bg-danger/10 text-danger'
                      )}
                    >
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">
                        {tx.tx_type}
                      </p>
                      <p className="mt-1 text-base font-black uppercase tracking-[0.14em]">
                        Request #{tx.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tabular-nums tracking-[-0.05em]">
                      {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="page-kicker">Registry integrity</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em]">
                System snapshot
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
              <Fingerprint size={20} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="nav-pill px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Operator state</p>
              <p className="mt-2 text-lg font-black uppercase tracking-[-0.04em] text-white">
                {isManagement ? 'Management terminal' : 'Agent terminal'}
              </p>
            </div>
            <div className="nav-pill px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">Live mode</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-primary">
                Encrypted, realtime, role-aware
              </p>
            </div>
            {isManagement && houseStats && (
              <div className="nav-pill px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-text-secondary">House integrity</p>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.22em] text-success">
                  Verified and monitored
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
