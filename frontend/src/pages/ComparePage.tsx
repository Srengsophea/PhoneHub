import { Link } from 'react-router-dom';
import { useCompare } from '@/stores/compare';
import { Button } from '@/components/ui';
import { formatPrice, productImage } from '@/lib/format';
import { Trash2, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/stores/cart';
import toast from 'react-hot-toast';

export function ComparePage() {
  const { items, remove, clear } = useCompare();
  const { add: addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">No phones in comparison</h2>
        <p className="mt-2 text-zinc-500">Add up to 4 devices from the catalog to compare specs side by side.</p>
        <Link to="/products">
          <Button className="mt-6">Browse Phones</Button>
        </Link>
      </div>
    );
  }

  const handleAddCart = async (productId: number, name: string) => {
    const res = await addToCart(productId);
    if (res.ok) toast.success(`Added ${name} to cart`);
    else toast.error(res.message || 'Could not add to cart');
  };

  return (
    <div className="container-page py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
            Compare Devices
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Comparing {items.length} smartphones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clear}>
            Clear All
          </Button>
          <Link to="/products">
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4 mr-1" /> Add Phone
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto pb-6">
        <div className="grid grid-cols-4 gap-6 min-w-[800px]">
          {items.map((phone) => (
            <div key={phone.id} className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-soft">
              <div className="relative aspect-square w-full rounded-2xl bg-zinc-50 p-4 flex items-center justify-center">
                <button
                  onClick={() => remove(phone.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-red-500"
                  title="Remove from compare"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <img src={productImage(phone)} alt={phone.name} className="h-full w-full object-contain" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {phone.brand?.name}
                </span>
                <h3 className="font-bold text-sm text-zinc-900 mt-0.5 line-clamp-1">{phone.name}</h3>
                <p className="text-base font-extrabold text-zinc-950 mt-2">
                  {formatPrice(phone.sale_price ?? phone.base_price)}
                </p>
              </div>

              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={() => handleAddCart(phone.id, phone.name)}
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </Button>

              {/* Specs comparison */}
              <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-500">Rating</span>
                  <span className="font-semibold text-zinc-900">{phone.rating_cache || 5.0} ★</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-500">Warranty</span>
                  <span className="font-semibold text-zinc-900">{phone.warranty_info || '1 Year'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-500">Variants</span>
                  <span className="font-semibold text-zinc-900">{phone.variants?.length || 1} available</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

