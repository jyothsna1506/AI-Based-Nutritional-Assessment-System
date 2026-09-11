import api from './api';

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get('/dashboard');
    return data;
  },

  async logWaterIntake(amountMl = 250) {
    const { data } = await api.post('/dashboard/water', { amount_ml: amountMl });
    return data;
  },

  async resetWaterIntake() {
    const { data } = await api.post('/dashboard/water/reset');
    return data;
  },
};

export default dashboardService;
