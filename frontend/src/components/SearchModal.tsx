import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  ArrowRight,
  X,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, productImage } from '@/lib/format';
import type { Product } from '@/types';

const POPULAR_BRANDS = [
  { name: 'Apple', slug: 'apple', color: 'bg-zinc-100 text-zinc-900 border-zinc-200' },
  { name: 'Samsung', slug: 'samsung', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Google Pixel', slug: 'google', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Xiaomi', slug: 'xiaomi', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'OnePlus', slug: 'oneplus', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Tecno', slug: 'tecno', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Honor', slug: 'honor', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const RECENT_SEARCHES_KEY = 'phonehub_recent_searches';

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      setRecentSearches([]);
    }
  }, [open]);

  // Load featured flagship phones when opened
  useEffect(() => {
    if (!open) return;
    async function loadFeatured() {
      try {
        const { data } = await api.get('/products/suggestions?q=');
        setFeatured(data?.data?.slice(0, 4) || []);
      } catch {
        setFeatured([]);
      }
    }
    loadFeatured();
  }, [open]);

  // Focus input automatically on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Save recent search
  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        5
      );
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== text);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecent = () => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/suggestions?q=${encodeURIComponent(trimmed)}`);
        setResults(data?.data || []);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation (Arrow keys, Enter, ESC, CMD+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
        return;
      }

      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const activeList = query.trim() ? results : featured;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && activeList[selectedIndex]) {
          e.preventDefault();
          handleSelect(activeList[selectedIndex].slug);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, results, featured, query, selectedIndex]);

  const handleSelect = (slug: string) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onClose();
    navigate(`/products/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    onClose();
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const handleBrandClick = (brandSlug: string) => {
    onClose();
    navigate(`/products?brand=${brandSlug}`);
  };

  const handleQuickTermClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-16 sm:pt-20 md:pt-24 bg-black/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-100 flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-zinc-100 px-5 py-4">
          <Search className="h-5 w-5 text-zinc-400 shrink-0 mr-3.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search phones, brands, series (e.g. iPhone 16, S24 Ultra, Pixel)..."
            className="w-full bg-transparent text-base sm:text-lg text-zinc-900 placeholder:text-zinc-400 outline-none"
          />

          <div className="flex items-center gap-2 ml-2 shrink-0">
            {loading && <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />}

            {query && !loading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
                title="Clear query"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-lg transition"
            >
              ESC
            </button>
          </div>
        </form>

        {/* Modal Scrollable Body */}
        <div ref={listRef} className="overflow-y-auto flex-1 divide-y divide-zinc-100/80 p-2 sm:p-3">
          {/* STATE 1: Empty Query - Show Quick Brands, Recent Searches & Featured Flagships */}
          {!query.trim() && (
            <div className="space-y-5 p-3">
              {/* Quick Brand Pills */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span>Popular Brands</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_BRANDS.map((brand) => (
                    <button
                      key={brand.slug}
                      type="button"
                      onClick={() => handleBrandClick(brand.slug)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition hover:scale-105 active:scale-95 ${brand.color}`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[11px] font-normal text-zinc-400 hover:text-red-500 transition"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleQuickTermClick(term)}
                        className="group flex items-center gap-1 px-3 py-1 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-xs font-medium text-zinc-700 cursor-pointer transition"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="opacity-40 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 p-0.5 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Smartphones */}
              {featured.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Featured Flagships</span>
                  </div>
                  <div className="space-y-1">
                    {featured.map((p, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelect(p.slug)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition ${
                            isSelected
                              ? 'bg-zinc-100 ring-1 ring-zinc-300'
                              : 'hover:bg-zinc-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={productImage(p)}
                              alt={p.name}
                              className="h-11 w-11 rounded-xl object-contain bg-zinc-50 p-1 border border-zinc-100"
                            />
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                              <p className="text-xs text-zinc-400 font-medium">
                                {p.brand?.name || 'Smartphone'} • Certified
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-zinc-900">
                              {formatPrice(p.sale_price ?? p.base_price)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: Active Results Matching Query */}
          {query.trim() && results.length > 0 && (
            <div className="space-y-1 p-1">
              <div className="px-3 py-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Phones ({results.length})</span>
                <span className="text-[11px] font-normal text-zinc-400">Press ↵ to view</span>
              </div>

              {results.map((p, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p.slug)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-zinc-100 ring-2 ring-zinc-900/10'
                        : 'hover:bg-zinc-50 border border-transparent hover:border-zinc-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={productImage(p)}
                        alt={p.name}
                        className="h-12 w-12 rounded-xl object-contain bg-zinc-50 p-1 border border-zinc-100 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-bold text-zinc-950">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-block text-[11px] font-semibold px-2 py-0.2 rounded-md bg-zinc-100 text-zinc-600">
                            {p.brand?.name || 'Smartphone'}
                          </span>
                          {p.sale_price && p.sale_price < p.base_price && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                              Sale
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-zinc-900">
                          {formatPrice(p.sale_price ?? p.base_price)}
                        </div>
                        {p.sale_price && p.sale_price < p.base_price && (
                          <div className="text-xs text-zinc-400 line-through">
                            {formatPrice(p.base_price)}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                );
              })}

              {/* View All Matching Results in Catalog */}
              <div className="pt-2 px-1">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-xs font-bold text-zinc-800 transition shadow-sm"
                >
                  <Search className="h-3.5 w-3.5 text-zinc-500" />
                  <span>See all matching phones in store catalog for "{query.trim()}"</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: No Results */}
          {query.trim() && !loading && results.length === 0 && (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                No smartphones found for "{query.trim()}"
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Check your spelling or try popular keywords like "iPhone", "Galaxy", or "Pixel".
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuery('iPhone')}
                  className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-700 transition"
                >
                  iPhone
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Samsung')}
                  className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-700 transition"
                >
                  Samsung
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Pixel')}
                  className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-700 transition"
                >
                  Pixel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Command Bar Footer with Keyboard Shortcuts */}
        <div className="px-5 py-3 bg-zinc-50/90 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 shadow-2xs">
                ↑↓
              </kbd>
              <span className="hidden sm:inline">Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 shadow-2xs">
                ↵
              </kbd>
              <span className="hidden sm:inline">Select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 shadow-2xs">
                ESC
              </kbd>
              <span className="hidden sm:inline">Close</span>
            </span>
          </div>

          <span className="font-medium text-[11px] text-zinc-400">PhoneHub Instant Search</span>
        </div>
      </div>
    </div>
  );
}
