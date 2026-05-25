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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050508] p-6">
      <div className="w-full max-w-[420px] glass-panel p-10 rounded-[32px] text-center shadow-2xl border-white/5 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-[-100px] left-[-100px] w-[200px] h-[200px] bg-gold/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
            <ShieldAlert size={40} className="text-gold" />
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-widest mb-2 uppercase">Secure Access</h2>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] mb-10 uppercase">Authorized Personnel Only</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="relative group">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-gold/30 focus:bg-black/80 transition-all placeholder:text-gray-700"
                required
              />
            </div>
            
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-gold/30 focus:bg-black/80 transition-all placeholder:text-gray-700"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-black tracking-widest uppercase mt-4 bg-red-500/5 py-3 rounded-xl border border-red-500/10">
                {error}
              </p>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold/90 text-black font-black py-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="tracking-widest uppercase">Verifying...</span>
                </>
              ) : (
                <span className="tracking-widest uppercase">Authenticate</span>
              )}
            </button>
          </form>
          
          <p className="text-gray-600 text-[9px] font-bold tracking-widest uppercase leading-loose">
            By authenticating, you agree to our <br/>
            <span className="text-gray-500">Service Terms & Security Protocols</span>
          </p>
        </div>
      </div>
    </div>
  );
}
