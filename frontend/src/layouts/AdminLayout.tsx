import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Activity,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAdminAuth } from '@/stores/adminAuth';
import { isStaff } from '@/lib/format';
import { useEffect } from 'react';

export function AdminLayout() {
  const { user, initialized, logout, init } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initialized) {
      if (!user) {
        navigate('/admin/login', { replace: true });
      } else if (!isStaff(user.role)) {
        navigate('/admin/login?unauthorized=1', { replace: true });
      }
    }
  }, [user, initialized, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!initialized || !user || !isStaff(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', to: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Products & Models', to: '/admin/products', icon: <Smartphone className="h-4 w-4" /> },
    { label: 'Stock & Inventory', to: '/admin/inventory', icon: <Layers className="h-4 w-4" /> },
    { label: 'Orders & Shipments', to: '/admin/orders', icon: <ShoppingBag className="h-4 w-4" /> },
    { label: 'Customers', to: '/admin/customers', icon: <Users className="h-4 w-4" /> },
    { label: 'Coupons & Promos', to: '/admin/coupons', icon: <Tag className="h-4 w-4" /> },
    { label: 'Reviews Moderation', to: '/admin/reviews', icon: <Star className="h-4 w-4" /> },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50/70 text-zinc-900 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-zinc-200/80 bg-white flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/phonehub_logo.png"
                alt="PhoneHub"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-base tracking-tight text-zinc-950">
                Phone<span className="text-red-600">Hub</span>
                <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                  ADMIN
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active =
                item.to === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="p-4 border-t border-zinc-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Public Store</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out ({user?.role})</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <span>Administration</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
            <span className="text-zinc-900 font-semibold capitalize">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Database Connected</span>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-zinc-900 leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] font-semibold text-zinc-400 capitalize">
                  {user?.role || 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

