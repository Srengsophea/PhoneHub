import { Link } from 'react-router-dom';
import { Heart, Scale, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, productImage, productPricing } from '@/lib/format';
import { useWishlist } from '@/stores/wishlist';
import { useCompare } from '@/stores/compare';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function ProductCard({ product }: { product: Product }) {
  const { user, openAuthModal } = useAuth();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { toggle: toggleCompare, has: inCompare } = useCompare();
  const { add: addToCart, loading: cartLoading } = useCart();
  const [adding, setAdding] = useState(false);

  const pricing = productPricing(product);
  const isWishlisted = inWishlist(product.id);
  const isCompared = inCompare(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    const res = await addToCart(product.id);
    setAdding(false);
    if (res.ok) {
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.error(res.message || 'Could not add to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowIn = await toggleWishlist(product.id, product);
    toast.success(nowIn ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleCompare(product);
    if (!res.ok) {
      toast.error(res.message || 'Cannot add to compare');
    } else {
      toast.success(isCompared ? 'Removed from comparison' : 'Added to comparison');
    }
  };

  return (
    <div className="group relative flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:shadow-lg hover:border-zinc-300 transition-all duration-300">
      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        {pricing.discountPct > 0 && (
          <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            Save {pricing.discountPct}%
          </span>
        )}
        {product.is_bestseller && (
          <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            Bestseller
          </span>
        )}
      </div>

      {/* Floating Wishlist & Compare triggers */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleWishlist}
          className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition backdrop-blur-md ${
            isWishlisted
              ? 'border-red-200 bg-red-50 text-red-500'
              : 'border-zinc-200/80 bg-white/95 text-zinc-400 hover:text-zinc-900 hover:bg-white'
          }`}
          title="Wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleCompare}
          className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition backdrop-blur-md ${
            isCompared
              ? 'border-brand-200 bg-brand-50 text-brand-600'
              : 'border-zinc-200/80 bg-white/95 text-zinc-400 hover:text-zinc-900 hover:bg-white'
          }`}
          title="Compare specifications"
        >
          <Scale className="h-4 w-4" />
        </button>
      </div>

      {/* Product Image Stage - Seamless & Borderless, phone floats directly on the card */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block h-72 sm:h-80 w-full overflow-hidden flex items-center justify-center pt-2"
      >
        <img
          src={productImage(product)}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-106"
          loading="lazy"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-2 pt-3.5">
        <div className="flex items-center justify-between">
          {product.brand && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              {product.brand.name}
            </span>
          )}
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-zinc-800">{Number(product.rating_cache || 5).toFixed(1)}</span>
            <span className="text-zinc-300">({product.reviews_count || 0})</span>
          </div>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="mt-1 text-[15px] font-semibold text-zinc-900 line-clamp-1 hover:text-brand-600 transition"
        >
          {product.name}
        </Link>

        {product.variants && product.variants.length > 0 && (
          <p className="text-xs text-zinc-400 mt-0.5">
            {product.variants.length} storage options available
          </p>
        )}

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-zinc-950">
                {formatPrice(pricing.current)}
              </span>
              {pricing.original && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(pricing.original)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || cartLoading}
            className="flex h-10 px-3.5 items-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-brand-600 transition active:scale-95 disabled:opacity-50 text-xs font-semibold shadow-xs"
            title="Add to Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
