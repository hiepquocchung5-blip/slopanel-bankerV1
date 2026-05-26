"use client";

import React, { useState } from 'react';
import { ShieldAlert, Phone, Lock, Loader2 } from 'lucide-react';
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
      setError(err.message || "Authentication failed. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[440px] glass-card p-12 text-center shadow-card relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="blur-circle -top-20 -left-20" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-soft">
            <ShieldAlert size={48} className="text-primary-dark" />
          </div>
          
          <h2 className="text-4xl font-black text-text-primary tracking-tight mb-2 uppercase">Secure Access</h2>
          <p className="text-[11px] text-text-secondary font-black tracking-[0.4em] mb-12 uppercase opacity-60">Authorized Personnel Only</p>
          
          <form onSubmit={handleSubmit} className="space-y-5 mb-10">
            <div className="relative group">
              <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary-dark transition-colors" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-modern pl-14"
                required
              />
            </div>
            
            <div className="relative group">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary-dark transition-colors" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern pl-14"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-black tracking-widest uppercase mt-4 bg-red-500/5 py-4 rounded-2xl border border-red-500/10">
                {error}
              </p>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="tracking-widest uppercase font-black">Verifying...</span>
                </>
              ) : (
                <span className="tracking-widest uppercase font-black">Authenticate System</span>
              )}
            </button>
          </form>
          
          <div className="soft-divider mb-8" />
          
          <p className="text-text-secondary text-[10px] font-bold tracking-widest uppercase leading-loose opacity-60">
            Access to this terminal is logged. <br/>
            <span className="text-primary-dark font-black">End-to-End Encryption Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
