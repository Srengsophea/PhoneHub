import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/stores/adminAuth';
import { isStaff } from '@/lib/format';
import { Button } from '@/components/ui';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, initialized, init } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('unauthorized') === '1'
      ? 'Access restricted: Your account does not have administrative privileges.'
      : null
  );

  useEffect(() => {
    init();
  }, [init]);

  // If already authenticated as an administrator, go straight to the dashboard
  useEffect(() => {
    if (initialized && user && isStaff(user.role)) {
      navigate('/admin', { replace: true });
    }
  }, [user, initialized, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(getErrorMessage(err, 'Invalid administrator credentials. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-red-500 selection:text-white relative overflow-hidden">
      {/* Background Subtle Tech Grid Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 group text-zinc-400 hover:text-white text-xs font-semibold transition">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Storefront</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[11px] font-semibold text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Security Gateway Active</span>
        </div>
      </header>

      {/* Login Portal Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <img
                src="/phonehub_logo.png"
                alt="PhoneHub"
                className="h-9 w-auto object-contain brightness-110 drop-shadow-md"
              />
              <span className="font-black text-2xl tracking-tight text-white">
                Phone<span className="text-red-500">Hub</span>
              </span>
              <span className="ml-1 text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Administrator Portal
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Authorized personnel only. Enter your administrative credentials to manage store operations.
            </p>
          </div>

          {/* Form Box */}
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@phonehub.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-xl h-11 gap-2 shadow-lg shadow-red-600/20 active:scale-98 transition justify-center"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authenticate & Enter Console</span>
                </Button>
              </div>
            </form>

            <div className="pt-2 border-t border-zinc-800/80 text-center">
              <p className="text-[11px] text-zinc-500">
                Encrypted with TLS 1.3. All administrative actions are recorded in the system audit logs.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-zinc-600">
        PhoneHub Global Administration &bull; Version 2.4.0
      </footer>
    </div>
  );
}

