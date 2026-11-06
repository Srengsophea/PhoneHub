import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button, Input, Modal, Badge, Pagination } from '@/components/ui';
import { Plus, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import type { InventoryTransaction, Product, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export function AdminInventoryPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Adjust Modal
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/inventory/history?page=${page}`);
      setTransactions(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    async function loadProductsList() {
      const { data } = await api.get('/admin/products?per_page=100');
      setProducts(data.data || []);
      if (data.data?.length > 0) {
        setSelectedProductId(String(data.data[0].id));
      }
    }
    loadProductsList();
  }, [page]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    try {
      await api.post('/admin/inventory/adjust', {
        product_id: Number(selectedProductId),
        variant_id: selectedVariantId ? Number(selectedVariantId) : null,
        quantity_change: Number(changeAmount),
        type: 'adjustment',
        notes: notes || 'Manual warehouse inventory adjustment',
      });
      toast.success('Stock adjusted successfully!');
      setAdjustOpen(false);
      setChangeAmount('');
      setNotes('');
      loadTransactions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not adjust inventory.');
    } finally {
      setAdjusting(false);
    }
  };

  const currentProduct = products.find((p) => p.id === Number(selectedProductId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Warehouse Inventory</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Real-time stock audit log and manual inventory adjustments.</p>
        </div>
        <Button onClick={() => setAdjustOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Adjust Stock Level
        </Button>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Product / Model</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Change</th>
                <th className="py-3 px-6">New Balance</th>
                <th className="py-3 px-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-6 text-xs text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 px-6 font-semibold text-zinc-900">
                    {t.product?.name || `Product #${t.product_id}`}
                    {t.variant && <span className="block text-xs font-normal text-zinc-400">{t.variant.name}</span>}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center gap-1 font-bold ${t.quantity_change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.quantity_change > 0 ? `+${t.quantity_change}` : t.quantity_change}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-zinc-900">{t.balance_after}</td>
                  <td className="py-3.5 px-6 text-xs text-zinc-500">{t.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="p-4 border-t border-zinc-100 flex justify-center">
            <Pagination meta={meta} onPage={(p) => setPage(p)} />
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust Product Stock">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="label">Select Smartphone *</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedVariantId('');
              }}
              className="input"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {currentProduct?.variants && currentProduct.variants.length > 0 && (
            <div>
              <label className="label">Variant / Storage Option</label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="input"
              >
                <option value="">Default (No variant)</option>
                {currentProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name || `${v.storage} ${v.ram}`} (Current Stock: {v.stock})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Quantity Change (+ to add, - to subtract) *"
            type="number"
            required
            value={changeAmount}
            onChange={(e) => setChangeAmount(e.target.value)}
            placeholder="e.g. 50 or -5"
          />

          <Input
            label="Reason / Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Received new shipment from Apple supplier"
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adjusting}>
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

