import { useEffect, useLayoutEffect, useState } from 'react';

const prefix = 'pocketfolio.';

export function readPreference(name, allowed, fallback) {
  try {
    const value = window.localStorage.getItem(`${prefix}${name}`);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function savePreference(name, value) {
  try {
    window.localStorage.setItem(`${prefix}${name}`, String(value));
  } catch {
    // Preferences still work for this visit when storage is unavailable.
  }
}

export default function usePreferences() {
  const [sound, setSound] = useState(() => readPreference('sound', ['true', 'false'], 'true') === 'true');
  const [language, setLanguage] = useState(() => readPreference('language', ['en', 'es'], 'en'));
  const [theme, setTheme] = useState(() => readPreference('theme', ['light', 'dark'], 'light'));

  useEffect(() => { savePreference('sound', sound); }, [sound]);
  useEffect(() => { savePreference('language', language); }, [language]);
  useEffect(() => { savePreference('theme', theme); }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === 'dark' ? '#20251f' : '#efefe8';
  }, [language, theme]);

  return { sound, setSound, language, setLanguage, theme, setTheme };
}
