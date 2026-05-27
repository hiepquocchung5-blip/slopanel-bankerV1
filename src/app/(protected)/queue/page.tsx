"use client";

import React, { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Check, Clock, Eye, EyeOff, Loader2, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardBody, Button, User, Image, Badge, Chip, Spinner } from "@heroui/react";

interface Transaction {
  id: number;
  user: number;
  user_phone: string;
  user_name: string;
  amount: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  txd_id: string;
  screenshot: string | null;
  user_bank_name: string | null;
  user_bank_account: string | null;
  created_at: string;
}

export default function QueuePage() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isManagement = user?.is_staff || user?.is_cashier;

  const fetchQueue = async () => {
    try {
      const data = await API.request<Transaction[]>('payments/admin/transactions/');
      const filtered = data.filter(t => {
        const isPending = t.status === 'PENDING';
        if (!isPending) return false;
        if (isManagement) return true;
        return t.user_phone === user?.phone_number;
      });
      setTxs(filtered);
    } catch {
      console.error('Queue load failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!isManagement) return;
    if (!confirm(`Confirm ${action.toUpperCase()} for this transaction?`)) return;

    setProcessingId(id);
    try {
      await API.request(`payments/admin/transactions/${id}/${action}/`, { method: 'POST' });
      setTxs((prev) => prev.filter((t) => t.id !== id));
    } catch {
      console.error('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* PAGE SIGNATURE */}
      <div className="flex flex-col items-center text-center">
         <span className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mb-3">Registry :: Module_02</span>
         <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Live Traffic</h2>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex items-center justify-center bg-slate-900/95 p-6 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
               initial={{ scale: 0.9 }}
               animate={{ scale: 1 }}
               className="relative max-w-4xl"
               onClick={e => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Receipt"
                className="w-full h-auto rounded-[32px] border border-white/10 shadow-2xl"
              />
              <Button 
                isIconOnly
                radius="full"
                className="absolute -top-4 -right-4 bg-white text-slate-900 shadow-xl"
                onPress={() => setSelectedImage(null)}
              >
                <X size={20} strokeWidth={3} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        ) : txs.length === 0 ? (
          <Card className="py-20 border-dashed border-2 border-slate-200 bg-transparent shadow-none items-center">
            <Check size={64} className="text-slate-200 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Queue is clear</p>
          </Card>
        ) : (
          txs.map((tx) => (
            <Card key={tx.id} radius="none" className="border border-slate-200 shadow-none overflow-visible rounded-[32px] p-2">
              <CardBody className="p-8">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    {tx.tx_type === 'DEPOSIT' && tx.screenshot ? (
                      <div className="relative cursor-pointer" onClick={() => setSelectedImage(tx.screenshot)}>
                        <Image
                          src={tx.screenshot}
                          alt="Receipt"
                          width={112}
                          height={112}
                          className="rounded-[28px] object-cover border border-slate-100 shadow-sm transition-transform hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-[28px]">
                           <Eye size={24} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                        <EyeOff size={32} />
                      </div>
                    )}

                    <div className="flex flex-col items-center md:items-start gap-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Chip 
                          variant="flat" 
                          color={tx.tx_type === 'DEPOSIT' ? "success" : "danger"}
                          className="font-black uppercase text-[10px] tracking-widest px-2"
                        >
                          {tx.tx_type}
                        </Chip>
                        <span className="text-[11px] font-black text-slate-300 tracking-widest uppercase">ID: {tx.txd_id || '------'}</span>
                      </div>
                      
                      <User 
                        name={tx.user_name || 'Member'}
                        description={tx.user_phone}
                        avatarProps={{
                          className: "hidden"
                        }}
                        classNames={{
                          name: "text-2xl font-black text-slate-900 uppercase tracking-tight",
                          description: "text-base font-bold text-teal-600 tracking-widest"
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-3">
                    <p className="text-5xl font-black text-slate-900 tabular-nums leading-none tracking-tighter">
                      {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                       <Clock size={12} />
                       {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {tx.tx_type === 'WITHDRAW' && (
                  <div className="mt-10 p-8 bg-slate-50 rounded-[28px] border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Destination Registry</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{tx.user_bank_name}</span>
                      <span className="text-2xl font-black text-teal-600 tabular-nums tracking-widest">{tx.user_bank_account}</span>
                    </div>
                  </div>
                )}

                {isManagement ? (
                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <Button
                      onPress={() => handleAction(tx.id, 'approve')}
                      isLoading={processingId === tx.id}
                      className="h-16 rounded-[24px] bg-teal-600 text-white font-black tracking-widest text-base shadow-lg"
                      startContent={!processingId && <Check size={20} strokeWidth={3} />}
                    >
                      CONFIRM
                    </Button>
                    <Button
                      onPress={() => handleAction(tx.id, 'reject')}
                      isLoading={processingId === tx.id}
                      variant="flat"
                      className="h-16 rounded-[24px] bg-slate-100 text-slate-500 font-black tracking-widest text-base border-transparent hover:text-red-600 transition-colors"
                      startContent={!processingId && <X size={20} strokeWidth={3} />}
                    >
                      REJECT
                    </Button>
                  </div>
                ) : (
                  <div className="mt-10 p-8 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-center text-slate-300">
                    <ShieldAlert size={20} className="mr-3" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Registry Access Restricted</span>
                  </div>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
