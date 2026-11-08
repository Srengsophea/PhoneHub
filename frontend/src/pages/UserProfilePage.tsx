import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/stores/auth';
import { Button, Input, Badge } from '@/components/ui';
import {
  User,
  Package,
  MapPin,
  Key,
  LogOut,
  Printer,
  Truck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Phone,
  Copy,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel, productImage } from '@/lib/format';
import {
  fetchUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/addresses';
import { InvoiceModal } from '@/components/InvoiceModal';
import { updateLocalOrderStatus } from '@/lib/orders';
import type { Order, Address } from '@/types';
import toast from 'react-hot-toast';

export function UserProfilePage() {
  const { user, logout, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'security'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    city: 'Phnom Penh',
    province: 'Phnom Penh',
    country: 'Cambodia',
    delivery_notes: '',
    is_default: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      openAuthModal('login', 'Please sign in to access your profile.');
      return;
    }
    setProfileName(user.name);
    setProfilePhone(user.phone || '');

    // Load Orders: fetch personal orders directly from backend API
    async function loadOrders() {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const { data } = await api.get('/orders');
        const apiOrders: Order[] = Array.isArray(data?.data) ? data.data : [];
        setOrders(apiOrders);
      } catch (err) {
        console.error('Failed to load orders from backend:', err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    }

    // Load Addresses
    async function loadAddresses() {
      setLoadingAddresses(true);
      try {
        const list = await fetchUserAddresses();
        setAddresses(list);
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadOrders();
    loadAddresses();
  }, [user]);

  const handleVerifyOrderPayment = async (orderNumber: string) => {
    setVerifyingOrder(orderNumber);
    try {
      const res = await api.post(`/orders/${encodeURIComponent(orderNumber)}/verify-payment`);
      if (res.data?.paid) {
        toast.success(`Order #${orderNumber} payment verified successfully!`);
        setOrders((prev) =>
          prev.map((o) =>
            o.order_number === orderNumber
              ? { ...o, payment_status: 'paid', status: 'confirmed' }
              : o
          )
        );
        updateLocalOrderStatus(orderNumber, 'confirmed', 'paid');
      } else {
        toast.error('Payment not detected yet in Bakong account. Please complete the transfer.');
      }
    } catch {
      toast.error('Unable to verify payment status right now.');
    } finally {
      setVerifyingOrder(null);
    }
  };

  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Please sign in</h2>
        <Button onClick={() => openAuthModal('login')} className="mt-4 rounded-md">
          Sign In
        </Button>
      </div>
    );
  }

  // Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/user/profile', { name: profileName, phone: profilePhone });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      full_name: user?.name || '',
      phone: user?.phone || '',
      address_line_1: '',
      city: 'Phnom Penh',
      province: 'Phnom Penh',
      country: 'Cambodia',
      delivery_notes: '',
      is_default: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line_1: addr.address_line_1,
      city: addr.city || 'Phnom Penh',
      province: addr.province || 'Phnom Penh',
      country: addr.country || 'Cambodia',
      delivery_notes: addr.delivery_notes || '',
      is_default: addr.is_default,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
        toast.success('Address updated successfully!');
      } else {
        await createAddress(addressForm as any);
        toast.success('Address added successfully!');
      }
      const updated = await fetchUserAddresses();
      setAddresses(updated);
      setAddressModalOpen(false);
    } catch {
      toast.error('Could not save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      const updated = await fetchUserAddresses();
      setAddresses(updated);
      toast.success('Address removed.');
    } catch {
      toast.error('Failed to remove address.');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await setDefaultAddress(id);
      const updated = await fetchUserAddresses();
      setAddresses(updated);
      toast.success('Default address updated.');
    } catch {
      toast.error('Failed to update default address.');
    }
  };

  const handleOpenInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  const copyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success(`Copied ${num} to clipboard`);
  };

  // Stats calculation
  const totalSpent = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const totalItemsCount = orders.reduce(
    (acc, o) => acc + (o.items?.reduce((n, i) => n + i.quantity, 0) || 1),
    0
  );

  return (
    <div className="container-page py-10 space-y-8 max-w-6xl">
      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-md border border-zinc-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            {/* User Avatar Initials */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white font-extrabold text-xl shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-zinc-950">{user.name}</h1>
                <span className="px-2 py-0.5 rounded-sm bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider border border-red-200">
                  PhoneHub Member
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {user.email} {user.phone ? `• ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/orders/track">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-md text-xs font-bold border-zinc-200">
                <Truck className="h-3.5 w-3.5" />
                <span>Track Order</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="gap-1.5 rounded-md text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Profile Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
              <Package className="h-4 w-4 text-zinc-700" />
            </div>
            <p className="text-2xl font-black text-zinc-950 mt-1">{orders.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Total orders placed</p>
          </div>

          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
              <DollarSign className="h-4 w-4 text-zinc-700" />
            </div>
            <p className="text-2xl font-black text-zinc-950 mt-1">{formatPrice(totalSpent)}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Lifetime verified spend</p>
          </div>

          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold uppercase tracking-wider">Addresses</span>
              <MapPin className="h-4 w-4 text-zinc-700" />
            </div>
            <p className="text-2xl font-black text-zinc-950 mt-1">{addresses.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Saved delivery spots</p>
          </div>

          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold uppercase tracking-wider">Warranty</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-1">{totalItemsCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Devices covered 1-yr</p>
          </div>
        </div>
      </div>

      {/* 2. Main Body Tabs & Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition text-left ${
              activeTab === 'orders'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-sm font-extrabold ${
                activeTab === 'orders' ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition text-left ${
              activeTab === 'addresses'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              <span>Saved Addresses</span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-sm font-extrabold ${
                activeTab === 'addresses' ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              {addresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition text-left ${
              activeTab === 'profile'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition text-left ${
              activeTab === 'security'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Security & Password</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 tracking-tight">Order History</h2>
                  <p className="text-xs text-zinc-500">Track shipments, view specs, and print official tax invoices</p>
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {orders.length} Total {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {loadingOrders ? (
                <div className="text-center py-16 rounded-md border border-zinc-200 bg-white">
                  <Package className="h-8 w-8 mx-auto text-zinc-400 animate-bounce mb-2" />
                  <p className="text-xs font-bold text-zinc-600">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 rounded-md border border-zinc-200 bg-white">
                  <Package className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-bold text-zinc-800">You haven't placed any orders yet</p>
                  <p className="text-xs text-zinc-500 mt-1">Explore our latest flagship smartphones and accessories.</p>
                  <Link to="/products">
                    <Button size="sm" className="mt-4 rounded-md font-bold">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    const isPaid = o.payment_status === 'paid';
                    return (
                      <div
                        key={o.id || o.order_number}
                        className="rounded-md border border-zinc-200 bg-white p-5 space-y-4 hover:border-zinc-300 transition-all shadow-2xs"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/orders/track/${encodeURIComponent(o.order_number)}`}
                                  className="font-mono text-sm font-black text-zinc-950 hover:underline hover:text-red-600 transition"
                                  title="Click to track order"
                                >
                                  {o.order_number}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => copyOrderNumber(o.order_number)}
                                  className="text-zinc-400 hover:text-zinc-900 transition"
                                  title="Copy Order Number"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5">{formatDateTime(o.created_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                isPaid ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {isPaid ? 'PAID' : 'PENDING'}
                            </span>
                            <Badge tone={orderStatusTone(o.status)} dot>
                              {statusLabel(o.status)}
                            </Badge>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {o.items && o.items.length > 0 ? (
                            o.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-10 shrink-0 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-center p-1">
                                    <Package className="h-5 w-5 text-zinc-400" />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-bold text-zinc-900 truncate">
                                      {item.quantity}x {item.product_name}
                                    </p>
                                    {item.variant_name && (
                                      <p className="text-[11px] text-zinc-500 truncate">
                                        {item.variant_name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-zinc-950 shrink-0">
                                  {formatPrice(item.subtotal ?? Number(item.unit_price) * item.quantity)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex justify-between text-xs text-zinc-700">
                              <span>Standard Device Order</span>
                              <span className="font-semibold text-zinc-900">{formatPrice(o.total_amount)}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <span className="text-xs text-zinc-500 font-medium">Total Billed:</span>
                            <span className="text-base font-black text-zinc-950 ml-2">
                              {formatPrice(o.total_amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* VERIFY PAYMENT BUTTON IF PENDING */}
                            {!isPaid && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleVerifyOrderPayment(o.order_number)}
                                loading={verifyingOrder === o.order_number}
                                className="gap-1.5 rounded-md text-xs font-bold bg-[#E12326] hover:bg-[#c11b1e] text-white shadow-2xs"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Verify Bakong</span>
                              </Button>
                            )}

                            {/* PRINT INVOICE BUTTON */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenInvoice(o)}
                              className="gap-1.5 rounded-md text-xs font-bold border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50"
                            >
                              <Printer className="h-3.5 w-3.5 text-zinc-700" />
                              <span>Print Invoice (PDF)</span>
                            </Button>

                            {/* TRACK ORDER BUTTON */}
                            <Link to={`/orders/track/${encodeURIComponent(o.order_number)}`}>
                              <Button
                                type="button"
                                size="sm"
                                className="gap-1.5 rounded-md text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800"
                              >
                                <Truck className="h-3.5 w-3.5" />
                                <span>Track Order</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 tracking-tight">Saved Addresses</h2>
                  <p className="text-xs text-zinc-500">Manage shipping addresses for instant checkout delivery</p>
                </div>
                <Button
                  onClick={handleOpenAddAddress}
                  size="sm"
                  className="gap-1.5 rounded-md text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Address</span>
                </Button>
              </div>

              {loadingAddresses ? (
                <div className="text-center py-16 rounded-md border border-zinc-200 bg-white">
                  <MapPin className="h-8 w-8 mx-auto text-zinc-400 animate-bounce mb-2" />
                  <p className="text-xs font-bold text-zinc-600">Loading saved addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-16 rounded-md border border-zinc-200 bg-white">
                  <MapPin className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-bold text-zinc-800">No saved addresses found</p>
                  <p className="text-xs text-zinc-500 mt-1">Add your shipping address to speed up your future orders.</p>
                  <Button
                    onClick={handleOpenAddAddress}
                    size="sm"
                    className="mt-4 rounded-md font-bold bg-zinc-950 text-white hover:bg-zinc-800"
                  >
                    + Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-md border p-5 space-y-3 transition-all ${
                        addr.is_default
                          ? 'border-2 border-zinc-950 bg-zinc-50/70 shadow-xs'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-zinc-950">{addr.full_name}</h3>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-sm bg-zinc-950 text-white text-[10px] font-black uppercase tracking-wider">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 font-medium mt-1 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-zinc-400" />
                            {addr.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition"
                            title="Edit Address"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                            title="Delete Address"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-600 space-y-0.5 pt-1 border-t border-zinc-100">
                        <p className="font-medium text-zinc-900">{addr.address_line_1}</p>
                        {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                        <p>
                          {addr.city}, {addr.province} • {addr.country}
                        </p>
                        {addr.delivery_notes && (
                          <p className="text-[11px] text-zinc-500 italic pt-1">
                            Note: "{addr.delivery_notes}"
                          </p>
                        )}
                      </div>

                      {!addr.is_default && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
                          >
                            Set as default delivery address
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-md border border-zinc-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-950 tracking-tight">Account Information</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Update your personal contact details</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="max-w-lg space-y-4">
                <Input
                  label="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+855 12 345 678"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
                <Input label="Email Address" value={user.email} disabled hint="Email address cannot be modified." />
                <Button type="submit" loading={savingProfile} className="rounded-md font-bold bg-zinc-950 text-white hover:bg-zinc-800">
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-md border border-zinc-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-950 tracking-tight">Security & Credentials</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Ensure your account is protected with a strong password</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="max-w-lg space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button type="submit" loading={savingPassword} className="rounded-md font-bold bg-zinc-950 text-white hover:bg-zinc-800">
                  Update Password
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT ADDRESS */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-md shadow-xl border border-zinc-200 p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-extrabold text-base text-zinc-950">
                {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 rounded-md p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <Input
                label="Recipient Full Name *"
                required
                placeholder="e.g. SRENG SOPHEA"
                value={addressForm.full_name}
                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
              />

              <Input
                label="Phone Number *"
                required
                type="tel"
                placeholder="e.g. 08765656"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              />

              <Input
                label="Street Address / House No. *"
                required
                placeholder="Building 12, St 2004..."
                value={addressForm.address_line_1}
                onChange={(e) => setAddressForm({ ...addressForm, address_line_1: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City / Sangkat"
                  placeholder="Phnom Penh"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
                <Input
                  label="Province"
                  placeholder="Phnom Penh"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                />
              </div>

              <Input
                label="Delivery Notes (Optional)"
                placeholder="Leave with receptionist or call upon arrival..."
                value={addressForm.delivery_notes}
                onChange={(e) => setAddressForm({ ...addressForm, delivery_notes: e.target.value })}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="h-4 w-4 rounded-sm border-zinc-300 accent-zinc-950 cursor-pointer"
                />
                <label htmlFor="is_default" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                  Set as my default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={savingAddress}
                  className="rounded-md font-bold bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
      />
    </div>
  );
}
