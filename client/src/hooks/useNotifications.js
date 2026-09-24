import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../lib/api.js';
import { useSocket } from '../context/SocketContext.jsx';

/** Notification bell state: list + unread count, live-updated over the socket. */
export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      console.error(errorMessage(err));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 30));
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, [socket]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try { await api.patch(`/notifications/${id}/read`); } catch { /* optimistic; ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await api.patch('/notifications/read-all'); } catch { /* optimistic; ignore */ }
  }, []);

  return { notifications, unreadCount, status, reload: load, markRead, markAllRead };
}
