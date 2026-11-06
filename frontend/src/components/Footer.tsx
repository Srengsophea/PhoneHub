import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, Heart } from 'lucide-react';

export function Footer() {
  const perks = [
    {
      icon: <Truck className="h-5 w-5 text-zinc-900" />,
      title: 'Free Express Shipping',
      desc: 'On all phone orders over $500',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-zinc-900" />,
      title: 'Official Warranty',
      desc: '100% genuine with 1-year coverage',
    },
    {
      icon: <RefreshCw className="h-5 w-5 text-zinc-900" />,
      title: 'Easy 14-Day Returns',
      desc: 'Hassle-free replacement policy',
    },
    {
      icon: <Headphones className="h-5 w-5 text-zinc-900" />,
      title: 'Dedicated Support',
      desc: 'Expert tech assistance 24/7',
    },
  ];

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/50 mt-20">
      {/* Trust Badges */}
      <div className="border-b border-zinc-200/80">
        <div className="container-page py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {perks.map((p, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft border border-zinc-200/60">
                {p.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">{p.title}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm">
                P
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900">
                Phone<span className="text-brand-600">Hub</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-zinc-500 max-w-sm leading-relaxed">
              Your premier destination for verified flagship smartphones, tablets, and cutting-edge mobile gear.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Store</h5>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><Link to="/products" className="hover:text-zinc-900">All Smartphones</Link></li>
              <li><Link to="/brands" className="hover:text-zinc-900">Brands</Link></li>
              <li><Link to="/products?featured=1" className="hover:text-zinc-900">Flagships</Link></li>
              <li><Link to="/products?on_sale=1" className="hover:text-zinc-900">Deals & Offers</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Support</h5>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><Link to="/orders/track" className="hover:text-zinc-900">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-zinc-900">My Account</Link></li>
              <li><a href="#" className="hover:text-zinc-900">Warranty Check</a></li>
              <li><a href="#" className="hover:text-zinc-900">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Legal</h5>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li><a href="#" className="hover:text-zinc-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-900">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} PhoneHub Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for premium mobile retail.
          </p>
        </div>
      </div>
    </footer>
  );
}

