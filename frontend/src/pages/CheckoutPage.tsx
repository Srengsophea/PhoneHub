import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, CreditCard, Banknote, QrCode, MapPin, CheckCircle2, UserCheck, Sparkles, Mail, User, Phone } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { Button, Input } from '@/components/ui';
import { formatPrice, productImage, toNumber } from '@/lib/format';
import api, { getErrorMessage } from '@/lib/api';
import { KHQRModal } from '@/components/KHQRModal';
import { generateKHQR, type GeneratedKHQR, BAKONG_ACCOUNT_ID, MERCHANT_NAME } from '@/lib/khqr';
import { saveLocalOrder, updateLocalOrderStatus } from '@/lib/orders';
import { fetchUserAddresses } from '@/lib/addresses';
import type { Address } from '@/types';
import toast from 'react-hot-toast';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clear: clearCart, setOpen: setCartOpen } = useCart();
  const { user, openAuthModal } = useAuth();

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

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address_line_1: '',
    address_line_2: '',
    city: 'Phnom Penh',
    province: 'Phnom Penh',
    postal_code: '',
    country: 'Cambodia',
    customer_notes: '',
  });

  useEffect(() => {
    async function loadAddr() {
      if (!user) return;
      const list = await fetchUserAddresses();
      setSavedAddresses(list);
      const defaultAddr = list.find((a: Address) => a.is_default) || list[0];
      if (defaultAddr) {
        setFormData((prev) => ({
          ...prev,
          full_name: defaultAddr.full_name || prev.full_name,
          phone: defaultAddr.phone || prev.phone,
          email: user.email || prev.email,
          address_line_1: defaultAddr.address_line_1 || prev.address_line_1,
          address_line_2: defaultAddr.address_line_2 || prev.address_line_2,
          city: defaultAddr.city || prev.city,
          province: defaultAddr.province || prev.province,
        }));
      } else if (user) {
        setFormData((prev) => ({
          ...prev,
          full_name: prev.full_name || user.name || '',
          phone: prev.phone || user.phone || '',
          email: prev.email || user.email || '',
        }));
      }
    }
    loadAddr();
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
    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.address_line_1.trim()) {
      toast.error('Please enter your full name, phone number, email address, and shipping address.');
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
          email: formData.email,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city || 'Phnom Penh',
          province: formData.province || 'Phnom Penh',
          country: formData.country,
        },
        guest_email: formData.email,
        guest_name: formData.full_name,
        guest_phone: formData.phone,
        payment_method: paymentMethod,
        customer_notes: formData.customer_notes,
        items: payloadItems,
      });

      const order = data?.data?.order || data?.data?.data?.order || data?.data || {};
      const orderNumber =
        order?.order_number || ('PH-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
      const fullOrder = {
        ...order,
        order_number: orderNumber,
        user_id: user?.id ?? order?.user_id,
        user: user || order?.user || { name: formData.full_name, email: formData.email, phone: formData.phone },
        customer_email: formData.email || user?.email,
        customer_name: formData.full_name || user?.name,
        shipping_address: {
          ...formData,
        },
        shipping_address_snapshot: {
          ...formData,
        },
      };
      saveLocalOrder(fullOrder, user);

      if (paymentMethod === 'khqr') {
        const qr = await generateKHQR(toNumber(cart.total_amount), orderNumber);
        setKhqrData(qr);
        setPendingOrder(fullOrder);
        setKhqrModalOpen(true);
      } else {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/track/${orderNumber}?success=1`);
      }
    } catch (err: any) {
      console.error('Checkout error detail:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseKHQRModal = async () => {
    setKhqrModalOpen(false);
    if (pendingOrder) {
      await clearCart();
      toast('Order created! Payment is pending verification.', { icon: 'ℹ️' });
      navigate(`/orders/track/${pendingOrder.order_number}?new=1`);
    }
  };

  const handleKHQRSuccess = async () => {
    if (pendingOrder) {
      updateLocalOrderStatus(pendingOrder.order_number, 'confirmed', 'paid');
    }
    await clearCart();
    setKhqrModalOpen(false);
    const targetNum = pendingOrder?.order_number || 'PH-2026-000001';
    navigate(`/orders/track/${targetNum}?success=1`);
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Complete your order with official manufacturer warranty and instant tax invoice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Shipping and Payment Forms */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          {/* Checkout Options for Guests vs Existing Accounts */}
          {!user ? (
            <div className="rounded-xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Checkout Selection</span>
                <span className="text-xs font-semibold text-emerald-600">Guest Checkout Enabled</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option 1: Account Login / Register */}
                <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 transition flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Option 1
                    </span>
                    <h3 className="font-extrabold text-sm text-zinc-950 pt-0.5">Have an Account?</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Sign in to use your saved addresses and sync orders to your profile.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => openAuthModal('login', 'Sign in to access your saved addresses and orders.')}
                      className="text-xs font-bold rounded-md bg-zinc-950 text-white hover:bg-zinc-800"
                    >
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openAuthModal('register', 'Register an account to track your orders.')}
                      className="text-xs font-bold rounded-md border-zinc-300 hover:bg-white"
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>

                {/* Option 2: Guest Checkout */}
                <div className="p-4 rounded-lg border-2 border-zinc-900 bg-white shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                      Option 2 (Selected)
                    </span>
                    <h3 className="font-extrabold text-sm text-zinc-950 pt-0.5">Instant Guest Checkout</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      No account needed. Fill in your real name, phone, and email below to place your order and receive your downloadable invoice.
                    </p>
                  </div>
                  <div className="pt-1 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Enter information below</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Signed in as {user.name}</p>
                  <p className="text-[11px] text-zinc-500">{user.email}</p>
                </div>
              </div>
              <Link to="/profile" className="text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:underline">
                Manage Profile
              </Link>
            </div>
          )}

          {/* Customer & Shipping Details */}
          <div className="rounded-md border border-zinc-200/90 p-6 space-y-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Truck className="h-5 w-5 text-zinc-900" />
                1. Customer & Delivery Information
              </h2>
              {user && (
                <Link to="/profile" className="text-xs font-bold text-brand-600 hover:underline">
                  Manage Addresses
                </Link>
              )}
            </div>

            {/* Quick Pick from Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-1.5 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Select From Saved Addresses:
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          full_name: a.full_name,
                          phone: a.phone,
                          address_line_1: a.address_line_1,
                          address_line_2: a.address_line_2 || '',
                          city: a.city || 'Phnom Penh',
                          province: a.province || 'Phnom Penh',
                        }));
                        toast.success(`Loaded ${a.full_name}'s address`);
                      }}
                      className="px-3 py-1.5 rounded-md text-xs font-bold border border-zinc-200 hover:border-zinc-950 bg-zinc-50 hover:bg-white transition text-zinc-800"
                    >
                      {a.full_name} ({a.address_line_1.slice(0, 18)}...) {a.is_default ? '★' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Real Name *"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Sok Chea"
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
              label="Email Address (for Invoice & Receipt) *"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sokchea@example.com"
            />

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
              placeholder="Call before arrival or leave with reception..."
            />
          </div>

          {/* Payment Method */}
          <div className="rounded-md border border-zinc-200/90 p-6 space-y-4 bg-white shadow-2xs">
            <h2 className="text-base font-bold text-zinc-950 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-zinc-900" />
                2. Select Payment Method
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm text-red-600 bg-red-50 border border-red-200">
                Bakong KHQR Active
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bakong KHQR */}
              <div
                onClick={() => setPaymentMethod('khqr')}
                className={`p-4 rounded-md border cursor-pointer transition relative ${
                  paymentMethod === 'khqr'
                    ? 'border-2 border-[#E12326] bg-red-50/30 shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <QrCode className="h-5 w-5 text-[#E12326]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E12326] bg-[#E12326]/10 px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-sm font-bold text-zinc-950">NBC Bakong KHQR</p>
                <p className="text-xs text-zinc-500 mt-0.5">ABA, ACLEDA, Sathapana, Wing</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-1">Instant Auto-Confirmation</p>
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-md border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-2 border-zinc-950 bg-zinc-950 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Banknote className="h-5 w-5 mb-2" />
                <p className="text-sm font-bold">Cash on Delivery (COD)</p>
                <p className={`text-xs mt-0.5 ${paymentMethod === 'cod' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Pay upon package arrival
                </p>
                <p className={`text-[10px] mt-1 ${paymentMethod === 'cod' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  All 25 Provinces
                </p>
              </div>

              {/* Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod('stripe')}
                className={`p-4 rounded-md border cursor-pointer transition ${
                  paymentMethod === 'stripe'
                    ? 'border-2 border-zinc-950 bg-zinc-950 text-white shadow-xs'
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

          <Button type="submit" loading={loading} size="lg" className="w-full text-base bg-zinc-950 hover:bg-zinc-800 rounded-md font-bold">
            {paymentMethod === 'khqr' ? 'Proceed to KHQR Payment' : 'Complete Order'} ({formatPrice(cart.total_amount)})
          </Button>
        </form>

        {/* Order Summary Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-md border border-zinc-200/90 bg-zinc-50/70 p-6 space-y-6 shadow-2xs">
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
        onClose={handleCloseKHQRModal}
        onSuccess={handleKHQRSuccess}
        khqrData={khqrData}
        order={pendingOrder}
      />
    </div>
  );
}
