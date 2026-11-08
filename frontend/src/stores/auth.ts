import { create } from 'zustand';
import api, { TOKEN_KEY, getGuestSessionId } from '@/lib/api';
import type { User } from '@/types';
import { isStaff } from '@/lib/format';

interface AuthState {
  user: User | null;
  token: string | null;
  initialized: boolean;
  authModal: { open: boolean; mode: 'login' | 'register'; reason?: string };
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  openAuthModal: (mode?: 'login' | 'register', reason?: string) => void;
  closeAuthModal: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  initialized: false,
  authModal: { open: false, mode: 'login' },

  init: async () => {
    if (!get().token) {
      set({ initialized: true });
      return;
    }
    try {
      const { data } = await api.get('/auth/user');
      const user = data.data;

      // If customer session contains an administrator account, purge it from customer store
      if (isStaff(user?.role)) {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null, initialized: true });
        return;
      }

      set({ user, initialized: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password, guest_session_id: getGuestSessionId() });
    const user = data.data.user;

    // Explicitly prevent administrator accounts from logging into customer store
    if (isStaff(user.role)) {
      if (data.data.token) {
        api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${data.data.token}` },
        }).catch(() => {});
      }
      throw new Error('Incorrect email or password. Please try again.');
    }

    localStorage.setItem(TOKEN_KEY, data.data.token);
    set({ user: data.data.user, token: data.data.token });
    return data.data.user;
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', { ...payload, guest_session_id: getGuestSessionId() });
    localStorage.setItem(TOKEN_KEY, data.data.token);
    set({ user: data.data.user, token: data.data.token });
    return data.data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
  openAuthModal: (mode = 'login', reason) => set({ authModal: { open: true, mode, reason } }),
  closeAuthModal: () => set((s) => ({ authModal: { ...s.authModal, open: false } })),
}));

window.addEventListener('phonehub:unauthorized', () => {
  useAuth.setState({ user: null, token: null });
});

