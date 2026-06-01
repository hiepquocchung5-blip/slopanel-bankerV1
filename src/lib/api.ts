import { CONFIG } from './config';

export const API = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('banker_token') : null;
    const method = (options.method || 'GET').toUpperCase();
    
    // Normalize URL to prevent double slashes
    const baseUrl = CONFIG.API_BASE.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Suro-App-Sign': 'Suropara_Stealth_V2_2026!',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        cache: options.cache ?? (method === 'GET' ? 'no-store' : options.cache),
        headers,
      });

      if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('banker_token');
          window.location.href = '/login';
        }
        throw { message: "Session Expired or Unauthorized", status: res.status };
      }

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        console.error(`[API ERROR] ${res.status} ${cleanEndpoint}:`, data);
        throw { message: data?.error || data?.detail || "API Request Failed", status: res.status, data };
      }

      return data as T;
    } catch (error: any) {
      if (error.status) throw error;

      const errMessage = error.message || 'Unknown network error';
      console.error(`[NETWORK ERROR] ${cleanEndpoint}:`, errMessage);
      throw { message: errMessage };
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
