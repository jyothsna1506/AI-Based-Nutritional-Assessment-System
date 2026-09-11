import { useState, useEffect } from 'react';
import { adminSettingsService } from '../../../services/adminSettingsService';
import { Settings, Key, CheckCircle, AlertCircle, Bot, Utensils } from 'lucide-react';
import { PageLoader } from '../../../components/common/Loader';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSpoon, setSavingSpoon] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [spoonacularKey, setSpoonacularKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpoonacularKey = async (e) => {
    e.preventDefault();
    if (!spoonacularKey.trim()) return;

    try {
      setSavingSpoon(true);
      setError(null);
      setSuccess(false);

      const data = await adminSettingsService.updateSettings({
        spoonacular_api_key: spoonacularKey
      });

      setSettings(data);
      setSpoonacularKey('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update Spoonacular API key.');
    } finally {
      setSavingSpoon(false);
    }
  };

  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;

    try {
      setSavingGemini(true);
      setError(null);
      setSuccess(false);

      const data = await adminSettingsService.updateSettings({
        gemini_api_key: geminiKey
      });

      setSettings(data);
      setGeminiKey('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update Gemini API key.');
    } finally {
      setSavingGemini(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#0a192f]">
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200/90 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0a192f] tracking-tight">System Settings</h1>
            <p className="text-slate-600 text-sm font-semibold mt-0.5">Manage external AI & dataset API keys and system integrations.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-rose-700 font-bold">Error</h3>
            <p className="text-rose-600 text-sm mt-0.5 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-emerald-700 font-bold">Success</h3>
            <p className="text-emerald-600 text-sm mt-0.5 font-medium">API Key has been updated and applied to the server immediately.</p>
          </div>
        </div>
      )}

      <div className="glass-card rounded-3xl border border-slate-200 bg-white/95 shadow-md overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-[#0a192f] flex items-center gap-2">
            <Key className="text-purple-600" size={24} />
            Third-Party API Keys
          </h2>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Manage your external service integrations. Changes to API keys take effect immediately without requiring a server restart.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Gemini AI Setting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-black text-[#0a192f] mb-1 flex items-center gap-2">
                <Bot className="text-[#0284c7]" size={20} />
                Google Gemini API
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Powers the AI Nutritionist Chatbot, Visual Meal Photo Scanner, and Medical Report Summarizer.
              </p>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleSaveGeminiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Current Gemini Key
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-sm font-bold">
                    {settings?.gemini_api_key_masked || 'Not configured'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Set New Gemini Key
                  </label>
                  <input
                    type="text"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter new Google Gemini API Key"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0a192f] font-bold placeholder-slate-400 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 font-semibold mt-2">
                    Get an API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#0284c7] hover:underline font-bold">Google AI Studio</a>.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingGemini || !geminiKey.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer text-sm border-0"
                  >
                    {savingGemini ? 'Saving...' : 'Update Gemini Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Spoonacular Setting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-black text-[#0a192f] mb-1 flex items-center gap-2">
                <Utensils className="text-amber-600" size={20} />
                Spoonacular API
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Used for fetching recipe suggestions and ingredient search for the Meal Planner.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <form onSubmit={handleSaveSpoonacularKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Current Spoonacular Key
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-sm font-bold">
                    {settings?.spoonacular_api_key_masked || 'Not configured'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Set New Spoonacular Key
                  </label>
                  <input
                    type="text"
                    value={spoonacularKey}
                    onChange={(e) => setSpoonacularKey(e.target.value)}
                    placeholder="Enter new Spoonacular API Key"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0a192f] font-bold placeholder-slate-400 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 font-semibold mt-2">
                    Get an API key from <a href="https://spoonacular.com/food-api" target="_blank" rel="noreferrer" className="text-[#0284c7] hover:underline font-bold">spoonacular.com</a>.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSpoon || !spoonacularKey.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer text-sm border-0"
                  >
                    {savingSpoon ? 'Saving...' : 'Update Spoonacular Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
