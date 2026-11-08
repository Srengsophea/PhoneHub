import { create } from 'zustand';
import api, { ADMIN_TOKEN_KEY } from '@/lib/api';
import type { User } from '@/types';
import { isStaff } from '@/lib/format';

export const ADMIN_USER_KEY = 'phonehub_admin_user';

interface AdminAuthState {
  user: User | null;
  token: string | null;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

function getStoredAdminUser(): User | null {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAdminAuth = create<AdminAuthState>((set, get) => ({
  user: getStoredAdminUser(),
  token: localStorage.getItem(ADMIN_TOKEN_KEY),
  initialized: false,

  init: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null, initialized: true });
      return;
    }
    try {
      const { data } = await api.get('/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user: User = data.data;
      if (isStaff(user.role)) {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        set({ user, initialized: true });
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        set({ user: null, token: null, initialized: true });
      }
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const user: User = data.data.user;
    const token: string = data.data.token;

    if (!isStaff(user.role)) {
      throw new Error('Access Denied: This console is strictly restricted to authorized administrators.');
    }

    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    set({ user, token, initialized: true });
    return user;
  },

  logout: async () => {
    const token = get().token;
    if (token) {
      try {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    set({ user: null, token: null });
  },
}));

window.addEventListener('phonehub:admin_unauthorized', () => {
  useAdminAuth.setState({ user: null, token: null });
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
});
