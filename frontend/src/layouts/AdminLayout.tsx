import { useEffect, useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from '@/stores/adminAuth';
import { isStaff } from '@/lib/format';

interface NavGroup {
  title: string;
  items: { label: string; to: string; icon: React.ReactNode }[];
}

const PAGE_TITLES: Record<string, string> = {
  '': 'Overview',
  products: 'Products & Models',
  inventory: 'Stock & Inventory',
  orders: 'Orders & Shipments',
  customers: 'Customers',
  coupons: 'Coupons & Promos',
  reviews: 'Reviews Moderation',
  'audit-logs': 'Audit Logs',
};

function formatRoleLabel(role?: string): string {
  if (!role) return 'Administrator';
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function AdminLayout() {
  const { user, initialized, logout, init } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  const navGroups: NavGroup[] = [
    {
      title: 'Store Operations',
      items: [
        { label: 'Overview', to: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Orders & Shipments', to: '/admin/orders', icon: <ShoppingBag className="h-4 w-4" /> },
        { label: 'Products & Models', to: '/admin/products', icon: <Smartphone className="h-4 w-4" /> },
        { label: 'Stock & Inventory', to: '/admin/inventory', icon: <Layers className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Customers & Growth',
      items: [
        { label: 'Customers', to: '/admin/customers', icon: <Users className="h-4 w-4" /> },
        { label: 'Coupons & Promos', to: '/admin/coupons', icon: <Tag className="h-4 w-4" /> },
        { label: 'Reviews Moderation', to: '/admin/reviews', icon: <Star className="h-4 w-4" /> },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: <Activity className="h-4 w-4" /> },
      ],
    },
  ];

  const routeSegment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || '';
  const currentTitle = PAGE_TITLES[routeSegment] || routeSegment;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-zinc-200/80 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <img
              src="/phonehub_logo.png"
              alt="PhoneHub"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-base tracking-tight text-zinc-950">
              Phone<span className="text-red-600">Hub</span>
              <span className="ml-1.5 rounded bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Admin
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                {group.title}
              </p>
              {group.items.map((item) => {
                const active =
                  item.to === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition ${
                      active
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950'
                    }`}
                  >
                    <span className={active ? 'text-white' : 'text-zinc-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Sidebar Actions */}
      <div className="p-4 border-t border-zinc-100 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-400" />
          <span>Back to Public Store</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out ({formatRoleLabel(user?.role)})</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50/80 text-zinc-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-zinc-200/80 bg-white shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 font-medium">
              <span className="hidden sm:inline">Administration</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-300 hidden sm:inline" />
              <span className="text-zinc-950 font-bold">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live System Online</span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-zinc-950 leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] font-semibold text-zinc-400">
                  {formatRoleLabel(user?.role)}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 flex-1 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
