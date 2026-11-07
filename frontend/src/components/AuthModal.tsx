import { useState, useEffect } from 'react';
import { Modal, Button } from './ui';
import { useAuth } from '@/stores/auth';
import { getErrorMessage } from '@/lib/api';
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
} from 'lucide-react';

export function AuthModal() {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModal.mode || 'login');
  const [loading, setLoading] = useState(false);
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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'customer' | 'admin') => {
    setError(null);
    if (type === 'customer') {
      setFormData((prev) => ({
        ...prev,
        email: 'khsophea20@gmail.com',
        password: 'password',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@phonehub.com',
        password: 'password',
      }));
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

          {/* Quick Demo Test Logins (Convenient for reviewer / testing) */}
          {mode === 'login' && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                <div className="h-px bg-zinc-200 flex-1" />
                <span>Quick Test Sign In</span>
                <div className="h-px bg-zinc-200 flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('customer')}
                  className="px-2.5 py-1.5 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-xs font-semibold text-zinc-700 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <User className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Customer Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="px-2.5 py-1.5 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-xs font-semibold text-zinc-700 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>Admin Demo</span>
                </button>
              </div>
            </div>
          )}

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
