export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login/',
    PROFILE: '/users/profile/',
  },
  BANKER: {
    DASHBOARD_STATS: '/payments/admin/stats/',
    TRANSACTIONS: '/payments/admin/transactions/',
    TRANSACTION_ACTION: (id: number, action: string) => `/payments/admin/transactions/${id}/action/${action}/`,
    PLAYERS: '/users/admin/players/',
    PLAYER_BAN: (id: number) => `/users/admin/players/${id}/toggle-ban/`,
    PLAYER_ROLE: (id: number) => `/users/admin/players/${id}/update-role/`,
    PLAYER_ADD_COINS: (id: number) => `/users/admin/players/${id}/add-coins/`,
    AGENTS: '/users/admin/agents/',
    AGENT_LINKS: (id: number) => `/users/admin/agents/${id}/links/`,
    PAYMENT_METHODS: '/payments/admin/payment-methods/',
    PAYMENT_METHOD_DETAIL: (id: number) => `/payments/admin/payment-methods/${id}/`,
  }
};
