import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../lib/api.js';

/** Sidebar/dashboard data: every workspace the signed-in user belongs to. */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await api.get('/workspaces');
      setWorkspaces(data.workspaces);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { workspaces, status, error, reload: load };
}
