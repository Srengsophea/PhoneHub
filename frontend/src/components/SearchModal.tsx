import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { Modal } from './ui';
import api from '@/lib/api';
import { formatPrice, productImage } from '@/lib/format';
import type { Product } from '@/types';

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut listener for CMD+K / CTRL+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSelect = (slug: string) => {
    onClose();
    navigate(`/products/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by phone name, brand (e.g. iPhone 16, Samsung S24)..."
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 pl-12 pr-10 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-zinc-400" />
        )}
      </form>

      {/* Quick Suggestions list */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {results.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelect(p.slug)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 cursor-pointer border border-transparent hover:border-zinc-200/80 transition"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={productImage(p)}
                alt={p.name}
                className="h-12 w-12 rounded-lg object-contain bg-zinc-100 p-1"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.brand?.name || 'Smartphone'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-zinc-900">
                {formatPrice(p.sale_price ?? p.base_price)}
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        ))}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="py-8 text-center text-sm text-zinc-500">
            No phones found matching "{query}".
          </div>
        )}
      </div>
    </Modal>
  );
}

