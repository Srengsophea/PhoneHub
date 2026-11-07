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
  ChevronRight,
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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <img
                src="/phonehub_logo.png"
                alt="PhoneHub"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-950">
                Phone<span className="text-red-600">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Inline Search Bar on Desktop & Tablets */}
          <NavbarSearch className="hidden sm:block w-52 md:w-64 lg:w-80" />

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="sm:hidden p-2 text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Compare (Desktop / Tablet) */}
            <Link
              to="/compare"
              className="hidden sm:flex relative p-2 text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition"
              title="Compare phones"
            >
              <Scale className="h-5 w-5" />
              {compareItems.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white shadow-xs">
                  {compareItems.length}
                </span>
              )}
            </Link>

            {/* Wishlist (Desktop / Tablet) */}
            <Link
              to="/wishlist"
              className="hidden sm:flex relative p-2 text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistIds.size > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                  {wishlistIds.size}
                </span>
              )}
            </Link>

            {/* Shopping Cart (Always in Header) */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount() > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                  {cartCount()}
                </span>
              )}
            </button>

            {/* User Profile / Auth (Desktop) */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdown(!userDropdown);
                  }}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-zinc-100 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-xs font-bold text-white shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block text-xs font-bold text-zinc-800 max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-xl animate-scale-in">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="text-[11px] text-zinc-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-zinc-900 truncate">{user.email}</p>
                    </div>

                    {isStaff(user.role) && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition"
                    >
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                      My Account & Orders
                    </Link>

                    <button
                      type="button"
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-zinc-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition shadow-2xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Inline Search Bar Dropdown */}
        {mobileSearchOpen && (
          <div className="sm:hidden border-t border-zinc-100 bg-white/98 px-4 py-3 backdrop-blur-md shadow-md animate-fade-in">
            <NavbarSearch className="w-full" />
          </div>
        )}

        {/* Mobile Slide-Down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-xl animate-fade-in">
            {/* 1. Account Section */}
            {user ? (
              <div className="rounded-xl border border-zinc-200/90 bg-zinc-50 p-3 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white font-bold text-sm shrink-0 shadow-2xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold text-zinc-950 truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200/60">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-white border border-zinc-200 text-xs font-bold text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-zinc-600" />
                    My Account
                  </Link>
                  {isStaff(user.role) ? (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Admin
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-white border border-zinc-200 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200/90 bg-zinc-50 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <p className="text-sm font-bold text-zinc-950">Welcome to PhoneHub</p>
                  <p className="text-xs text-zinc-500">Sign in to track orders and save devices</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-md bg-zinc-950 text-white text-xs font-bold shrink-0 hover:bg-zinc-800 transition shadow-xs"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* 2. Quick Mobile Actions Bar (Compare, Wishlist, Track) */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition text-center relative"
              >
                <div className="relative">
                  <Scale className="h-4 w-4 text-zinc-700" />
                  {compareItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white">
                      {compareItems.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-zinc-800 mt-1">Compare</span>
              </Link>

              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition text-center relative"
              >
                <div className="relative">
                  <Heart className="h-4 w-4 text-red-500" />
                  {wishlistIds.size > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {wishlistIds.size}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-zinc-800 mt-1">Wishlist</span>
              </Link>

              <Link
                to="/orders/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition text-center"
              >
                <Package className="h-4 w-4 text-zinc-700" />
                <span className="text-[11px] font-bold text-zinc-800 mt-1">Track</span>
              </Link>
            </div>

            {/* 3. Navigation Links */}
            <div className="space-y-1 pt-1 border-t border-zinc-100">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-sm font-bold text-zinc-900 py-2.5 px-3 rounded-lg hover:bg-zinc-100 transition"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </Link>
              ))}
            </div>

            {/* 4. Store Guarantee Footer */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Genuine
              </span>
              <span>•</span>
              <span>1-Yr Warranty</span>
              <span>•</span>
              <span>Free Delivery &gt; $500</span>
            </div>
          </div>
        )}
      </header>

      {/* Modals & Overlays */}
      <CartDrawer />
      <AuthModal />
    </>
  );
}
