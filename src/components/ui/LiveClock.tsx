"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
      <Clock size={12} className="text-gold animate-pulse" />
      <span className="text-[10px] font-black text-white tracking-[0.2em] tabular-nums uppercase">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </span>
    </div>
  );
}
