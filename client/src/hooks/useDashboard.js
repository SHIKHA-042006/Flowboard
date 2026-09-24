import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../lib/api.js';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await api.get('/dashboard');
      setData(data);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, status, error, reload: load };
}
