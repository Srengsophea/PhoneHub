import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { Coupon } from '@/types';
import toast from 'react-hot-toast';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_spend: '',
    max_discount: '',
    usage_limit: '',
    is_active: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/coupons', form);
      toast.success('Coupon created!');
      setModalOpen(false);
      setForm({
        code: '',
        type: 'percentage',
        value: '',
        min_spend: '',
        max_discount: '',
        usage_limit: '',
        is_active: true,
      });
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted.');
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not delete coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Promotions & Coupons</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage discounts, checkout vouchers, and promo campaigns.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Coupon Code
        </Button>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Code</th>
                <th className="py-3 px-6">Discount Value</th>
                <th className="py-3 px-6">Min Spend</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-6 font-bold text-zinc-900 tracking-wider">{c.code}</td>
                  <td className="py-3.5 px-6 font-semibold text-emerald-600">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `${formatPrice(c.value)} OFF`}
                  </td>
                  <td className="py-3.5 px-6 text-zinc-600">
                    {c.min_spend ? formatPrice(c.min_spend) : 'No minimum'}
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge tone={c.is_active ? 'success' : 'neutral'}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Promotion Voucher">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Promo Code *"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. FLASH2026"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="input"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
              </select>
            </div>
            <Input
              label="Value *"
              required
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === 'percentage' ? '15' : '50'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min. Spend ($)"
              type="number"
              value={form.min_spend}
              onChange={(e) => setForm({ ...form, min_spend: e.target.value })}
              placeholder="300"
            />
            <Input
              label="Max Discount ($)"
              type="number"
              value={form.max_discount}
              onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
              placeholder="100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

