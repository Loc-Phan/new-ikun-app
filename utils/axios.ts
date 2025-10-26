import { API_KEY, API_URL } from '@/constants';
import axios from 'axios';
import { RootState, store } from '../store';
import { logout } from '../store/auth/authSlice';

const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': API_KEY,
  },
});

http.interceptors.request.use(
  async function (config) {
    const token = (store.getState() as RootState).auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response: any) => response,
  (error: unknown) => {
    const { response } = error as {
      response?: { status: number; config?: { url?: string } };
    };

    // Handle 401 Unauthorized errors (token expired or invalid)
    // Skip redirect for auth endpoints to prevent login loops
    const isAuthEndpoint =
      response?.config?.url && response.config.url.includes('/auth');

    if (response && response.status === 401 && !isAuthEndpoint) {
      // Dispatch Redux logout action to clear auth state
      store.dispatch(logout());
    }

    return Promise.reject(error);
  },
);

export default http;
