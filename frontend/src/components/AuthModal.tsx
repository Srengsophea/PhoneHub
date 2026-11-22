import { useState, useEffect } from 'react';
import { Modal, Button } from './ui';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
} from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '768009154981-5jsg5cqo3l1dgfloqg1pbnb5m4ujs54p.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.oauth2) {
          window.clearInterval(timer);
          resolve();
        } else if (attempts > 50) {
          window.clearInterval(timer);
          reject(new Error('Google sign-in failed to initialize. Please refresh and try again.'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google Sign-In. Please check your connection.'));
    document.head.appendChild(script);
  });
}

export function AuthModal() {
  const { authModal, closeAuthModal, login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModal.mode || 'login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  // Keep internal mode in sync whenever authModal opens or mode is set from outside
  useEffect(() => {
    if (authModal.open) {
      setMode(authModal.mode || 'login');
      setError(null);
    }
  }, [authModal.open, authModal.mode]);

  const passwordsMatch =
    mode === 'register' &&
    formData.password_confirmation.length > 0 &&
    formData.password === formData.password_confirmation;

  const passwordsMismatch =
    mode === 'register' &&
    formData.password_confirmation.length > 0 &&
    formData.password !== formData.password_confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && formData.password !== formData.password_confirmation) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      closeAuthModal();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          mode === 'login'
            ? 'Incorrect email or password. Please try again.'
            : 'Could not complete registration. Please check your information and try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loadGoogleIdentityScript();
      const oauth2 = window.google?.accounts?.oauth2;
      if (!oauth2) {
        throw new Error('Google Sign-In is unavailable right now. Please try again.');
      }

      const tokenClient = oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setGoogleLoading(false);
            if (tokenResponse.error !== 'access_denied') {
              setError(tokenResponse.error_description || 'Google sign-in was not completed.');
            }
            return;
          }

          try {
            const loggedUser = await loginWithGoogle({ access_token: tokenResponse.access_token });
            useCart.getState().fetch();
            toast.success(`Welcome, ${loggedUser.name}!`);
            closeAuthModal();
          } catch (err) {
            setError(getErrorMessage(err, 'Could not sign in with Google. Please try again.'));
          } finally {
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          setGoogleLoading(false);
          if (err?.type !== 'popup_closed') {
            setError('Google sign-in popup was blocked or closed. Please allow popups and try again.');
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setGoogleLoading(false);
      setError(getErrorMessage(err, 'Could not connect with Google. Please try again.'));
    }
  };

  return (
    <Modal open={authModal.open} onClose={closeAuthModal} size="md">
      <div className="space-y-6">
        {/* Header with Brand & Logo */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <img
              src="/phonehub_logo.png"
              alt="PhoneHub"
              className="h-8 w-auto object-contain"
            />
            <span className="font-extrabold text-xl tracking-tight text-zinc-950">
              Phone<span className="text-red-600">Hub</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Sign in to access your orders, track shipments, and sync your cart.'
              : 'Join PhoneHub to unlock official factory warranties and express checkout.'}
          </p>

          {/* Reason Banner (if triggered by protected action like Add to Cart) */}
          {authModal.reason && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200/80 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs">
              <KeyRound className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>{authModal.reason}</span>
            </div>
          )}
        </div>

        {/* Segmented Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-md transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-md transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md animate-fade-in">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Continue with Google Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-400 active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait transition cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.88-3.03c-1.08.72-2.46 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.13C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.61l4.03 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
            )}
            <span>
              {googleLoading
                ? 'Connecting to Google...'
                : mode === 'login'
                ? 'Continue with Google'
                : 'Sign up with Google'}
            </span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-200" />
            <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400 shrink-0">
              or continue with email
            </span>
            <div className="w-full border-t border-zinc-200" />
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sreng Sophea"
                  className="w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-2xs outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-2xs outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Phone Number <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+855 87 656 560"
                  className="w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-2xs outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Password <span className="text-red-500">*</span>
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Please contact PhoneHub support to reset your password.')}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-md border border-zinc-300 bg-white pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-2xs outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 focus:outline-none p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="mt-1 text-[11px] text-zinc-400">Must be at least 8 characters</p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                {passwordsMatch && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Passwords match
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[11px] font-semibold text-red-500">
                    Passwords do not match
                  </span>
                )}
              </div>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, password_confirmation: e.target.value })
                  }
                  placeholder="••••••••"
                  className={`w-full rounded-md border bg-white pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-2xs outline-none transition ${
                    passwordsMismatch
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-zinc-300 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 focus:outline-none p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 accent-zinc-950"
                />
                <span>Remember this device</span>
              </label>
            </div>
          )}

          {/* Submit Action Button */}
          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full h-11 font-bold text-sm bg-zinc-950 hover:bg-zinc-800 text-white rounded-md shadow-sm transition-all active:scale-[0.98] gap-2 mt-2"
          >
            {mode === 'login' ? (
              <>
                <span>Sign In to PhoneHub</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Create Official Account</span>
              </>
            )}
          </Button>

          {/* Footer Switching Hint */}
          <div className="pt-2 text-center text-xs text-zinc-500">
            {mode === 'login' ? (
              <p>
                New to PhoneHub?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Security Trust Micro-Footer */}
        <div className="border-t border-zinc-100 pt-3 text-center">
          <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-zinc-400" />
            <span>256-Bit SSL Encrypted • Authentic 1-Year Warranty Included</span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
