import { useEffect, useState, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Palette,
  Check,
} from 'lucide-react';
import api from '@/lib/api';
import { Button, Input, Modal, Badge, Pagination } from '@/components/ui';
import { formatPrice, productImage, imageUrl } from '@/lib/format';
import type { Product, Brand, Category, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

interface ColorVariantFormItem {
  id: string;
  variant_id?: number;
  name: string;
  hex: string;
  image_url: string;
}

const COLOR_PRESETS = [
  { name: 'Natural Titanium', hex: '#9e968d' },
  { name: 'Desert Titanium', hex: '#d4af8c' },
  { name: 'Black Titanium', hex: '#323234' },
  { name: 'White Titanium', hex: '#f2f1ed' },
  { name: 'Space Black', hex: '#1c1917' },
  { name: 'Midnight Blue', hex: '#1e3a8a' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Silver', hex: '#cbd5e1' },
  { name: 'Gold', hex: '#f5d061' },
];

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

  // Main Form fields
  const [form, setForm] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    sku: '',
    base_price: '',
    sale_price: '',
    short_description: '',
    warranty_info: '1-Year Official Warranty',
    is_featured: false,
    is_bestseller: false,
  });

  // Main Image state
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [mainImageTab, setMainImageTab] = useState<'url' | 'upload'>('url');
  const [uploadingMain, setUploadingMain] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);

  // Color Variants state
  const [colors, setColors] = useState<ColorVariantFormItem[]>([]);
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);

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
    setMainImageUrl('');
    setMainImageTab('url');
    // Pre-populate with 2 default colors so admin easily sees how color images work
    setColors([
      { id: 'c1', name: 'Natural Titanium', hex: '#9e968d', image_url: '' },
      { id: 'c2', name: 'Black Titanium', hex: '#323234', image_url: '' },
    ]);
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
      warranty_info: p.warranty_info || '1-Year Official Warranty',
      is_featured: Boolean(p.is_featured),
      is_bestseller: Boolean(p.is_bestseller),
    });

    const existingMainImg =
      p.primary_image?.image_path ||
      (p as any).image_url ||
      p.images?.find((img) => img.is_primary)?.image_path ||
      p.images?.[0]?.image_path ||
      (p.slug ? `/images/products/${p.slug}.png` : '');
    setMainImageUrl(existingMainImg);
    setMainImageTab('url');

    // Extract colors from product variants
    const extractedColors: ColorVariantFormItem[] = [];
    (p.variants || []).forEach((v, idx) => {
      const colorName = v.color || `Color ${idx + 1}`;
      if (!extractedColors.some((c) => c.name.toLowerCase() === colorName.toLowerCase())) {
        const varImg =
          (v as any).image_url ||
          v.images?.[0]?.image_path ||
          p.images?.find((img) => img.variant_id === v.id)?.image_path ||
          '';
        extractedColors.push({
          id: String(v.id || idx + 1),
          variant_id: v.id,
          name: colorName,
          hex: v.color_hex || '#94a3b8',
          image_url: varImg,
        });
      }
    });

    setColors(
      extractedColors.length > 0
        ? extractedColors
        : [{ id: 'c1', name: 'Standard', hex: '#18181b', image_url: '' }]
    );
    setModalOpen(true);
  };

  // Upload file helper: uploads to server or falls back to data URL for 100% offline reliability
  const uploadImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please choose a valid image file (PNG, JPG, WEBP, SVG)');
        reject('Invalid type');
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const fd = new FormData();
          fd.append('image', file);
          const res = await api.post('/admin/products/upload-image', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.data?.image_path || res.data?.url) {
            resolve(res.data.image_path || res.data.url);
            return;
          }
        } catch {
          // If offline or upload fails, seamlessly use dataUrl
        }
        resolve(dataUrl);
      };
      reader.onerror = () => reject('Read error');
      reader.readAsDataURL(file);
    });
  };

  // Main image file selection handler
  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await uploadImageFile(file);
      setMainImageUrl(url);
      toast.success('Smartphone image loaded successfully!');
    } catch {
      toast.error('Failed to load image.');
    } finally {
      setUploadingMain(false);
      e.target.value = '';
    }
  };

  // Color variant image file selection handler
  const handleColorFileSelect = async (colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColorId(colorId);
    try {
      const url = await uploadImageFile(file);
      setColors((prev) =>
        prev.map((c) => (c.id === colorId ? { ...c, image_url: url } : c))
      );
      toast.success('Color image loaded!');
    } catch {
      toast.error('Failed to load color image.');
    } finally {
      setUploadingColorId(null);
      e.target.value = '';
    }
  };

  // Add new color row
  const handleAddColor = (preset?: { name: string; hex: string }) => {
    const newColor: ColorVariantFormItem = {
      id: 'color_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: preset ? preset.name : '',
      hex: preset ? preset.hex : '#3b82f6',
      image_url: '',
    };
    setColors([...colors, newColor]);
  };

  // Remove color row
  const handleRemoveColor = (id: string) => {
    if (colors.length <= 1) {
      toast.error('You must have at least one color variant.');
      return;
    }
    setColors(colors.filter((c) => c.id !== id));
  };

  // Save product (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    if (!form.base_price) {
      toast.error('Please enter a base price');
      return;
    }

    setSaving(true);
    try {
      // Build variants for each color
      const payloadVariants = colors.map((c, idx) => ({
        id: c.variant_id,
        name: `${form.name} - ${c.name || 'Standard'}`,
        sku: `${form.sku}-${(c.name || 'STD').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}-${idx + 1}`,
        price: Number(form.base_price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock: 20,
        color: c.name || 'Standard',
        color_hex: c.hex || '#3b82f6',
        storage: '256GB',
        image_url: c.image_url || mainImageUrl || null,
        image_path: c.image_url || mainImageUrl || null,
      }));

      // Build images array
      const payloadImages: { image_path: string; is_primary: boolean }[] = [];
      if (mainImageUrl.trim()) {
        payloadImages.push({
          image_path: mainImageUrl.trim(),
          is_primary: true,
        });
      }
      colors.forEach((c) => {
        if (c.image_url.trim() && c.image_url.trim() !== mainImageUrl.trim()) {
          payloadImages.push({
            image_path: c.image_url.trim(),
            is_primary: false,
          });
        }
      });

      const payload = {
        ...form,
        image_url: mainImageUrl.trim() || null,
        images: payloadImages,
        variants: payloadVariants.length > 0 ? payloadVariants : undefined,
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success('Smartphone updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('New smartphone created successfully!');
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
        <Button onClick={openCreateModal} className="gap-2 rounded-md">
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
            className="pl-10 rounded-md"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
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
                        className="h-10 w-10 rounded-md object-contain bg-zinc-50 p-1 border border-zinc-100"
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
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
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
        size="xl"
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Create Smartphone'}
      >
        <form onSubmit={handleSave} className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
          {/* Card 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              1. Basic Information
            </h3>

            <Input
              label="Product Name *"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Galaxy S25 Ultra"
              className="rounded-md"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Brand *</label>
                <select
                  value={form.brand_id}
                  onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                  className="input rounded-md"
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
                  className="input rounded-md"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="SKU *"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="rounded-md"
              />
              <Input
                label="Base Price ($) *"
                type="number"
                step="0.01"
                required
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                className="rounded-md"
              />
              <Input
                label="Sale Price ($)"
                type="number"
                step="0.01"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                className="rounded-md"
              />
            </div>

            <Input
              label="Short Summary"
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="Flagship performance with titanium frame and 200MP camera."
              className="rounded-md"
            />
          </div>

          {/* Card 2: Main Smartphone Image (URL or Local File Upload) */}
          <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-brand-600" />
                  2. Main Smartphone Image
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Import the primary product image using an online URL or choose a file from your computer.
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMainImageTab('url')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    mainImageTab === 'url'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <LinkIcon className="h-3 w-3" /> URL Link
                </button>
                <button
                  type="button"
                  onClick={() => setMainImageTab('upload')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    mainImageTab === 'upload'
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Upload className="h-3 w-3" /> Local File
                </button>
              </div>
            </div>

            {/* URL Input Mode */}
            {mainImageTab === 'url' ? (
              <div className="space-y-2">
                <Input
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                  placeholder="https://images.example.com/phone.png or /images/products/phone.png"
                  className="rounded-md bg-white"
                />
              </div>
            ) : (
              /* Local File Upload Mode */
              <div className="space-y-2">
                <input
                  type="file"
                  ref={mainFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleMainFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => mainFileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-xl p-4 bg-white text-center transition flex flex-col items-center justify-center gap-1.5"
                >
                  {uploadingMain ? (
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                  ) : (
                    <Upload className="h-6 w-6 text-zinc-400" />
                  )}
                  <p className="text-xs font-semibold text-zinc-800">
                    Click to browse or drag & drop smartphone image
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Supports PNG, JPG, WEBP, or SVG
                  </p>
                </div>
              </div>
            )}

            {/* Live Preview for Main Image */}
            {mainImageUrl && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-zinc-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={imageUrl(mainImageUrl)}
                    alt="Preview"
                    className="h-12 w-12 rounded-md object-contain border border-zinc-100 bg-zinc-50 p-1 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      Primary Image Selected
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate max-w-sm">
                      {mainImageUrl}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMainImageUrl('')}
                  className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Smartphone Colors & Color-Specific Images */}
          <div className="space-y-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-brand-600" />
                  3. Phone Colors & Color Images
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Add color variations and attach the image for each color. On product details, selecting a color switches to that image.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddColor()}
                className="gap-1.5 rounded-md text-xs self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" /> Add Color
              </Button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-zinc-400 mr-1">Quick Presets:</span>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddColor(preset)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-200 bg-white hover:border-zinc-400 text-[11px] text-zinc-700 font-medium transition shadow-2xs"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* List of Colors */}
            <div className="space-y-3 pt-2">
              {colors.map((c, index) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-white space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Color Picker Swatch */}
                      <div className="relative flex items-center">
                        <input
                          type="color"
                          value={c.hex}
                          onChange={(e) =>
                            setColors(colors.map((item) => (item.id === c.id ? { ...item, hex: e.target.value } : item)))
                          }
                          className="h-9 w-9 rounded-md border border-zinc-300 cursor-pointer p-0.5 bg-white shrink-0"
                          title="Choose color hex"
                        />
                      </div>

                      {/* Color Name Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) =>
                            setColors(colors.map((item) => (item.id === c.id ? { ...item, name: e.target.value } : item)))
                          }
                          placeholder={`Color Name (e.g. Natural Titanium)`}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>

                    {/* Delete Color Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove color variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Color-specific Image Controls */}
                  <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-tight shrink-0">
                        Color Image:
                      </span>

                      {/* URL input for color image */}
                      <input
                        type="text"
                        value={c.image_url}
                        onChange={(e) =>
                          setColors(colors.map((item) => (item.id === c.id ? { ...item, image_url: e.target.value } : item)))
                        }
                        placeholder="Image URL (e.g. https://... or /images/...)"
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900"
                      />

                      {/* Upload local file for this color */}
                      <label className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition">
                        {uploadingColorId === c.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleColorFileSelect(c.id, e)}
                        />
                      </label>
                    </div>

                    {/* Thumbnail Preview for Color Image */}
                    {c.image_url && (
                      <div className="flex items-center gap-2 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-200 shrink-0">
                        <img
                          src={imageUrl(c.image_url)}
                          alt={c.name}
                          className="h-8 w-8 rounded-sm object-contain bg-white p-0.5 border border-zinc-100"
                        />
                        <span className="text-[10px] font-semibold text-zinc-600 truncate max-w-[120px]">
                          {c.name || 'Preview'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setColors(colors.map((item) => (item.id === c.id ? { ...item, image_url: '' } : item)))
                          }
                          className="p-0.5 rounded text-zinc-400 hover:text-red-600"
                          title="Remove color image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Showcase & Badge Options */}
          <div className="flex gap-6 pt-1">
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

          {/* Modal Action Buttons */}
          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="rounded-md">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="rounded-md">
              Save Smartphone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
