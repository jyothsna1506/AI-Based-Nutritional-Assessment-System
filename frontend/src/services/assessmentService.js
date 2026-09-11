import api from './api';

export const assessmentService = {
  // ── Symptoms ──────────────────────────────────────────────────────────
  async submitSymptoms(symptoms) {
    const { data } = await api.post('/assessment/symptoms', symptoms);
    return data;
  },

  async getSymptomHistory() {
    const { data } = await api.get('/assessment/symptoms');
    return data;
  },

  // ── Blood Report ──────────────────────────────────────────────────────
  async submitBloodReport(report) {
    const { data } = await api.post('/assessment/blood-report', report);
    return data;
  },

  async parseBloodReport(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/assessment/blood-report/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getBloodReports() {
    const { data } = await api.get('/assessment/blood-report');
    return data;
  },

  // ── Predictions ───────────────────────────────────────────────────────
  async predict() {
    const { data } = await api.post('/assessment/predict', {});
    return data;
  },

  async getPredictions() {
    const { data } = await api.get('/assessment/predictions');
    return data;
  },

  async clearPredictions() {
    const { data } = await api.delete('/assessment/predictions');
    return data;
  },
};

export default assessmentService;
