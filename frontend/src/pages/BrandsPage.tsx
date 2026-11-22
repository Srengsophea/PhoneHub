import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import type { Brand } from '@/types';
import {
  ArrowUpRight,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';

interface BrandMeta {
  tagline: string;
  origin: string;
  accent: string;
}

const BRAND_META: Record<string, BrandMeta> = {
  apple: {
    tagline: 'iPhone Pro titanium craftsmanship & A-series silicon',
    origin: 'Cupertino, USA',
    accent: 'group-hover:border-zinc-900',
  },
  samsung: {
    tagline: 'Galaxy S Ultra, Z Foldables & Galaxy AI innovation',
    origin: 'Seoul, South Korea',
    accent: 'group-hover:border-[#034EA2]/60',
  },
  xiaomi: {
    tagline: 'Co-engineered Leica optics & HyperOS flagship power',
    origin: 'Beijing, China',
    accent: 'group-hover:border-[#FF6900]/60',
  },
  google: {
    tagline: 'Tensor AI intelligence & pure Pixel computational photography',
    origin: 'Mountain View, USA',
    accent: 'group-hover:border-[#4285F4]/60',
  },
  oneplus: {
    tagline: 'Never Settle speed, SuperVOOC charging & Hasselblad cameras',
    origin: 'Shenzhen, China',
    accent: 'group-hover:border-[#EB0029]/60',
  },
  oppo: {
    tagline: 'Find X flagship imaging & sleek Reno portrait engineering',
    origin: 'Dongguan, China',
    accent: 'group-hover:border-[#008450]/60',
  },
  vivo: {
    tagline: 'ZEISS co-engineered lenses & X-series portrait mastery',
    origin: 'Dongguan, China',
    accent: 'group-hover:border-[#0055FF]/60',
  },
  nothing: {
    tagline: 'Transparent industrial design & iconic Glyph Interface',
    origin: 'London, UK',
    accent: 'group-hover:border-zinc-900',
  },
  honor: {
    tagline: 'Magic flagship displays & ultra-thin silicon-carbon batteries',
    origin: 'Shenzhen, China',
    accent: 'group-hover:border-zinc-900',
  },
  asus: {
    tagline: 'ROG Phone gaming beasts & compact Zenfone flagships',
    origin: 'Taipei, Taiwan',
    accent: 'group-hover:border-zinc-900',
  },
  realme: {
    tagline: 'GT flagship killers & bold performance-first design',
    origin: 'Shenzhen, China',
    accent: 'group-hover:border-amber-500/70',
  },
  sony: {
    tagline: 'Xperia cinema-grade Alpha cameras & creator audio',
    origin: 'Tokyo, Japan',
    accent: 'group-hover:border-zinc-900',
  },
  motorola: {
    tagline: 'Iconic Razr foldables & clean Edge OLED experiences',
    origin: 'Chicago, USA',
    accent: 'group-hover:border-[#00142E]/60',
  },
  infinix: {
    tagline: 'High-refresh AMOLED displays & rapid All-Round FastCharge',
    origin: 'Hong Kong',
    accent: 'group-hover:border-zinc-900',
  },
  tecno: {
    tagline: 'Phantom foldables, Camon AI imaging & bold value',
    origin: 'Shenzhen, China',
    accent: 'group-hover:border-[#0057FF]/60',
  },
  huawei: {
    tagline: 'XMAGE photography pioneers & precision foldable hardware',
    origin: 'Shenzhen, China',
    accent: 'group-hover:border-[#ED1C24]/60',
  },
};

function getBrandMeta(brand: Brand): BrandMeta {
  const key = (brand.slug || brand.name).toLowerCase().trim();
  const matchKey = Object.keys(BRAND_META).find((k) => key.includes(k));
  if (matchKey) return BRAND_META[matchKey];
  return {
    tagline: brand.description || 'Factory-sealed smartphones backed by official warranty',
    origin: 'Authorized Partner',
    accent: 'group-hover:border-zinc-900',
  };
}

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'alpha'>('popular');

  useEffect(() => {
    async function fetchBrands() {
      try {
        const { data } = await api.get('/brands');
        setBrands(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  const totalModels = useMemo(
    () => brands.reduce((sum, b) => sum + Number(b.products_count ?? 0), 0),
    [brands]
  );

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? brands.filter((b) => {
          const meta = getBrandMeta(b);
          return (
            b.name.toLowerCase().includes(q) ||
            (b.description || '').toLowerCase().includes(q) ||
            meta.tagline.toLowerCase().includes(q)
          );
        })
      : [...brands];

    return list.sort((a, b) => {
      if (sortBy === 'popular') {
        const diff = Number(b.products_count ?? 0) - Number(a.products_count ?? 0);
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name);
    });
  }, [brands, search, sortBy]);

  const showSpotlight = !search.trim() && sortBy === 'popular' && filteredBrands.length > 4;
  const featuredBrands = showSpotlight ? filteredBrands.slice(0, 4) : [];
  const directoryBrands = showSpotlight ? filteredBrands.slice(4) : filteredBrands;

  if (loading) {
    return (
      <div className="container-page py-12 space-y-10 animate-fade-in">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
          <div className="h-10 w-72 rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
          <div className="h-4 w-96 max-w-full rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-24 rounded-xl bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
                <div className="h-6 w-16 rounded-full bg-zinc-100" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-28 rounded bg-zinc-100" />
                <div className="h-3 w-full rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14 space-y-12">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 via-white to-zinc-100/70 p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Authorized Retail Partners</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              Shop by Official Brand
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Explore 100% genuine, factory-sealed smartphones sourced directly from the world&apos;s leading mobile manufacturers — backed by official warranty.
            </p>
          </div>

          {/* Compact Trust Metrics */}
          <div className="grid grid-cols-2 sm:flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-zinc-200/90 bg-white px-5 py-3.5 shadow-2xs">
              <p className="text-2xl font-black text-zinc-950 leading-none">{brands.length}</p>
              <p className="text-[11px] font-semibold text-zinc-500 mt-1 uppercase tracking-wider">
                Official Brands
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/90 bg-white px-5 py-3.5 shadow-2xs">
              <p className="text-2xl font-black text-zinc-950 leading-none">{totalModels}+</p>
              <p className="text-[11px] font-semibold text-zinc-500 mt-1 uppercase tracking-wider">
                Active Models
              </p>
            </div>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="mt-7 pt-6 border-t border-zinc-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand (e.g. Apple, Samsung, Xiaomi)..."
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-9 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-200/60 border border-zinc-200/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'popular'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Most Models
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'alpha'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              A – Z
            </button>
          </div>
        </div>
      </section>

      {/* Featured Top Manufacturers */}
      {showSpotlight && featuredBrands.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-600" />
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-950">
                Top Flagship Ecosystems
              </h2>
            </div>
            <span className="text-xs font-medium text-zinc-500 hidden sm:inline">
              Most popular collections on PhoneHub
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredBrands.map((b) => {
              const meta = getBrandMeta(b);
              const count = Number(b.products_count ?? 0);
              return (
                <Link
                  key={b.id}
                  to={`/products?brand=${b.slug}`}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${meta.accent}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="h-14 min-w-[3.5rem] px-3.5 rounded-xl border border-zinc-200/70 bg-zinc-50/80 flex items-center justify-center group-hover:bg-white group-hover:border-zinc-300 transition-colors">
                        <BrandLogo name={b.name} slug={b.slug} className="h-8 w-auto" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                        <Smartphone className="h-3 w-3" />
                        {count} {count === 1 ? 'Model' : 'Models'}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-zinc-950 tracking-tight">
                      {b.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                      {b.description || meta.tagline}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {meta.origin}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                      Explore
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Full Brand Directory */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-zinc-950">
            {showSpotlight
              ? 'More Authorized Brands'
              : search.trim()
              ? `Search Results (${filteredBrands.length})`
              : 'All Authorized Brands'}
          </h2>
          {!search.trim() && (
            <Link
              to="/products"
              className="text-xs font-bold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 transition"
            >
              Browse All Phones <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {directoryBrands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 py-16 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-900">No brands match &ldquo;{search}&rdquo;</p>
            <p className="text-xs text-zinc-500">Try searching for Apple, Samsung, Xiaomi, or Google.</p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {directoryBrands.map((b) => {
              const meta = getBrandMeta(b);
              const count = Number(b.products_count ?? 0);
              return (
                <Link
                  key={b.id}
                  to={`/products?brand=${b.slug}`}
                  className={`group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${meta.accent}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="h-11 min-w-[3rem] px-3 rounded-xl border border-zinc-100 bg-zinc-50/90 flex items-center justify-center group-hover:bg-white group-hover:border-zinc-200 transition-colors">
                        <BrandLogo name={b.name} slug={b.slug} className="h-7 w-auto" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100/90 px-2.5 py-1 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                        {count} {count === 1 ? 'Model' : 'Models'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                      {b.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                      {b.description || meta.tagline}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-400">
                      {meta.origin}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-200">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
