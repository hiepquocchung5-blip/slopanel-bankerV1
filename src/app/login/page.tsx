"use client";

import React, { useState } from 'react';
import { ShieldAlert, Phone, Lock, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await login(phone, password);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px]"
      >
        <div className="bg-white p-10 md:p-14 rounded-[48px] border border-slate-200 shadow-2xl text-center relative overflow-hidden">
          {/* Decorative subtle background icon */}
          <div className="absolute -top-10 -right-10 opacity-[0.03] text-teal-600 rotate-12">
             <KeyRound size={200} />
          </div>

          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-teal-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-teal-100 shadow-sm relative z-10"
          >
            <KeyRound size={48} className="text-teal-600" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase relative z-10">Security Auth</h2>
          <p className="text-[12px] text-slate-400 font-black tracking-[0.4em] mb-14 uppercase relative z-10">Management Terminal v2.2</p>
          
          <form onSubmit={handleSubmit} className="space-y-5 mb-12 relative z-10 text-center">
            <div className="relative group">
              <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-modern pl-16 w-full h-16 rounded-[24px]"
                required
              />
            </div>
            
            <div className="relative group">
              <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
              <input 
                type="password" 
                placeholder="Passphrase" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern pl-16 w-full h-16 rounded-[24px]"
                required
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-[11px] font-black tracking-widest uppercase mt-6 bg-red-50 py-4 rounded-[20px] border border-red-100"
              >
                {error}
              </motion.p>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary h-16 rounded-[24px] mt-8 shadow-lg active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 size={28} className="animate-spin mx-auto text-white" />
              ) : (
                <span className="font-black text-base tracking-[0.1em]">AUTHENTICATE SYSTEM</span>
              )}
            </button>
          </form>
          
          <div className="h-[1px] bg-slate-100 mb-10 w-full" />
          
          <div className="space-y-2 opacity-60">
             <p className="text-slate-500 text-[11px] font-bold tracking-widest uppercase">
               Authorized Personnel Only
             </p>
             <p className="text-teal-600 font-black text-[10px] uppercase tracking-[0.2em]">
               Secure Handshake Protocol Active
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
