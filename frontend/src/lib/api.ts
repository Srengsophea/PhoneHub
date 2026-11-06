import axios, { AxiosError } from 'axios';
import catalogData from '@/data/catalog.json';
import type { Product, Brand, Category } from '@/types';

export const TOKEN_KEY = 'phonehub_token';
export const GUEST_KEY = 'phonehub_guest_session';

export function getGuestSessionId(): string {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Guest-Session-Id'] = getGuestSessionId();
  return config;
});

// Resilient Offline Fallback (Guarantees Storefront Works on Vercel Without a Backend)
function handleOfflineFallback(url: string, method: string = 'get', data?: any) {
  const cleanUrl = url.replace(/^\/?api\/v1\/?/, '').replace(/^\//, '');
  const [endpoint, queryString] = cleanUrl.split('?');
  const params = new URLSearchParams(queryString || '');

  if (endpoint === 'brands') {
    return { data: { data: catalogData.brands as unknown as Brand[] } };
  }

  if (endpoint === 'categories') {
    return { data: { data: catalogData.categories as unknown as Category[] } };
  }

  if (endpoint.startsWith('products/')) {
    const slug = endpoint.replace('products/', '');
    const found = (catalogData.products as any[]).find((p) => p.slug === slug);
    if (found) {
      return { data: { data: found as unknown as Product } };
    }
  }

  if (endpoint === 'products') {
    let prods = [...(catalogData.products as any[])];

    const brand = params.get('brand');
    if (brand) prods = prods.filter((p) => p.brand?.slug === brand);

    const category = params.get('category');
    if (category) prods = prods.filter((p) => p.category?.slug === category);

    const featured = params.get('featured');
    if (featured === '1') prods = prods.filter((p) => p.is_featured);

    const bestseller = params.get('bestseller');
    if (bestseller === '1') prods = prods.filter((p) => p.is_bestseller);

    const search = params.get('search');
    if (search) {
      const q = search.toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(q) || p.brand?.name?.toLowerCase().includes(q));
    }

    const sort = params.get('sort');
    if (sort === 'price_asc') prods.sort((a, b) => (a.sale_price ?? a.base_price) - (b.sale_price ?? b.base_price));
    else if (sort === 'price_desc') prods.sort((a, b) => (b.sale_price ?? b.base_price) - (a.sale_price ?? a.base_price));
    else if (sort === 'best_selling') prods.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));

    const perPage = parseInt(params.get('per_page') || '12', 10);
    const page = parseInt(params.get('page') || '1', 10);
    const start = (page - 1) * perPage;
    const paginated = prods.slice(start, start + perPage);

    return {
      data: {
        data: paginated as unknown as Product[],
        meta: {
          current_page: page,
          last_page: Math.ceil(prods.length / perPage),
          total: prods.length,
          per_page: perPage,
        },
      },
    };
  }

  if (endpoint === 'cart') {
    const cartStored = localStorage.getItem('phonehub_offline_cart');
    const items = cartStored ? JSON.parse(cartStored) : [];
    const subtotal = items.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0);
    return {
      data: {
        data: {
          items,
          subtotal,
          discount_amount: 0,
          shipping_fee: subtotal > 500 ? 0 : 25,
          tax_amount: 0,
          total_amount: subtotal > 500 ? subtotal : subtotal + (items.length ? 25 : 0),
          coupon: null,
        },
      },
    };
  }

  if (endpoint === 'cart/items' && method.toLowerCase() === 'post') {
    const cartStored = localStorage.getItem('phonehub_offline_cart');
    const items = cartStored ? JSON.parse(cartStored) : [];
    const p = (catalogData.products as any[]).find((prod) => prod.id === data?.product_id);
    if (p) {
      const existing = items.find((it: any) => it.product_id === p.id && it.variant_id === data?.variant_id);
      if (existing) {
        existing.quantity += data?.quantity || 1;
      } else {
        items.push({
          id: Date.now(),
          product_id: p.id,
          variant_id: data?.variant_id || null,
          quantity: data?.quantity || 1,
          price: p.sale_price ?? p.base_price,
          product: p,
          variant: p.variants?.find((v: any) => v.id === data?.variant_id) || null,
        });
      }
      localStorage.setItem('phonehub_offline_cart', JSON.stringify(items));
    }
    return handleOfflineFallback('cart');
  }

  return null;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('phonehub:unauthorized'));
    }

    // If backend is offline (Network Error, 404, or 502/503), use embedded catalog
    if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status >= 500) {
      const config = error.config;
      if (config?.url) {
        let postData = config.data;
        if (typeof postData === 'string') {
          try { postData = JSON.parse(postData); } catch {}
        }
        const fallback = handleOfflineFallback(config.url, config.method, postData);
        if (fallback) {
          return Promise.resolve(fallback as any);
        }
      }
    }

    return Promise.reject(error);
  },
);

/** Extracts a human readable message from a Laravel error response. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const data = e?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return first[0];
  }
  return data?.message || fallback;
}

/** Returns Laravel validation errors keyed by field (first message only). */
export function getFieldErrors(err: unknown): Record<string, string> {
  const e = err as AxiosError<{ errors?: Record<string, string[]> }>;
  const errors = e?.response?.data?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
}

export default api;
