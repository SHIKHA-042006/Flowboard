import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { setSocketId } from '../lib/api.js';

const SocketContext = createContext({ socket: null, connected: false });
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      setSocketId(null);
      return;
    }

    // One socket for the whole session; board rooms are joined per page.
    const instance = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    instance.on('connect', () => {
      setSocketId(instance.id);
      setConnected(true);
    });
    instance.on('disconnect', () => setConnected(false));

    setSocket(instance);
    return () => {
      instance.close();
      setSocketId(null);
    };
  }, [token]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
