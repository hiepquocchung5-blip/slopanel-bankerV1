export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login/',
    PROFILE: '/users/profile/',
  },
  BANKER: {
    DASHBOARD_STATS: '/payments/admin/stats/',
    TRANSACTIONS: '/payments/admin/transactions/',
    // Backend path is: admin/transactions/<int:tx_id>/<action>/
    TRANSACTION_ACTION: (id: number, action: string) => `/payments/admin/transactions/${id}/${action}/`,
    PLAYERS: '/users/admin/players/',
    PLAYER_BAN: (id: number) => `/users/admin/players/${id}/toggle-ban/`,
    PLAYER_ROLE: (id: number) => `/users/admin/players/${id}/update-role/`,
    PLAYER_ADD_COINS: (id: number) => `/users/admin/players/${id}/add-coins/`,
    AGENTS: '/users/admin/agents/',
    AGENT_LINKS: (id: number) => `/users/admin/agents/${id}/links/`,
    PAYMENT_METHODS: '/payments/admin/methods/',
    PAYMENT_METHOD_DETAIL: (id: number) => `/payments/admin/methods/${id}/`,
  }
};
