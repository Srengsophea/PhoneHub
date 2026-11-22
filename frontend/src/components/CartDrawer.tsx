import { Drawer, Button } from './ui';
import { useCart } from '@/stores/cart';
import { formatPrice, productImage, cartItemPricing } from '@/lib/format';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const navigate = useNavigate();
  const { cart, open, setOpen, update, remove, pendingItemIds } = useCart();

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  const { originalSubtotal, productSavings } = cart.items.reduce(
    (acc, item) => {
      const p = cartItemPricing(item);
      acc.originalSubtotal += p.lineOriginal ?? p.lineTotal;
      acc.productSavings += p.lineSavings;
      return acc;
    },
    { originalSubtotal: 0, productSavings: 0 }
  );

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
              {productSavings > 0 && (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>Original Price</span>
                    <span className="text-zinc-400 line-through">{formatPrice(originalSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Product Discount</span>
                    <span>-{formatPrice(productSavings)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900">{formatPrice(cart.subtotal)}</span>
              </div>
              {Number(cart.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
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
          {cart.items.map((item) => {
            const itemBusy = pendingItemIds.includes(item.id);
            const priceInfo = cartItemPricing(item);
            const maxStock =
              item.variant?.stock != null
                ? Number(item.variant.stock)
                : item.product?.variants?.length
                ? Number(
                    (item.product.variants.find((v) => v.stock > 0) ?? item.product.variants[0])
                      .stock
                  )
                : null;
            const atMaxStock = maxStock !== null && item.quantity >= maxStock;
            return (
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
                      {[
                        [item.variant.ram, item.variant.storage].filter(Boolean).join(' / '),
                        item.variant.color,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  )}
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-950">
                      {formatPrice(priceInfo.lineTotal)}
                    </span>
                    {priceInfo.lineOriginal && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatPrice(priceInfo.lineOriginal)}
                      </span>
                    )}
                    {priceInfo.discountPct > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600">
                        -{priceInfo.discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.quantity > 1 && (
                      <p className="text-[11px] text-zinc-400">
                        {formatPrice(priceInfo.current)} each
                      </p>
                    )}
                    {atMaxStock && (
                      <p className="text-[11px] font-semibold text-amber-600">
                        Max stock ({maxStock})
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-zinc-200 rounded-lg select-none">
                  <button
                    type="button"
                    onClick={async () => {
                      if (item.quantity > 1 && !itemBusy) {
                        const res = await update(item.id, item.quantity - 1);
                        if (!res.ok && res.message) toast.error(res.message);
                      }
                    }}
                    disabled={itemBusy || item.quantity <= 1}
                    aria-label="Decrease quantity"
                    title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                    className={`p-1.5 rounded-l-lg text-zinc-600 transition ${
                      item.quantity <= 1
                        ? 'opacity-35 cursor-not-allowed'
                        : itemBusy
                        ? 'opacity-60 cursor-wait'
                        : 'cursor-pointer hover:bg-zinc-100 hover:text-zinc-950 active:scale-95'
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-2.5 text-xs font-semibold text-zinc-900 select-none min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!itemBusy && !atMaxStock) {
                        const res = await update(item.id, item.quantity + 1);
                        if (!res.ok && res.message) toast.error(res.message);
                      }
                    }}
                    disabled={itemBusy || atMaxStock}
                    aria-label="Increase quantity"
                    title={atMaxStock ? `Maximum stock reached (${maxStock} available)` : 'Increase quantity'}
                    className={`p-1.5 rounded-r-lg text-zinc-600 transition ${
                      atMaxStock
                        ? 'opacity-35 cursor-not-allowed'
                        : itemBusy
                        ? 'opacity-60 cursor-wait'
                        : 'cursor-pointer hover:bg-zinc-100 hover:text-zinc-950 active:scale-95'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!itemBusy) remove(item.id);
                  }}
                  disabled={itemBusy}
                  aria-label="Remove item"
                  title="Remove item"
                  className={`p-1.5 text-zinc-400 transition ${
                    itemBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:text-red-500'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}

