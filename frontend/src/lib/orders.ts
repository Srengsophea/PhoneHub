import type { Order, User } from '@/types';

const ORDERS_STORAGE_KEY = 'phonehub_orders_history';

export interface UserOrderFilter {
  id?: number | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

/**
 * Checks whether an order belongs to a specific user.
 * Strictly prevents customer orders from leaking into admin profiles or vice versa.
 */
export function isOrderOwnedByUser(order: Order, user?: UserOrderFilter | User | null): boolean {
  if (!user) return false;

  const currentUserId = user.id ? Number(user.id) : null;
  const orderUserId = order.user_id ? Number(order.user_id) : (order.user?.id ? Number(order.user.id) : null);
  const currentUserEmail = user.email ? user.email.trim().toLowerCase() : '';

  const orderEmail = (
    order.user?.email ||
    (order as any).customer_email ||
    (order as any).shipping_address?.email ||
    (order as any).shipping_address_snapshot?.email ||
    ''
  ).trim().toLowerCase();

  const recipientName = (
    (order as any).shipping_address?.full_name ||
    (order as any).shipping_address_snapshot?.full_name ||
    (order as any).customer_name ||
    ''
  ).trim().toLowerCase();

  const currentUserName = (user.name || '').trim().toLowerCase();

  // 1. If both order and user have numeric IDs:
  if (currentUserId && orderUserId) {
    return currentUserId === orderUserId;
  }

  // 2. If email exists on both:
  if (currentUserEmail && orderEmail) {
    return currentUserEmail === orderEmail;
  }

  // 3. Fallback: match by full recipient name if available
  if (currentUserName && recipientName && currentUserName === recipientName) {
    return true;
  }

  return false;
}

/**
 * Retrieves orders from localStorage.
 * If filterUser is supplied, only returns orders owned by that user.
 */
export function getLocalOrders(filterUser?: UserOrderFilter | User | null): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const all: Order[] = raw ? JSON.parse(raw) : [];
    if (!filterUser) {
      return all;
    }
    return all.filter((o) => isOrderOwnedByUser(o, filterUser));
  } catch {
    return [];
  }
}

/**
 * Saves or updates an order in localStorage, stamping it with the placing user's credentials.
 */
export function saveLocalOrder(order: Order, placingUser?: UserOrderFilter | User | null): void {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = raw ? JSON.parse(raw) : [];

    // Ensure order is tagged with user ownership
    if (placingUser) {
      if (placingUser.id && !order.user_id) {
        order.user_id = Number(placingUser.id);
      }
      if (!order.user && placingUser.id) {
        order.user = {
          id: Number(placingUser.id),
          name: placingUser.name || '',
          email: placingUser.email || '',
          role: (placingUser.role as any) || 'customer',
        };
      }
      if (placingUser.email) {
        (order as any).customer_email = placingUser.email;
      }
    }

    const existingIndex = orders.findIndex((o) => o.order_number === order.order_number);
    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...order };
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Failed to save order to local storage', err);
  }
}

export function getLocalOrder(orderNumber: string): Order | null {
  if (!orderNumber || orderNumber === 'undefined' || orderNumber === 'null') return null;
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  const orders: Order[] = raw ? JSON.parse(raw) : [];
  return orders.find((o) => o.order_number?.toLowerCase() === orderNumber.toLowerCase()) || null;
}

export function updateLocalOrderStatus(
  orderNumber: string,
  status: Order['status'],
  paymentStatus: Order['payment_status']
): Order | null {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  const orders: Order[] = raw ? JSON.parse(raw) : [];
  const target = orders.find((o) => o.order_number?.toLowerCase() === orderNumber.toLowerCase());
  if (target) {
    target.status = status;
    target.payment_status = paymentStatus;
    if (paymentStatus === 'paid' && !target.paid_at) {
      target.paid_at = new Date().toISOString();
    }
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return target;
  }
  return null;
}
