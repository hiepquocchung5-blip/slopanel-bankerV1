"use client";

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock() {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="nav-pill flex items-center gap-2 px-4 py-3">
      <Clock size={14} className="text-primary" />
      <span className="text-[10px] md:text-[11px] font-black tracking-[0.24em] uppercase tabular-nums">
        {time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })}
      </span>
    </div>
  );
}
