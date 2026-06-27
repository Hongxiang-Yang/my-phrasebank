import type { Phrase, Category, Settings } from '../types';

const STORAGE_KEYS = {
  PHRASES: 'my_phrasebank_phrases',
  SETTINGS: 'my_phrasebank_settings',
};

const DEFAULT_CATEGORIES: Category[] = [];

const DEFAULT_SETTINGS: Settings = {
  categories: DEFAULT_CATEGORIES,
  usageTypes: ['discussion', 'introduction', 'methodology', 'results', 'email'],
  tones: ['cautious academic', 'confident claim', 'polite request', 'informal'],
  theme: 'light',
};

export const Storage = {
  getPhrases(): Phrase[] {
    const data = localStorage.getItem(STORAGE_KEYS.PHRASES);
    return data ? JSON.parse(data) : [];
  },
  
  savePhrases(phrases: Phrase[]) {
    localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(phrases));
  },

  getSettings(): Settings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings(settings: Settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
