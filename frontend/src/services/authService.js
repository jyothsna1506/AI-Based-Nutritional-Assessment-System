import api from './api';

export const authService = {
  async register(userData) {
    const payload = {
      full_name: userData.full_name || userData.name || '',
      email: userData.email,
      password: userData.password,
      phone: userData.phone || null,
    };
    const { data } = await api.post('/auth/register', payload);
    // Backend returns LoginResponse: { tokens: { access }, user }
    if (data.tokens?.access) {
      localStorage.setItem('access_token', data.tokens.access);
    }
    return data;
  },

  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    // Backend returns LoginResponse: { tokens: { access }, user }
    if (data.tokens?.access) {
      localStorage.setItem('access_token', data.tokens.access);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('access_token');
  },

  async getCurrentUser() {
    const { data } = await api.get('/auth/user');
    return data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
