import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import type { Settings, Theme } from '../types';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check, Sun, Moon, Leaf } from 'lucide-react';

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
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Settings</h1>
      
      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      <Card className="p-6 md:p-8 space-y-8">
        
        {/* API Key */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Gemini API Key</h2>
          <p className="text-sm text-muted-foreground mb-4">Required to use the AI generation features. The key is stored locally in your browser.</p>
          <Input 
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
          />
        </div>

        {/* Theme */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Theme</h2>
          <div className="flex gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className={`flex-1 h-12 ${theme === 'light' ? 'ring-2 ring-primary/20 ring-offset-1 ring-offset-background' : ''}`}
            >
              <Sun className="mr-2 h-4 w-4" /> Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className={`flex-1 h-12 ${theme === 'dark' ? 'ring-2 ring-primary/20 ring-offset-1 ring-offset-background' : ''}`}
            >
              <Moon className="mr-2 h-4 w-4" /> Dark
            </Button>
            <Button
              variant={theme === 'eyecare' ? 'default' : 'outline'}
              onClick={() => setTheme('eyecare')}
              className={`flex-1 h-12 ${theme === 'eyecare' ? 'ring-2 ring-primary/20 ring-offset-1 ring-offset-background' : ''}`}
            >
              <Leaf className="mr-2 h-4 w-4" /> Eye-care
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          size="lg"
          className="w-full font-semibold"
        >
          Save Settings
        </Button>
      </Card>
    </div>
  );
}
