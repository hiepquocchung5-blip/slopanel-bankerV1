"use client";

import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show after a delay if not standalone
    if (ios && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-28 left-6 right-6 z-[110] animate-in slide-in-from-bottom-full duration-700 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 p-6 rounded-[35px] shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <button onClick={() => setShowPrompt(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Download className="text-black" size={28} />
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">Install SloBanker</h4>
              <p className="text-[11px] font-bold text-slate-400 leading-tight">
                Add to home screen for faster access & real-time background notifications.
              </p>
           </div>
        </div>

        {isIOS ? (
          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
             <div className="flex items-center gap-3">
                <Share size={16} className="text-blue-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase">1. Tap the Share button</span>
             </div>
             <div className="flex items-center gap-3">
                <PlusSquare size={16} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-300 uppercase">2. Select 'Add to Home Screen'</span>
             </div>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-[12px] tracking-widest uppercase hover:bg-amber-600 transition-all active:scale-95"
          >
            Install Web App
          </button>
        )}
      </div>
    </div>
  );
}
