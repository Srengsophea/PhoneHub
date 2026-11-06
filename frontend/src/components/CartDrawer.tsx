import { Drawer, Button } from './ui';
import { useCart } from '@/stores/cart';
import { formatPrice, productImage } from '@/lib/format';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const navigate = useNavigate();
  const { cart, open, setOpen, update, remove, loading } = useCart();

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-zinc-900" />
          <span>Shopping Cart ({cart.items.length})</span>
        </div>
      }
      footer={
        cart.items.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900">{formatPrice(cart.subtotal)}</span>
              </div>
              {Number(cart.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span className="font-medium text-zinc-900">
                  {Number(cart.shipping_fee) === 0 ? 'FREE' : formatPrice(cart.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-100 text-base font-bold text-zinc-900">
                <span>Total</span>
                <span>{formatPrice(cart.total_amount)}</span>
              </div>
            </div>

            <Button onClick={handleCheckout} className="w-full justify-between" size="lg">
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      }
    >
      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-4">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-zinc-500">Explore our latest flagship smartphones and accessories.</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setOpen(false);
              navigate('/products');
            }}
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {cart.items.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 items-center">
              <img
                src={productImage(item.product)}
                alt={item.product.name}
                className="h-16 w-16 rounded-xl object-contain bg-zinc-50 p-2 border border-zinc-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{item.product.name}</p>
                {item.variant && (
                  <p className="text-xs text-zinc-500">
                    {item.variant.ram} / {item.variant.storage} • {item.variant.color}
                  </p>
                )}
                <p className="text-sm font-bold text-zinc-900 mt-1">{formatPrice(item.unit_price)}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-zinc-200 rounded-lg">
                <button
                  onClick={() => update(item.id, item.quantity - 1)}
                  disabled={loading}
                  className="p-1 hover:bg-zinc-100 rounded-l-lg text-zinc-500"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs font-semibold text-zinc-900">{item.quantity}</span>
                <button
                  onClick={() => update(item.id, item.quantity + 1)}
                  disabled={loading}
                  className="p-1 hover:bg-zinc-100 rounded-r-lg text-zinc-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => remove(item.id)}
                disabled={loading}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

