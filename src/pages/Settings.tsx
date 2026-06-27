import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import type { Settings, Theme } from '../types';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = Storage.getSettings();
    setSettings(s);
    setApiKey(s.geminiApiKey || '');
    setTheme(s.theme || 'light');
  }, []);

  const handleSave = () => {
    if (!settings) return;
    const updated: Settings = { ...settings, geminiApiKey: apiKey, theme };
    Storage.saveSettings(updated);
    setSettings(updated);
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return null;

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 eyecare:text-[#433422] transition-colors">Settings</h1>
      
      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 eyecare:bg-[#eaf1e8] text-emerald-700 dark:text-emerald-300 eyecare:text-[#4d7348] rounded-xl border border-emerald-200 dark:border-emerald-800/50 eyecare:border-[#cfdecb] shadow-sm flex items-center gap-3 transition-colors">
          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      <div className="space-y-8 bg-white/80 dark:bg-gray-800/80 eyecare:bg-[#f4ebd8]/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/60 dark:border-gray-700 eyecare:border-[#e6d5b8] shadow-xl shadow-blue-900/5 dark:shadow-none transition-all">
        
        {/* API Key */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 eyecare:text-[#433422] transition-colors">Gemini API Key</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] mb-4 transition-colors">Required to use the AI generation features. The key is stored locally in your browser.</p>
          <input 
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 outline-none transition-colors"
            placeholder="AIzaSy..."
          />
        </div>

        {/* Theme */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 eyecare:text-[#433422] transition-colors">Theme</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-300 eyecare:border-[#8b5a2b] eyecare:bg-[#e8dec7] eyecare:text-[#433422]' : 'border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] hover:bg-gray-50 dark:hover:bg-gray-700 eyecare:hover:bg-[#e8dec7] text-gray-700 dark:text-gray-300 eyecare:text-[#5c4933]'}`}
            >
              🌞 Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${theme === 'dark' ? 'border-gray-500 bg-gray-700 text-white ring-2 ring-gray-500/50 dark:border-gray-400 dark:bg-gray-600 dark:ring-gray-400/50 eyecare:border-gray-500 eyecare:bg-gray-700 eyecare:text-white' : 'border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] hover:bg-gray-50 dark:hover:bg-gray-700 eyecare:hover:bg-[#e8dec7] text-gray-700 dark:text-gray-300 eyecare:text-[#5c4933]'}`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setTheme('eyecare')}
              className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${theme === 'eyecare' ? 'border-[#8b5a2b] bg-[#e8dec7] text-[#433422] ring-2 ring-[#8b5a2b]/20 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300 eyecare:border-[#8b5a2b] eyecare:bg-[#e8dec7] eyecare:text-[#433422]' : 'border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] hover:bg-gray-50 dark:hover:bg-gray-700 eyecare:hover:bg-[#e8dec7] text-gray-700 dark:text-gray-300 eyecare:text-[#5c4933]'}`}
            >
              🌿 Eye-care
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 eyecare:from-[#8b5a2b] eyecare:to-[#6a421a] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 dark:shadow-none hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
