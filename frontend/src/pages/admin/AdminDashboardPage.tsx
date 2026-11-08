import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Smartphone,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel } from '@/lib/format';
import { Badge } from '@/components/ui';
import type { Order } from '@/types';

interface StatsData {
  total_revenue: number;
  orders_count: number;
  customers_count: number;
  products_count: number;
  low_stock_count?: number;
  recent_orders?: Order[];
  revenue_chart?: { date: string; amount: number }[];
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await api.get('/admin/dashboard/stats');
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Gross Revenue',
      val: formatPrice(stats?.total_revenue || 0),
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
    },
    {
      label: 'Total Orders',
      val: stats?.orders_count || 0,
      icon: <ShoppingBag className="h-5 w-5 text-blue-600" />,
    },
    {
      label: 'Registered Customers',
      val: stats?.customers_count || 0,
      icon: <Users className="h-5 w-5 text-purple-600" />,
    },
    {
      label: 'Catalog Devices',
      val: stats?.products_count || 0,
      icon: <Smartphone className="h-5 w-5 text-zinc-700" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Performance</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time overview of PhoneHub sales, inventory and users.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                {k.label}
              </span>
              <div>{k.icon}</div>
            </div>
            <p className="text-2xl font-black text-zinc-950">{k.val}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Recent Customer Orders</h2>
            <p className="text-xs text-zinc-400">Latest transactions requiring fulfillment</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase">
                <th className="pb-3">Order</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                stats.recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 font-semibold text-zinc-900">{o.order_number}</td>
                    <td className="py-3 text-xs text-zinc-500">{formatDateTime(o.created_at)}</td>
                    <td className="py-3 text-zinc-900">{o.user?.name || 'Guest'}</td>
                    <td className="py-3 font-bold text-zinc-900">{formatPrice(o.total_amount)}</td>
                    <td className="py-3">
                      <Badge tone={orderStatusTone(o.status)} dot>
                        {statusLabel(o.status)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

