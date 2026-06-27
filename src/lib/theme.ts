import { Storage } from './storage';
import type { Theme } from '../types';

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'eyecare');
  root.classList.add(theme);

  // Apply specific styles using native style properties or let Tailwind handle the `.dark` etc.
  if (theme === 'eyecare') {
    root.style.setProperty('--bg-base', '#f4f1ea');
    root.style.setProperty('--text-base', '#2c2c2c');
  } else if (theme === 'dark') {
    root.style.setProperty('--bg-base', '#111827');
    root.style.setProperty('--text-base', '#f9fafb');
  } else {
    // Light
    root.style.setProperty('--bg-base', '#f9fafb');
    root.style.setProperty('--text-base', '#111827');
  }
}

export function initTheme() {
  const settings = Storage.getSettings();
  applyTheme(settings.theme || 'light');
}
