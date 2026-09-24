import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY, errorMessage } from '../lib/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  // `booting` covers the first /me round trip so routes do not flash to /login.
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!token) return setBooting(false);
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) setToken(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, [token]);

  const authenticate = useCallback(async (path, payload) => {
    try {
      const { data } = await api.post(path, payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: errorMessage(error) };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* token is discarded either way */ }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      login: (payload) => authenticate('/auth/login', payload),
      register: (payload) => authenticate('/auth/register', payload),
      logout,
    }),
    [user, token, booting, authenticate, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
