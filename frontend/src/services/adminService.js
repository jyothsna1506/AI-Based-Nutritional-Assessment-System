import api from './api';

export const adminService = {
  // ── Analytics & Dashboard ────────────────────────────────────────────────
  async getDashboardStats() {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  async getAnalytics() {
    const { data } = await api.get('/admin/analytics');
    return data;
  },
  async getPredictionReports() {
    const { data } = await api.get('/admin/prediction-reports');
    return data;
  },

  // ── User Management ──────────────────────────────────────────────────────
  async getUsers(skip = 0, limit = 50) {
    const { data } = await api.get('/admin/users', { params: { skip, limit } });
    return data;
  },
  async updateUser(id, payload) {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },
  async deleteUser(id) {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  // ── Food Database Management ─────────────────────────────────────────────
  async getFoods(skip = 0, limit = 100) {
    const { data } = await api.get('/admin/foods', { params: { skip, limit } });
    return data;
  },
  async createFood(payload) {
    const { data } = await api.post('/admin/foods', payload);
    return data;
  },
  async updateFood(id, payload) {
    const { data } = await api.put(`/admin/foods/${id}`, payload);
    return data;
  },
  async deleteFood(id) {
    const { data } = await api.delete(`/admin/foods/${id}`);
    return data;
  },

  // ── Meal Database Management ─────────────────────────────────────────────
  async getMealPlans(skip = 0, limit = 50) {
    const { data } = await api.get('/admin/meal-plans', { params: { skip, limit } });
    return data;
  },
  async deleteMealPlan(id) {
    const { data } = await api.delete(`/admin/meal-plans/${id}`);
    return data;
  },
};

export default adminService;
