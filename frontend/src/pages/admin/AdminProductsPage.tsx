import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button, Input, Modal, Badge, Pagination } from '@/components/ui';
import { formatPrice, productImage } from '@/lib/format';
import type { Product, Brand, Category, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    sku: '',
    base_price: '',
    sale_price: '',
    short_description: '',
    warranty_info: '',
    is_featured: false,
    is_bestseller: false,
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/products?page=${page}&search=${encodeURIComponent(search)}`);
      setProducts(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  useEffect(() => {
    async function fetchTax() {
      const [b, c] = await Promise.all([api.get('/brands'), api.get('/categories')]);
      setBrands(b.data.data || []);
      setCategories(c.data.data || []);
    }
    fetchTax();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      brand_id: brands[0]?.id ? String(brands[0].id) : '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      sku: 'SKU-' + Date.now().toString(36).toUpperCase(),
      base_price: '',
      sale_price: '',
      short_description: '',
      warranty_info: '1-Year Official Warranty',
      is_featured: false,
      is_bestseller: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      brand_id: String(p.brand_id),
      category_id: String(p.category_id),
      sku: p.sku,
      base_price: String(p.base_price),
      sale_price: p.sale_price ? String(p.sale_price) : '',
      short_description: p.short_description || '',
      warranty_info: p.warranty_info || '',
      is_featured: Boolean(p.is_featured),
      is_bestseller: Boolean(p.is_bestseller),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, form);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/admin/products', form);
        toast.success('New smartphone created!');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product removed.');
      loadProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Smartphone Inventory</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage models, pricing, and showcase flags.</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Smartphone
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by name, brand, SKU..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Brand</th>
                <th className="py-3 px-6">Base Price</th>
                <th className="py-3 px-6">Sale Price</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <img
                        src={productImage(p)}
                        alt=""
                        className="h-10 w-10 rounded-lg object-contain bg-zinc-50 p-1 border border-zinc-100"
                      />
                      <div>
                        <p className="font-semibold text-zinc-900">{p.name}</p>
                        <p className="text-xs text-zinc-400">{p.sku}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-zinc-600 font-medium">
                      {p.brand?.name || '—'}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-zinc-900">
                      {formatPrice(p.base_price)}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-emerald-600">
                      {p.sale_price ? formatPrice(p.sale_price) : '—'}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge tone={p.is_active ? 'success' : 'neutral'}>
                        {p.is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="p-4 border-t border-zinc-100 flex justify-center">
            <Pagination meta={meta} onPage={(p) => setPage(p)} />
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Create Smartphone'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name *"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Galaxy S25 Ultra"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Brand *</label>
              <select
                value={form.brand_id}
                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                className="input"
                required
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="SKU *"
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <Input
              label="Base Price ($) *"
              type="number"
              step="0.01"
              required
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            />
            <Input
              label="Sale Price ($)"
              type="number"
              step="0.01"
              value={form.sale_price}
              onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
            />
          </div>

          <Input
            label="Short Summary"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            placeholder="Flagship performance with titanium frame and 200MP camera."
          />

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded border-zinc-300 accent-zinc-900"
              />
              Showcase on Homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_bestseller}
                onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
                className="rounded border-zinc-300 accent-zinc-900"
              />
              Bestseller Badge
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Smartphone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

