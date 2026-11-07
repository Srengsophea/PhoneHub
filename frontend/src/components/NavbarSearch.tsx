import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X, ArrowRight, ChevronRight, Flame } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, productImage } from '@/lib/format';
import type { Product } from '@/types';

const POPULAR_BRANDS = [
  { name: 'Apple', slug: 'apple' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Google', slug: 'google' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'OnePlus', slug: 'oneplus' },
];

export function NavbarSearch({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/suggestions?q=${encodeURIComponent(trimmed)}`);
        setResults(data?.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    inputRef.current?.blur();
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    navigate(`/products/${slug}`);
  };

  const handleBrandClick = (slug: string) => {
    setIsOpen(false);
    navigate(`/products?brand=${slug}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Inline Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search phones, brands..."
          className="w-full rounded-full border border-zinc-200 bg-zinc-50/80 pl-10 pr-9 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10"
        />

        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>

      {/* Floating Inline Autocomplete Dropdown directly under the search bar */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-200/90 divide-y divide-zinc-100 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Case 1: Query has results */}
          {query.trim() && results.length > 0 && (
            <div className="p-1.5 max-h-[360px] overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Phones
              </div>
              {results.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={productImage(product)}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-contain bg-zinc-100 p-1 border border-zinc-200/50"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 leading-tight">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.brand?.name || 'Smartphone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      {formatPrice(product.sale_price ?? product.base_price)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </div>
                </div>
              ))}

              {/* View all results button */}
              <div className="pt-1 mt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-brand-600 hover:bg-brand-50 transition"
                >
                  <span>See all results for "{query.trim()}"</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Case 2: Query has no results */}
          {query.trim() && !loading && results.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-xs text-zinc-500">No phones matching "{query.trim()}"</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
              >
                Search full catalog for "{query.trim()}" →
              </button>
            </div>
          )}

          {/* Case 3: Empty query - Show popular brands */}
          {!query.trim() && (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span>Popular Brands</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BRANDS.map((brand) => (
                  <button
                    key={brand.slug}
                    type="button"
                    onClick={() => handleBrandClick(brand.slug)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

