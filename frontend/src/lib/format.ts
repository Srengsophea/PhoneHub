import type { Money, Product, ProductVariant, OrderStatus, PaymentStatus, ProductImage } from '@/types';

export const toNumber = (v: Money | null | undefined): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatPrice = (v: Money | null | undefined) => currency.format(toNumber(v));
export const formatCompactPrice = (v: Money | null | undefined) => compactCurrency.format(toNumber(v));
export const formatNumber = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('en-US').format(toNumber(v as Money));

export const formatDate = (d?: string | null, opts?: Intl.DateTimeFormatOptions) => {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', opts ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(d),
  );
};

export const formatDateTime = (d?: string | null) =>
  formatDate(d, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const timeAgo = (d?: string | null) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  const units: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ];
  for (const [sec, label] of units) if (s >= sec) return `${Math.floor(s / sec)}${label} ago`;
  return 'just now';
};

/** Resolves image paths for products and assets. */
export const imageUrl = (path?: string | null): string => {
  if (!path) return '/images/placeholder-phone.svg';
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) return path;

  let resolved = path;
  if (resolved.startsWith('/images/') || resolved.startsWith('/storage/')) return resolved;
  if (resolved.startsWith('images/')) return `/${resolved}`;
  return `/storage/${resolved.replace(/^\/?(storage\/)?/, '')}`;
};

export const productImage = (p?: Partial<Product> | null): string => {
  if (!p) return imageUrl(null);

  // 1. Explicit primary image or image gallery
  const primary = p.primary_image ?? p.images?.find((i: ProductImage) => i.is_primary) ?? p.images?.[0];
  if (primary?.image_path) {
    return imageUrl(primary.image_path);
  }

  // 2. Direct image_url property (custom uploaded or mock product)
  if ((p as any).image_url) {
    return imageUrl((p as any).image_url);
  }

  // 3. Fallback to bundled catalog slug image
  if (p.slug) {
    return `/images/products/${p.slug}.png`;
  }

  return imageUrl(null);
};

/** Effective prices for a product (or the cheapest active variant). */
export const productPricing = (p: Partial<Product>, variant?: ProductVariant | null) => {
  if (variant) {
    const price = toNumber(variant.price);
    const sale = variant.sale_price != null ? toNumber(variant.sale_price) : null;
    return pricing(price, sale);
  }
  const price = toNumber(p.base_price);
  const sale = p.sale_price != null ? toNumber(p.sale_price) : null;
  return pricing(price, sale);
};

function pricing(price: number, sale: number | null) {
  const onSale = sale !== null && sale > 0 && sale < price;
  return {
    current: onSale ? sale! : price,
    original: onSale ? price : null,
    discountPct: onSale ? Math.round(((price - sale!) / price) * 100) : 0,
  };
}

export const totalStock = (p: Partial<Product>) =>
  (p.variants ?? []).reduce((sum: number, v: ProductVariant) => sum + (v.is_active === false ? 0 : v.stock ?? 0), 0);

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
];

export const statusLabel = (s?: string | null) =>
  (s ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

export const orderStatusTone = (s?: OrderStatus | string): Tone =>
  (
    ({
      pending: 'warning',
      confirmed: 'info',
      processing: 'info',
      packed: 'brand',
      shipped: 'brand',
      out_for_delivery: 'brand',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'neutral',
    }) as Record<string, Tone>
  )[s ?? ''] ?? 'neutral';

export const paymentStatusTone = (s?: PaymentStatus | string): Tone =>
  (({ paid: 'success', pending: 'warning', failed: 'danger', refunded: 'neutral' }) as Record<string, Tone>)[
    s ?? ''
  ] ?? 'neutral';

export const paymentMethodLabel = (m?: string) =>
  (({ cod: 'Cash on Delivery', bank_transfer: 'Bank Transfer', stripe: 'Credit Card' }) as Record<string, string>)[
    m ?? ''
  ] ?? statusLabel(m);

export const initials = (name?: string | null) =>
  (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

export const isStaff = (role?: string | null) => ['admin', 'super_admin', 'manager'].includes(role ?? '');
