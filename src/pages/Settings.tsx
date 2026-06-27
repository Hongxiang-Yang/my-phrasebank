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
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>
      
      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      <div className="space-y-8 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 transition-all">
        
        {/* API Key */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Gemini API Key</h2>
          <p className="text-sm text-gray-500 mb-4">Required to use the AI generation features. The key is stored locally in your browser.</p>
          <input 
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none"
            placeholder="AIzaSy..."
          />
        </div>

        {/* Theme */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Theme</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
            >
              🌞 Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white ring-2 ring-gray-800/50' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setTheme('eyecare')}
              className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${theme === 'eyecare' ? 'border-green-600 bg-[#f4f1ea] text-green-900 ring-2 ring-green-600/20' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
            >
              🌿 Eye-care
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
