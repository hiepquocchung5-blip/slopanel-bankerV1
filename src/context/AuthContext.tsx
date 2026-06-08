"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API } from '@/lib/api';

export interface User {
  id: number;
  phone_number: string;
  username: string | null;
  user_type: 'NORMAL' | 'AGENT' | 'VIP';
  is_staff: boolean;
  is_cashier: boolean;
  is_agent: boolean;
  slopara_coins: number;
  referral_code: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem('banker_token');
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await API.request<User>('users/profile/');
      
      if (profile.user_type === 'NORMAL' && !profile.is_staff && !profile.is_cashier) {
        throw new Error("Clearance Level Too Low.");
      }
      
      setUser(profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Profile check failed.';
      console.error('[AUTH] Profile Check Failed:', message);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('banker_token');
      if (token) {
        if (pathname === '/login') {
          router.push('/');
        } else {
          await refreshProfile();
        }
      } else if (pathname !== '/login') {
        router.push('/login');
      }
      setIsLoading(false);
    };
    initAuth();
  }, [pathname, refreshProfile, router]);

  const login = async (phone: string, pass: string) => {
    const data = await API.request<{ access: string }>('users/login/', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phone, password: pass })
    });
    localStorage.setItem('banker_token', data.access);
    await refreshProfile();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
