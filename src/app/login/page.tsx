"use client";

import React, { useState } from 'react';
import { ShieldAlert, Phone, Lock, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
      <div className="w-full max-w-[440px]">
        <div className="bg-white p-12 rounded-[32px] border border-slate-200 shadow-2xl text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-teal-100">
            <KeyRound size={40} className="text-teal-600" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Banker Access</h2>
          <p className="text-[11px] text-slate-400 font-black tracking-[0.4em] mb-12 uppercase">Secure Node Authentication</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-10 text-center">
            <div className="relative">
              <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-modern pl-16 w-full"
                required
              />
            </div>
            
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern pl-16 w-full"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-black tracking-widest uppercase mt-4 bg-red-50 py-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary mt-6 py-4 h-auto rounded-2xl"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin mx-auto" />
              ) : (
                <span className="font-black text-base">AUTHENTICATE SYSTEM</span>
              )}
            </button>
          </form>
          
          <div className="h-[1px] bg-slate-100 mb-8 w-full" />
          
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase leading-loose">
            Authorized Personnel Only <br/>
            <span className="text-teal-600 font-black">E2E Encryption Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
