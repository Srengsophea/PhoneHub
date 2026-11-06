import { useEffect, useState } from 'react';
import { useAuth } from '@/stores/auth';
import { Button, Input, Badge } from '@/components/ui';
import { User, Package, MapPin, Key, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel } from '@/lib/format';
import type { Order, Address } from '@/types';
import toast from 'react-hot-toast';

export function UserProfilePage() {
  const { user, logout, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
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

    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const { data } = await api.get('/orders');
        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Please sign in</h2>
        <Button onClick={() => openAuthModal('login')} className="mt-4">
          Sign In
        </Button>
      </div>
    );
  }

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

  return (
    <div className="container-page py-10 space-y-8">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-xl font-bold text-white shadow-sm">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-950">{user.name}</h1>
            <p className="text-sm text-zinc-500">{user.email} • Member</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition text-left ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition text-left ${
              activeTab === 'profile'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition text-left ${
              activeTab === 'security'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Security & Password</span>
          </button>
        </aside>

        {/* Tab content */}
        <div className="md:col-span-3">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-950 mb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-zinc-200 bg-zinc-50/50">
                  <Package className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm font-semibold text-zinc-800">You haven't placed any orders yet</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-soft"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2">
                      <div>
                        <span className="text-sm font-bold text-zinc-900">{o.order_number}</span>
                        <p className="text-xs text-zinc-400 mt-0.5">{formatDateTime(o.created_at)}</p>
                      </div>
                      <Badge tone={orderStatusTone(o.status)} dot>
                        {statusLabel(o.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {o.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-zinc-700">
                          <span>
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-semibold text-zinc-900">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-sm">
                      <span className="font-semibold text-zinc-900">Total Billed</span>
                      <span className="font-extrabold text-zinc-950">{formatPrice(o.total_amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="max-w-lg space-y-4">
              <h2 className="text-xl font-bold text-zinc-950 mb-4">Account Information</h2>
              <Input
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
              <Input label="Email Address" value={user.email} disabled />
              <Button type="submit" loading={savingProfile}>
                Save Changes
              </Button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="max-w-lg space-y-4">
              <h2 className="text-xl font-bold text-zinc-950 mb-4">Update Password</h2>
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
              <Button type="submit" loading={savingPassword}>
                Change Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

