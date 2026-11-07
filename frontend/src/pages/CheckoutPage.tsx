import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, CreditCard, Banknote, QrCode } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { Button, Input } from '@/components/ui';
import { formatPrice, productImage, toNumber } from '@/lib/format';
import api, { getErrorMessage } from '@/lib/api';
import { KHQRModal } from '@/components/KHQRModal';
import { generateKHQR, type GeneratedKHQR, BAKONG_ACCOUNT_ID, MERCHANT_NAME } from '@/lib/khqr';
import { saveLocalOrder, updateLocalOrderStatus } from '@/lib/orders';
import toast from 'react-hot-toast';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clear: clearCart, setOpen: setCartOpen } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    // Ensure the shopping cart drawer is always closed on the checkout page
    setCartOpen(false);
  }, [setCartOpen]);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'khqr' | 'cod' | 'stripe'>('khqr');
  const [couponInput, setCouponInput] = useState('');
  const [khqrModalOpen, setKhqrModalOpen] = useState(false);
  const [khqrData, setKhqrData] = useState<GeneratedKHQR | null>(null);
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);
  const { applyCoupon, removeCoupon } = useCart();

  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Cambodia',
    customer_notes: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  if (cart.items.length === 0 && !pendingOrder) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Your cart is empty</h2>
        <p className="mt-2 text-zinc-500">Add some devices to your cart before proceeding to checkout.</p>
        <Link to="/products">
          <Button className="mt-6">Explore Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    if (res.ok) {
      toast.success('Coupon discount applied!');
      setCouponInput('');
    } else {
      toast.error(res.message || 'Could not apply coupon');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address_line_1) {
      toast.error('Please complete all required shipping fields.');
      return;
    }

    setLoading(true);
    try {
      const payloadItems = cart.items.map((it) => ({
        product_id: it.product_id,
        variant_id: it.variant_id || null,
        quantity: it.quantity,
      }));

      const { data } = await api.post('/checkout', {
        shipping_address: {
          full_name: formData.full_name,
          phone: formData.phone,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city || 'Phnom Penh',
          province: formData.province || 'Phnom Penh',
          country: formData.country,
        },
        payment_method: paymentMethod,
        customer_notes: formData.customer_notes,
        items: payloadItems,
      });

      const order = data?.data?.order || data?.data?.data?.order || data?.data || {};
      const orderNumber =
        order?.order_number || ('PH-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
      const fullOrder = { ...order, order_number: orderNumber };
      saveLocalOrder(fullOrder);

      if (paymentMethod === 'khqr') {
        const qr = await generateKHQR(toNumber(cart.total_amount), orderNumber);
        setKhqrData(qr);
        setPendingOrder(fullOrder);
        setKhqrModalOpen(true);
      } else {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/track/${orderNumber}`);
      }
    } catch (err: any) {
      console.error('Checkout error detail:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKHQRSuccess = async () => {
    if (pendingOrder) {
      updateLocalOrderStatus(pendingOrder.order_number, 'pending', 'paid');
    }
    await clearCart();
    setKhqrModalOpen(false);
    const targetNum = pendingOrder?.order_number || 'PH-2026-000001';
    navigate(`/orders/track/${targetNum}`);
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Shipping and Payment Forms */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-8">
          {/* Shipping Details */}
          <div className="rounded-3xl border border-zinc-200/80 p-6 space-y-4 bg-white">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-brand-600" />
              1. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label="Phone Number *"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+855 12 345 678"
              />
            </div>

            <Input
              label="Street Address / House No. *"
              required
              value={formData.address_line_1}
              onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
              placeholder="Building 12, St 2004"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City / Sangkat"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Phnom Penh"
              />
              <Input
                label="Province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="Phnom Penh"
              />
            </div>

            <Input
              label="Delivery Instructions (Optional)"
              value={formData.customer_notes}
              onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
              placeholder="Call before arrival or leave with security..."
            />
          </div>

          {/* Payment Method */}
          <div className="rounded-3xl border border-zinc-200/80 p-6 space-y-4 bg-white">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-600" />
                2. Payment Method
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-[#D32F2F]">
                Bakong KHQR Active
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bakong KHQR */}
              <div
                onClick={() => setPaymentMethod('khqr')}
                className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                  paymentMethod === 'khqr'
                    ? 'border-[#D32F2F] bg-red-50/50 shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black px-1.5 py-0.5 rounded bg-[#D32F2F] text-white">
                      KHQR
                    </span>
                    <span className="text-[11px] font-bold text-zinc-700">Bakong</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    Instant
                  </span>
                </div>
                <p className="text-sm font-bold text-zinc-950">Bakong KHQR</p>
                <p className="text-xs text-zinc-500 mt-0.5">ABA, Wing, ACLEDA & all banks</p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">To: {BAKONG_ACCOUNT_ID}</p>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Banknote className="h-5 w-5 mb-2" />
                <p className="text-sm font-bold">Cash on Delivery</p>
                <p className={`text-xs mt-0.5 ${paymentMethod === 'cod' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Pay upon receiving phone
                </p>
                <p className={`text-[10px] mt-1 ${paymentMethod === 'cod' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  Phnom Penh & Provinces
                </p>
              </div>

              {/* Credit Card */}
              <div
                onClick={() => setPaymentMethod('stripe')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'stripe'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mb-2" />
                <p className="text-sm font-bold">Credit / Debit Card</p>
                <p className={`text-xs mt-0.5 ${paymentMethod === 'stripe' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Visa, Mastercard, Amex
                </p>
                <p className={`text-[10px] mt-1 ${paymentMethod === 'stripe' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  International Cards
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full text-base bg-zinc-950 hover:bg-zinc-800">
            {paymentMethod === 'khqr' ? 'Proceed to KHQR Payment' : 'Complete Order'} ({formatPrice(cart.total_amount)})
          </Button>
        </form>

        {/* Order Summary Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/70 p-6 space-y-6">
            <h3 className="text-lg font-bold text-zinc-900">Order Summary</h3>

            {/* Cart Items List */}
            <div className="divide-y divide-zinc-200/60 max-h-64 overflow-y-auto pr-1">
              {cart.items.map((it) => (
                <div key={it.id} className="py-3 flex items-center gap-3">
                  <img
                    src={productImage(it.product)}
                    alt=""
                    className="h-12 w-12 rounded-xl object-contain bg-white p-1 border border-zinc-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{it.product.name}</p>
                    <p className="text-[11px] text-zinc-500">Qty: {it.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">
                    {formatPrice(it.unit_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon field */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code (e.g. WELCOME10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs uppercase font-medium outline-none focus:border-zinc-900"
              />
              <Button type="submit" variant="secondary" size="sm">
                Apply
              </Button>
            </form>

            {/* Price breakdown */}
            <div className="space-y-2 border-t border-zinc-200/60 pt-4 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900">{formatPrice(cart.subtotal)}</span>
              </div>

              {Number(cart.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Savings</span>
                  <span>-{formatPrice(cart.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Express Shipping</span>
                <span className="font-medium text-zinc-900">
                  {Number(cart.shipping_fee) === 0 ? 'FREE' : formatPrice(cart.shipping_fee)}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-zinc-200 text-lg font-extrabold text-zinc-950">
                <span>Total Due</span>
                <span>{formatPrice(cart.total_amount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted & Protected Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Bakong KHQR Payment Modal */}
      <KHQRModal
        isOpen={khqrModalOpen}
        onClose={() => setKhqrModalOpen(false)}
        onSuccess={handleKHQRSuccess}
        khqrData={khqrData}
      />
    </div>
  );
}

