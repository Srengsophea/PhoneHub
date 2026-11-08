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

/** Extracts a human readable message from an error response or Error object. */
export function getErrorMessage(err: unknown, fallback = 'Incorrect email or password. Please try again.'): string {
  if (!err) return fallback;

  // Handle standard JavaScript Error objects that don't have an Axios HTTP response
  if (err instanceof Error) {
    const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    if (!axiosErr.response && err.message) {
      return err.message;
    }
  }

  const e = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const data = e?.response?.data;

  // Check validation errors dictionary
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) {
      const msg = first[0];
      if (msg.toLowerCase().includes('credentials do not match') || msg.toLowerCase().includes('password')) {
        return 'Incorrect email or password. Please try again.';
      }
      return msg;
    }
  }

  // Check response message
  if (data?.message) {
    const msg = data.message;
    if (msg.toLowerCase().includes('credentials do not match')) {
      return 'Incorrect email or password. Please try again.';
    }
    return msg;
  }

  // Check 401 or 422 authentication error
  if (e?.response?.status === 401 || e?.response?.status === 422) {
    return 'Incorrect email or password. Please try again.';
  }

  return fallback;
}

/** Returns Laravel validation errors keyed by field (first message only). */
export function getFieldErrors(err: unknown): Record<string, string> {
  const e = err as AxiosError<{ errors?: Record<string, string[]> }>;
  const errors = e?.response?.data?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
}

export default api;
