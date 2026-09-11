import api from './api';

export const profileService = {
  // ── Basic user profile ──────────────────────────────────────────────────
  async getProfile() {
    const { data } = await api.get('/profile');
    return data;
  },

  async updateProfile(profileData) {
    const { data } = await api.put('/profile', profileData);
    return data;
  },

  // ── Health profile ──────────────────────────────────────────────────────
  async getHealthProfile() {
    const { data } = await api.get('/profile/health');
    return data;
  },

  async createHealthProfile(profileData) {
    const { data } = await api.post('/profile/health', profileData);
    return data;
  },

  async updateHealthProfile(profileData) {
    // Backend uses POST /profile/health for both create & update (upsert)
    const { data } = await api.post('/profile/health', profileData);
    return data;
  },
};

export default profileService;
