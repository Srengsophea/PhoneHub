import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Button, Pagination, Select } from '@/components/ui';
import type { Product, Brand, Category, PaginationMeta } from '@/types';

export function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current query filters
  const page = searchParams.get('page') || '1';
  const sort = searchParams.get('sort') || 'featured';
  const brand = searchParams.get('brand') || '';
  const search = searchParams.get('search') || '';
  const inStock = searchParams.get('in_stock') === '1';
  const onSale = searchParams.get('on_sale') === '1';
  const featured = searchParams.get('featured') === '1';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  // Fetch brands and categories once
  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const [bRes, cRes] = await Promise.all([api.get('/brands'), api.get('/categories')]);
        setBrands(bRes.data.data || []);
        setCategories(cRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadTaxonomies();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        if (!params.has('per_page')) params.set('per_page', '12');

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.data || []);
        setMeta(data.meta || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key: string, val: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!val) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    next.set('page', '1'); // reset page on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount =
    (brand ? 1 : 0) +
    (search ? 1 : 0) +
    (inStock ? 1 : 0) +
    (onSale ? 1 : 0) +
    (featured ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  return (
    <div className="container-page py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {brand ? `${brands.find((b) => b.slug === brand)?.name || 'Brand'} Phones` : 'Smartphone Catalog'}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {meta ? `Showing ${meta.total} devices available for immediate delivery.` : 'Browse our premium mobile catalogue.'}
          </p>
        </div>

        {/* Sort & Mobile trigger */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="md:hidden flex items-center gap-2"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline">
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-xs outline-none focus:border-zinc-900"
            >
              <option value="featured">Featured First</option>
              <option value="best_selling">Bestsellers</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="highest_rated">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Brands list */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Brand
            </h4>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('brand', null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition ${
                  !brand ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateParam('brand', b.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition flex items-center justify-between ${
                    brand === b.slug
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <span>{b.name}</span>
                  {b.products_count !== undefined && (
                    <span className="text-xs opacity-60">{b.products_count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick toggles */}
          <div className="space-y-2 pt-4 border-t border-zinc-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Availability & Deals
            </h4>
            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateParam('in_stock', e.target.checked ? '1' : null)}
                className="rounded border-zinc-300 accent-zinc-900 h-4 w-4"
              />
              In Stock Only
            </label>
            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => updateParam('on_sale', e.target.checked ? '1' : null)}
                className="rounded border-zinc-300 accent-zinc-900 h-4 w-4"
              />
              Special Offers & Sales
            </label>
            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => updateParam('featured', e.target.checked ? '1' : null)}
                className="rounded border-zinc-300 accent-zinc-900 h-4 w-4"
              />
              Flagships Only
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3 space-y-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 rounded-3xl border border-zinc-200 bg-zinc-50/50">
              <h3 className="text-base font-semibold text-zinc-900">No phones match your criteria</h3>
              <p className="mt-1 text-sm text-zinc-500">Try loosening your search filters or browse other brands.</p>
              <Button onClick={clearAllFilters} variant="outline" className="mt-4">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {meta && (
                <div className="pt-8 border-t border-zinc-100 flex justify-center">
                  <Pagination
                    meta={meta}
                    onPage={(newPage) => updateParam('page', String(newPage))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

