import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import type { Brand } from '@/types';
import { ArrowRight } from 'lucide-react';

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="container-page py-12 space-y-10 animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
          <div className="h-8 w-64 rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-28 rounded-md border border-zinc-200 bg-white p-5 space-y-2">
              <div className="h-8 w-20 rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
              <div className="h-4 w-32 rounded bg-zinc-100 overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Official Partners</span>
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">Authorized Manufacturers</h1>
        <p className="mt-1 text-sm text-zinc-500">Official flagship devices directly from trusted mobile giants with factory warranty.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {brands.map((b) => (
          <Link
            key={b.id}
            to={`/products?brand=${b.slug}`}
            className="group flex flex-col justify-between p-5 rounded-md border border-zinc-200 bg-white hover:border-zinc-950 hover:bg-zinc-50/50 hover:shadow-xs transition-all duration-200"
          >
            <div>
              <div className="h-10 flex items-center justify-start mb-3 transition-transform duration-200 group-hover:scale-105 origin-left">
                <BrandLogo
                  name={b.name}
                  slug={b.slug}
                  className="h-7 w-auto"
                />
              </div>
              <h3 className="text-base font-bold text-zinc-900 group-hover:text-zinc-950 transition">
                {b.name}
              </h3>
              {b.description && (
                <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {b.description}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-700">
              <span>{b.products_count ?? 0} Models Available</span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-950 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
