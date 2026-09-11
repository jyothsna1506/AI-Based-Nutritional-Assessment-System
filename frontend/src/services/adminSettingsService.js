import api from './api';

export const adminSettingsService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  
  updateSettings: async (settingsData) => {
    const response = await api.post('/admin/settings', settingsData);
    return response.data;
  }
};
