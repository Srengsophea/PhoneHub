import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Badge, Button, Select, Pagination } from '@/components/ui';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel, ORDER_STATUSES } from '@/lib/format';
import type { Order, OrderStatus, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/orders?page=${page}${statusFilter ? `&status=${statusFilter}` : ''}`,
      );
      setOrders(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated!');
      loadOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update order status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Customer Orders</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage dispatch, payment statuses, and tracking histories.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Order #</th>
                <th className="py-3 px-6">Placed At</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-6 font-bold text-zinc-900">{o.order_number}</td>
                  <td className="py-3.5 px-6 text-xs text-zinc-500">{formatDateTime(o.created_at)}</td>
                  <td className="py-3.5 px-6">
                    <p className="font-semibold text-zinc-900">{o.user?.name || 'Customer'}</p>
                    <p className="text-xs text-zinc-400">{o.shipping_address_snapshot?.phone || '—'}</p>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      {o.payment_method}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-extrabold text-zinc-950">
                    {formatPrice(o.total_amount)}
                  </td>
                  <td className="py-3.5 px-6">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium outline-none focus:border-zinc-900"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
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
    </div>
  );
}

