import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Loader';

import Home from '../pages/Home/index';
import Login from '../pages/Login/index';
import Register from '../pages/Register/index';
import Dashboard from '../pages/Dashboard/index';
import HealthProfile from '../pages/HealthProfile/index';
import Symptoms from '../pages/Symptoms/index';
import BloodReport from '../pages/BloodReport/index';
import Prediction from '../pages/Prediction/index';
import MealPlanner from '../pages/MealPlanner/index';
import FoodDiary from '../pages/FoodDiary/index';
import Reports from '../pages/Reports/index';
import Profile from '../pages/Profile/index';
import FoodScanner from '../pages/FoodScanner/index';
import AICoach from '../pages/AICoach/index';

import AdminDashboard from '../pages/Admin/Dashboard/index';
import AdminUsers from '../pages/Admin/Users/index';
import AdminFoodDatabase from '../pages/Admin/FoodDatabase/index';
import AdminAnalytics from '../pages/Admin/Analytics/index';
import AdminPredictionReports from '../pages/Admin/PredictionReports/index';
import AdminSettings from '../pages/Admin/Settings/index';
import AdminLayout from '../components/layout/AdminLayout';
import AdminLogin from '../pages/Admin/Login/index';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
        <Route path="/health-profile" element={<ProtectedRoute><HealthProfile /></ProtectedRoute>} />
        <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
        <Route path="/blood-report" element={<ProtectedRoute><BloodReport /></ProtectedRoute>} />
        <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
        <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
        <Route path="/food-diary" element={<ProtectedRoute><FoodDiary /></ProtectedRoute>} />
        <Route path="/food-scanner" element={<ProtectedRoute><FoodScanner /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/foods" element={<AdminFoodDatabase />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/prediction-reports" element={<AdminPredictionReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
