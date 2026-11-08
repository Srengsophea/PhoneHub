import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/stores/wishlist';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui';
import { Heart, Loader2 } from 'lucide-react';

export function WishlistPage() {
  const { items, loading, fetch: fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="container-page py-12 space-y-8">
      <div className="pb-6 border-b border-zinc-200">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
          My Saved Phones
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Keep track of your dream flagships and receive updates when prices drop.
        </p>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-zinc-200 bg-zinc-50/50">
          <Heart className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
          <h3 className="text-lg font-bold text-zinc-900">Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
            Browse our catalogue and click the heart icon on any smartphone to save it here.
          </p>
          <Link to="/products">
            <Button className="mt-6">Explore Flagships</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <ProductCard key={it.id || it.product_id} product={it.product} />
          ))}
        </div>
      )}
    </div>
  );
}

