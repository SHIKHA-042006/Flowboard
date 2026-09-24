import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'flowboard.theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function resolve(preference) {
  if (preference === 'system') return media().matches ? 'dark' : 'light';
  return preference;
}

/**
 * Three-way preference (light / dark / system), persisted locally and
 * synced to the user's profile once signed in. The resolved value (never
 * "system") is what actually toggles the `dark` class on <html>.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [resolved, setResolved] = useState(() => resolve(preference));

  useEffect(() => {
    setResolved(resolve(preference));
    localStorage.setItem(STORAGE_KEY, preference);

    if (preference !== 'system') return;
    const mq = media();
    const onChange = () => setResolved(resolve('system'));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);

  const setTheme = useCallback((next) => setPreference(next), []);

  const value = useMemo(() => ({ preference, resolved, setTheme }), [preference, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
