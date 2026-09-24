import axios from 'axios';

export const TOKEN_KEY = 'flowboard.token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// The current socket id travels with every write so the server can skip
// echoing the change back to the tab that made it.
let socketId = null;
export const setSocketId = (id) => { socketId = id; };
export const getSocketId = () => socketId;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (socketId) config.headers['x-socket-id'] = socketId;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthCall = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

/** Turns any axios/network failure into a sentence worth showing a person. */
export function errorMessage(error, fallback = 'Something went wrong. Try again.') {
  const apiError = error?.response?.data?.error;
  if (apiError?.details?.length) return apiError.details[0].message || apiError.message;
  return apiError?.message || (error?.message === 'Network Error' ? 'Cannot reach the server.' : fallback);
}

export default api;
