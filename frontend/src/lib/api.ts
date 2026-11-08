import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'phonehub_token';
export const ADMIN_TOKEN_KEY = 'phonehub_admin_token';
export const GUEST_KEY = 'phonehub_guest_session';

export function getGuestSessionId(): string {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use((config) => {
  // If authorization was already explicitly attached by caller, leave it
  if (!config.headers.Authorization) {
    const isAdminRequest =
      config.url?.startsWith('/admin') ||
      window.location.pathname.startsWith('/admin');

    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const customerToken = localStorage.getItem(TOKEN_KEY);

    const token = isAdminRequest ? adminToken : customerToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  config.headers['X-Guest-Session-Id'] = getGuestSessionId();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAdminRequest =
        error.config?.url?.startsWith('/admin') ||
        window.location.pathname.startsWith('/admin');

      if (isAdminRequest) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.dispatchEvent(new Event('phonehub:admin_unauthorized'));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event('phonehub:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

/** Extracts a human readable message from a Laravel error response. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const data = e?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return first[0];
  }
  return data?.message || fallback;
}

/** Returns Laravel validation errors keyed by field (first message only). */
export function getFieldErrors(err: unknown): Record<string, string> {
  const e = err as AxiosError<{ errors?: Record<string, string[]> }>;
  const errors = e?.response?.data?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
}

export default api;
