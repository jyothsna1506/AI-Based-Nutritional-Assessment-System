import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './routes/AppRouter';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import LanguageModal from './components/common/LanguageModal';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRouter />
        <LanguageModal />
        <PWAInstallPrompt />
      </AuthProvider>
    </LanguageProvider>
  );
}
