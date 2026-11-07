import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Scale,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
  Check,
} from 'lucide-react';
import api from '@/lib/api';
import { Button, Stars, Badge } from '@/components/ui';
import { formatPrice, productImage, imageUrl } from '@/lib/format';
import { useCart } from '@/stores/cart';
import { useWishlist } from '@/stores/wishlist';
import { useCompare } from '@/stores/compare';
import type { Product, ProductVariant, Specification, Review } from '@/types';
import toast from 'react-hot-toast';
import catalogData from '@/data/catalog.json';

const COLOR_MAP: Record<string, string> = {
  'natural titanium': '#9e968d',
  'black titanium': '#323234',
  'desert titanium': '#d4af8c',
  'white titanium': '#f2f1ed',
  'titanium gray': '#78716c',
  'titanium silver': '#cbd5e1',
  'titanium black': '#0f172a',
  'space black': '#1c1917',
  silver: '#e2e8f0',
  gold: '#f5d061',
  ultramarine: '#3b5998',
  teal: '#0d9488',
  pink: '#fbcfe8',
  black: '#18181b',
  white: '#f8fafc',
  midnight: '#0f172a',
  starlight: '#f1f5f9',
  blue: '#2563eb',
  green: '#16a34a',
  red: '#dc2626',
  yellow: '#eab308',
  purple: '#9333ea',
  orange: '#ea580c',
  'emerald green': '#059669',
  'phantom black': '#18181b',
  cream: '#fef3c7',
  lavender: '#e9d5ff',
};

function getColorHex(colorName?: string | null, hexFallback?: string | null): string {
  if (hexFallback && hexFallback.startsWith('#')) return hexFallback;
  if (!colorName) return '#94a3b8';
  const clean = colorName.toLowerCase().trim();
  return COLOR_MAP[clean] || '#94a3b8';
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const { add: addToCart, loading: cartLoading } = useCart();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { toggle: toggleCompare, has: inCompare } = useCompare();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        let p: Product | undefined = data?.data;
        if (!p || typeof p !== 'object' || !p.name) {
          const fallback = (catalogData.products as unknown as Product[]).find((it) => it.slug === slug);
          if (fallback) p = fallback;
        }
        if (p) {
          setProduct(p);
          if (p.variants && p.variants.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
          setSelectedImage(productImage(p));
        }
      } catch (err) {
        console.error(err);
        const fallback = (catalogData.products as unknown as Product[]).find((it) => it.slug === slug);
        if (fallback) {
          setProduct(fallback);
          if (fallback.variants && fallback.variants.length > 0) {
            setSelectedVariant(fallback.variants[0]);
          }
          setSelectedImage(productImage(fallback));
        }
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Product Not Found</h2>
        <p className="mt-2 text-zinc-500">The requested phone could not be found or is inactive.</p>
        <Link to="/products">
          <Button className="mt-6">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? selectedVariant.sale_price ?? selectedVariant.price
    : product.sale_price ?? product.base_price;

  const originalPrice = selectedVariant
    ? selectedVariant.sale_price ? selectedVariant.price : null
    : product.sale_price ? product.base_price : null;

  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;

  // Extract separate unique storage capacities and colors
  const storages = Array.from(
    new Set((product.variants || []).map((v) => v.storage).filter(Boolean))
  ) as string[];

  const colors = (product.variants || []).reduce((acc, v) => {
    const colorName = v.color;
    if (colorName && !acc.some((c) => c.name.toLowerCase() === colorName.toLowerCase())) {
      acc.push({
        name: colorName,
        hex: getColorHex(colorName, v.color_hex),
      });
    }
    return acc;
  }, [] as { name: string; hex: string }[]);

  const handleStorageSelect = (storage: string) => {
    if (!product?.variants) return;
    const currentColor = selectedVariant?.color;
    // Prefer variant matching both current color and new storage
    let target = product.variants.find(
      (v) => v.storage === storage && v.color?.toLowerCase() === currentColor?.toLowerCase()
    );
    if (!target) {
      target = product.variants.find((v) => v.storage === storage);
    }
    if (target) {
      setSelectedVariant(target);
    }
  };

  const handleColorSelect = (colorName: string) => {
    if (!product?.variants) return;
    const currentStorage = selectedVariant?.storage;
    // Prefer variant matching both current storage and new color
    let target = product.variants.find(
      (v) => v.color?.toLowerCase() === colorName.toLowerCase() && v.storage === currentStorage
    );
    if (!target) {
      target = product.variants.find((v) => v.color?.toLowerCase() === colorName.toLowerCase());
    }
    if (target) {
      setSelectedVariant(target);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setBuyingNow(true);
    try {
      const res = await addToCart(product.id, selectedVariant?.id, quantity);
      if (res.ok) {
        navigate('/checkout');
      } else {
        toast.error(res.message || 'Could not proceed to checkout');
      }
    } catch {
      toast.error('Could not proceed to checkout');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleAddToCart = async () => {
    const res = await addToCart(product.id, selectedVariant?.id, quantity);
    if (res.ok) {
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.error(res.message || 'Could not add to cart');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please fill out all review fields.');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Thank you! Your review has been submitted.');
      setReviewTitle('');
      setReviewComment('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container-page py-8 space-y-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link to="/" className="hover:text-zinc-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/products" className="hover:text-zinc-700">Phones</Link>
        {product.brand && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/products?brand=${product.brand.slug}`} className="hover:text-zinc-700">
              {product.brand.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Showcase (Gallery + Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-3xl border border-zinc-200/80 bg-white p-8 flex items-center justify-center overflow-hidden">
            <img
              src={selectedImage || productImage(product)}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(imageUrl(img.image_path))}
                  className={`h-20 w-20 shrink-0 rounded-2xl border p-2 bg-white transition ${
                    selectedImage === imageUrl(img.image_path)
                      ? 'border-zinc-900 ring-2 ring-zinc-900/10'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img
                    src={imageUrl(img.image_path)}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy Box */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {product.brand.name}
              </span>
            )}
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="mt-3 flex items-center gap-3">
              <Stars value={Number(product.rating_cache || 5)} size="sm" />
              <span className="text-sm font-semibold text-zinc-800">
                {Number(product.rating_cache || 5).toFixed(1)}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-sm text-zinc-500">{product.reviews_count || 0} reviews</span>
              <span className="text-zinc-300">•</span>
              <Badge tone={inStock ? 'success' : 'danger'}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y border-zinc-100 py-4">
            <span className="text-3xl font-extrabold text-zinc-950">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-sm text-zinc-600 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Separate Selectors: Space (Storage) & Color */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-5 pt-1">
              {/* 1. Storage / Space Capacity Selection */}
              {storages.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-zinc-900">
                    <span>Space (Storage):</span>
                    <span className="text-zinc-500 font-medium normal-case tracking-normal">
                      {selectedVariant?.storage || storages[0]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {storages.map((storage) => {
                      const isSelected = selectedVariant?.storage === storage;
                      const variantForStorage = product.variants?.find((v) => v.storage === storage);
                      return (
                        <button
                          key={storage}
                          type="button"
                          onClick={() => handleStorageSelect(storage)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'border-2 border-zinc-950 bg-zinc-50/70 shadow-xs ring-1 ring-zinc-950/5'
                              : 'border border-zinc-200/90 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-zinc-950 tracking-tight">{storage}</span>
                            {isSelected && (
                              <span className="h-4 w-4 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          {variantForStorage?.ram && (
                            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                              {variantForStorage.ram} RAM
                            </p>
                          )}
                          {variantForStorage && (
                            <p className="text-xs font-bold text-zinc-900 mt-1.5">
                              {formatPrice(variantForStorage.sale_price ?? variantForStorage.price)}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-zinc-900">
                    <span>Color:</span>
                    <span className="text-zinc-500 font-medium normal-case tracking-normal">
                      {selectedVariant?.color || colors[0]?.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => {
                      const isSelected =
                        selectedVariant?.color?.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleColorSelect(c.name)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
                            isSelected
                              ? 'border-2 border-zinc-950 bg-zinc-50/80 text-zinc-950 font-bold shadow-xs'
                              : 'border border-zinc-200/90 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/60'
                          }`}
                        >
                          {/* Color Swatch Circle */}
                          <span
                            className="h-4 w-4 rounded-full border border-black/15 shadow-xs shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-xs">{c.name}</span>
                          {isSelected && <Check className="h-3 w-3 text-zinc-950 stroke-[3] ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions: Quantity + Add to Cart + Buy Now + Wishlist + Compare */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Qty Selector */}
              <div className="flex items-center border border-zinc-200 rounded-2xl h-12 px-3.5 w-full sm:w-auto justify-between sm:justify-start bg-zinc-50/50">
                <span className="text-xs font-bold text-zinc-400 mr-3">Qty:</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 font-bold text-zinc-600 hover:text-zinc-950 transition text-base"
                >
                  -
                </button>
                <span className="px-3 font-bold text-sm text-zinc-950">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 font-bold text-zinc-600 hover:text-zinc-950 transition text-base"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading || buyingNow}
                size="lg"
                className="w-full sm:flex-1 h-12 gap-2 font-bold border-zinc-300 hover:bg-zinc-100 text-zinc-900"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </Button>

              {/* Buy Now Button */}
              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock || cartLoading || buyingNow}
                size="lg"
                className="w-full sm:flex-1 h-12 gap-2 font-extrabold bg-zinc-950 hover:bg-zinc-800 text-white shadow-lg transition-transform active:scale-98"
              >
                {buyingNow ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                )}
                <span>Buy Now</span>
              </Button>

              {/* Wishlist & Compare Buttons */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition shrink-0 ${
                    inWishlist(product.id)
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`h-5 w-5 ${inWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => toggleCompare(product)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition shrink-0 ${
                    inCompare(product.id)
                      ? 'border-brand-200 bg-brand-50 text-brand-600'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                  title="Compare"
                >
                  <Scale className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Warranty & Guarantees */}
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-2.5 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{product.warranty_info || '1-Year Official Manufacturer Warranty Included'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-zinc-600" />
              <span>Free express shipping on all orders over $500</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-zinc-600" />
              <span>14-day hassle-free replacement guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specifications && (
        <div className="border-t border-zinc-200 pt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {Array.isArray(product.specifications) ? (
              product.specifications.map((spec: Specification, idx: number) => (
                <div key={idx} className="flex justify-between py-2.5 border-b border-zinc-100 text-sm">
                  <span className="font-medium text-zinc-500">{spec.name}</span>
                  <span className="font-semibold text-zinc-900 text-right">{spec.value}</span>
                </div>
              ))
            ) : (
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2.5 border-b border-zinc-100 text-sm">
                  <span className="font-medium text-zinc-500">{key}</span>
                  <span className="font-semibold text-zinc-900 text-right">{String(val)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reviews & Write Review Section */}
      <div className="border-t border-zinc-200 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Customer Reviews
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Verified reviews from genuine purchasers.
            </p>
          </div>
        </div>

        {/* Existing reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-zinc-200/80 p-5 space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <Stars value={rev.rating} size="xs" />
                  <span className="text-xs text-zinc-400">Verified Buyer</span>
                </div>
                <h4 className="font-semibold text-sm text-zinc-900">{rev.title}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                <p className="text-[11px] font-medium text-zinc-400 pt-2">
                  — {rev.user?.name || 'Customer'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 col-span-2">No reviews yet. Be the first to leave one!</p>
          )}
        </div>

        {/* Submit Review Box */}
        <form onSubmit={handleReviewSubmit} className="rounded-3xl border border-zinc-200 bg-zinc-50/50 p-6 space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-zinc-900">Write a Review</h3>

          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-amber-500"
                >
                  <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-current' : 'text-zinc-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Headline</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Unbelievable camera and battery!"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-600 block mb-1">Review Details</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your thoughts about this phone..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
              required
            />
          </div>

          <Button type="submit" loading={submittingReview}>
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
}

