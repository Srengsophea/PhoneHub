import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Scale,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { useWishlist } from '@/stores/wishlist';
import { useCompare } from '@/stores/compare';
import { isStaff } from '@/lib/format';
import { NavbarSearch } from './NavbarSearch';
import { CartDrawer } from './CartDrawer';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout, openAuthModal } = useAuth();
  const { setOpen: setCartOpen, count: cartCount } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { items: compareItems } = useCompare();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClose = () => setUserDropdown(false);
    if (userDropdown) {
      window.addEventListener('click', handleClose);
      return () => window.removeEventListener('click', handleClose);
    }
  }, [userDropdown]);

  const navLinks = [
    { label: 'Store', to: '/products' },
    { label: 'Brands', to: '/brands' },
    { label: 'Track Order', to: '/orders/track' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/phonehub_logo.png"
                alt="PhoneHub"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-lg tracking-tight text-zinc-950">
                Phone<span className="text-red-600">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Inline Search Bar on Desktop */}
          <NavbarSearch className="hidden sm:block w-64 lg:w-80" />

          {/* Actions: Compare, Wishlist, Cart, Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/compare"
              className="relative p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
              title="Compare phones"
            >
              <Scale className="h-5 w-5" />
              {compareItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                  {compareItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/wishlist"
              className="relative p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistIds.size > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {wishlistIds.size}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount() > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                  {cartCount()}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdown(!userDropdown);
                  }}
                  className="flex items-center gap-2 rounded-xl p-1.5 sm:px-3 hover:bg-zinc-100 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium text-zinc-800 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-xl animate-scale-in">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="text-xs text-zinc-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-zinc-900 truncate">{user.email}</p>
                    </div>

                    {isStaff(user.role) && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                      My Account & Orders
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile inline search bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden border-t border-zinc-100 bg-white/95 px-4 py-2.5 backdrop-blur-md">
            <NavbarSearch className="w-full" />
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-zinc-800 py-1.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Modals & Overlays */}
      <CartDrawer />
      <AuthModal />
    </>
  );
}

