import { CONFIG } from './config';

export const API = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('banker_token') : null;
    const method = (options.method || 'GET').toUpperCase();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Suro-App-Sign': 'Suropara_Stealth_V2_2026!',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        ...options,
        cache: options.cache ?? (method === 'GET' ? 'no-store' : options.cache),
        headers,
      });

      if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('banker_token');
          window.location.href = '/login';
        }
        throw new Error("Session Expired or Unauthorized");
      }

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "API Request Failed");
      }

      return data as T;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        console.error(`[NETWORK ERROR] Could not connect to ${CONFIG.API_BASE}${endpoint}. Check CORS settings or server status.`);
      } else {
        console.error(`[API ERROR] ${endpoint}:`, err.message || 'Unknown error');
      }
      throw error;
    }
  },

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    });
  },

  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    });
  }
};

export const apiClient = API;
