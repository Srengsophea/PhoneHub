import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { BrandLogo } from '@/components/BrandLogo';
import type { Brand } from '@/types';
import { Loader2, ArrowRight } from 'lucide-react';
import catalogData from '@/data/catalog.json';

export function BrandsPage() {
  const allBrands = (catalogData.brands as unknown as Brand[]) || [];
  const [brands, setBrands] = useState<Brand[]>(() => allBrands);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const { data } = await api.get('/brands');
        if (Array.isArray(data.data) && data.data.length > 0) {
          setBrands(data.data);
        }
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
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((b) => (
          <Link
            key={b.id}
            to={`/products?brand=${b.slug}`}
            className="group flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-zinc-950 hover:shadow-lift transition-all duration-300"
          >
            <div>
              <BrandLogo
                name={b.name}
                slug={b.slug}
                className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="text-lg font-bold text-zinc-900 group-hover:text-brand-600 transition">
                {b.name}
              </h3>
              {b.description && (
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                  {b.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 text-xs font-semibold text-zinc-700">
              <span>{b.products_count ?? 0} Models Available</span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
