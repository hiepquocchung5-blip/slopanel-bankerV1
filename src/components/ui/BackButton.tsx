"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="absolute top-12 left-6 z-[60] w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl border border-black/5 flex items-center justify-center shadow-soft hover:bg-primary/10 transition-colors group"
    >
      <ChevronLeft size={20} className="text-text-primary group-hover:text-primary-dark transition-colors" />
    </button>
  );
}
