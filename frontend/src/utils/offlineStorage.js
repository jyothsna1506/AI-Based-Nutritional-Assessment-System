/**
 * Offline Data Persistence Layer for NutriAI PWA
 * Caches critical health metrics, meal plans, and report history locally
 * so users can access their health data even without an active internet connection.
 */
import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  MEAL_PLAN: 'nutriai_offline_meal_plan',
  DASHBOARD: 'nutriai_offline_dashboard',
  PREDICTIONS: 'nutriai_offline_predictions',
  HEALTH_PROFILE: 'nutriai_offline_health_profile',
};

// ── Cache Setters ─────────────────────────────────────────────────────────────

export function saveOfflineMealPlan(planData) {
  try {
    if (planData) {
      localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify({
        data: planData,
        timestamp: Date.now(),
      }));
    }
  } catch (err) {
    console.warn('Failed to persist meal plan offline:', err);
  }
}

export function saveOfflineDashboard(dashData) {
  try {
    if (dashData) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD, JSON.stringify({
        data: dashData,
        timestamp: Date.now(),
      }));
    }
  } catch (err) {
    console.warn('Failed to persist dashboard offline:', err);
  }
}

export function saveOfflinePredictions(predictionsData) {
  try {
    if (predictionsData) {
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify({
        data: predictionsData,
        timestamp: Date.now(),
      }));
    }
  } catch (err) {
    console.warn('Failed to persist predictions offline:', err);
  }
}

// ── Cache Getters ─────────────────────────────────────────────────────────────

export function getOfflineMealPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN);
    return raw ? JSON.parse(raw).data : null;
  } catch (err) {
    return null;
  }
}

export function getOfflineDashboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DASHBOARD);
    return raw ? JSON.parse(raw).data : null;
  } catch (err) {
    return null;
  }
}

export function getOfflinePredictions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    return raw ? JSON.parse(raw).data : null;
  } catch (err) {
    return null;
  }
}

// ── Custom React Hook for Online / Offline Network Status ────────────────────

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
