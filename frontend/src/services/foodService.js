import api from './api';

export const foodService = {
  async searchFoods(query) {
    const { data } = await api.get(`/foods/search?q=${encodeURIComponent(query)}`);
    return data;
  },

  async getCategories() {
    const { data } = await api.get('/foods/categories');
    return data;
  },

  async getFoodDetails(foodId) {
    const { data } = await api.get(`/foods/${foodId}`);
    return data;
  },

  async logFood(entry) {
    const { data } = await api.post('/food-diary', entry);
    return data;
  },

  async getFoodDiary(date) {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get(`/food-diary${params}`);
    return data;
  },

  async deleteFoodEntry(entryId) {
    await api.delete(`/food-diary/${entryId}`);
  },

  async estimateNutrition(payload) {
    const { data } = await api.post('/ai/estimate-nutrition', payload);
    return data;
  },
};

export default foodService;
