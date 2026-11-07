import type { Order } from '@/types';

const ORDERS_STORAGE_KEY = 'phonehub_orders_history';

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  try {
    const orders = getLocalOrders();
    const existingIndex = orders.findIndex((o) => o.order_number === order.order_number);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
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
  const orders = getLocalOrders();
  return orders.find((o) => o.order_number.toLowerCase() === orderNumber.toLowerCase()) || null;
}

export function updateLocalOrderStatus(
  orderNumber: string,
  status: Order['status'],
  paymentStatus: Order['payment_status']
): Order | null {
  const orders = getLocalOrders();
  const target = orders.find((o) => o.order_number.toLowerCase() === orderNumber.toLowerCase());
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

