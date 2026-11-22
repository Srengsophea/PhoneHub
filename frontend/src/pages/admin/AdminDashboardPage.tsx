import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Smartphone,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Clock,
  PackageX,
  Plus,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel } from '@/lib/format';
import { Badge, Button } from '@/components/ui';
import type { Order } from '@/types';

interface DashboardMetrics {
  total_sales: number;
  today_sales: number;
  monthly_sales: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface SalesPoint {
  date: string;
  day: string;
  orders: number;
  revenue: number;
}

interface BrandDistribution {
  id: number;
  name: string;
  products_count: number;
}

interface DashboardPayload {
  metrics?: Partial<DashboardMetrics>;
  sales_over_time?: SalesPoint[];
  category_distribution?: BrandDistribution[];
  top_brands?: BrandDistribution[];
  recent_orders?: Order[];
  // Fallback legacy flat keys
  total_revenue?: number;
  orders_count?: number;
  customers_count?: number;
  products_count?: number;
  low_stock_count?: number;
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/admin/dashboard/stats');
      setData(res.data?.data ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats(false);
  }, [loadStats]);

  const metrics: DashboardMetrics = useMemo(() => {
    const m = data?.metrics;
    return {
      total_sales: Number(m?.total_sales ?? data?.total_revenue ?? 0),
      today_sales: Number(m?.today_sales ?? 0),
      monthly_sales: Number(m?.monthly_sales ?? 0),
      total_orders: Number(m?.total_orders ?? data?.orders_count ?? 0),
      pending_orders: Number(m?.pending_orders ?? 0),
      total_customers: Number(m?.total_customers ?? data?.customers_count ?? 0),
      total_products: Number(m?.total_products ?? data?.products_count ?? 0),
      low_stock_count: Number(m?.low_stock_count ?? data?.low_stock_count ?? 0),
      out_of_stock_count: Number(m?.out_of_stock_count ?? 0),
    };
  }, [data]);

  const salesTimeline = useMemo(() => data?.sales_over_time ?? [], [data]);
  const topBrands = useMemo(() => data?.top_brands ?? [], [data]);
  const recentOrders = useMemo(() => data?.recent_orders ?? [], [data]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return recentOrders;
    return recentOrders.filter((o) => o.status === orderFilter);
  }, [recentOrders, orderFilter]);

  const chartStats = useMemo(() => {
    const values = salesTimeline.map((pt) => (chartMode === 'revenue' ? pt.revenue : pt.orders));
    const maxVal = Math.max(1, ...values);
    const total7dRevenue = salesTimeline.reduce((sum, pt) => sum + Number(pt.revenue || 0), 0);
    const total7dOrders = salesTimeline.reduce((sum, pt) => sum + Number(pt.orders || 0), 0);
    return { maxVal, total7dRevenue, total7dOrders };
  }, [salesTimeline, chartMode]);

  const avgOrderValue =
    metrics.total_orders > 0 && metrics.total_sales > 0
      ? metrics.total_sales / metrics.total_orders
      : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-52 rounded-lg bg-zinc-200/70" />
            <div className="h-4 w-80 rounded bg-zinc-100" />
          </div>
          <div className="h-9 w-28 rounded-xl bg-zinc-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
              <div className="h-3 w-24 rounded bg-zinc-100" />
              <div className="h-8 w-32 rounded bg-zinc-100" />
              <div className="h-3 w-40 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 rounded-2xl border border-zinc-200/80 bg-white p-6" />
          <div className="lg:col-span-4 h-80 rounded-2xl border border-zinc-200/80 bg-white p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Executive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Store Performance
          </h1>
          <p className="text-sm text-zinc-500 mt-1 flex flex-wrap items-center gap-2">
            <span>Real-time overview of PhoneHub revenue, orders, inventory, and customers.</span>
            {lastUpdated && (
              <span className="text-xs text-zinc-400">
                • Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="rounded-xl gap-1.5 text-xs font-bold border-zinc-200 bg-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Link to="/admin/products">
            <Button
              type="button"
              size="sm"
              className="rounded-xl gap-1.5 text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Device</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* 1. Gross Revenue */}
        <Link
          to="/admin/orders"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Paid Revenue
            </span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              {formatPrice(metrics.total_sales)}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>This month: <strong className="text-zinc-800">{formatPrice(metrics.monthly_sales)}</strong></span>
              <span className="text-emerald-600 font-semibold">Today {formatPrice(metrics.today_sales)}</span>
            </div>
          </div>
        </Link>

        {/* 2. Total Orders */}
        <Link
          to="/admin/orders"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Orders
            </span>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              {metrics.total_orders.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={metrics.pending_orders > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {metrics.pending_orders > 0
                  ? `${metrics.pending_orders} awaiting fulfillment`
                  : 'All orders processed'}
              </span>
              {avgOrderValue > 0 && (
                <span className="text-zinc-400">Avg {formatPrice(avgOrderValue)}</span>
              )}
            </div>
          </div>
        </Link>

        {/* 3. Registered Customers */}
        <Link
          to="/admin/customers"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Registered Customers
            </span>
            <Users className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              {metrics.total_customers.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Verified storefront accounts</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 transition" />
            </div>
          </div>
        </Link>

        {/* 4. Catalog & Inventory */}
        <Link
          to="/admin/inventory"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Catalog Devices
            </span>
            <Smartphone className="h-4 w-4 text-zinc-700" />
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              {metrics.total_products.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={metrics.low_stock_count > 0 ? 'text-amber-600 font-semibold' : 'text-zinc-500'}>
                {metrics.low_stock_count} low stock
              </span>
              <span className="text-zinc-300">•</span>
              <span className={metrics.out_of_stock_count > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {metrics.out_of_stock_count} out of stock
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Analytics Row: 7-Day Activity Chart + Action Center & Top Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Sales & Orders Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-zinc-700" />
                <h2 className="text-base font-bold text-zinc-950">7-Day Performance</h2>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {chartMode === 'revenue'
                  ? `Paid revenue over the last 7 days: ${formatPrice(chartStats.total7dRevenue)}`
                  : `Total orders placed over the last 7 days: ${chartStats.total7dOrders}`}
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200/70 self-start">
              <button
                type="button"
                onClick={() => setChartMode('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMode === 'revenue'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setChartMode('orders')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  chartMode === 'orders'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Interactive Bar Chart */}
          <div className="pt-8 pb-2">
            {salesTimeline.length > 0 ? (
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52">
                {salesTimeline.map((pt, idx) => {
                  const val = chartMode === 'revenue' ? pt.revenue : pt.orders;
                  const pct = val > 0 ? Math.max(10, Math.round((val / chartStats.maxVal) * 100)) : 4;
                  const isHovered = hoveredIdx === idx;
                  const isToday = idx === salesTimeline.length - 1;

                  return (
                    <div
                      key={pt.date}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="relative flex flex-col items-center justify-end h-full group cursor-pointer"
                    >
                      {/* Hover Value Label */}
                      <div
                        className={`mb-2 text-[11px] font-bold transition-all whitespace-nowrap ${
                          isHovered || val > 0
                            ? 'text-zinc-900 opacity-100'
                            : 'text-zinc-300 opacity-70'
                        }`}
                      >
                        {chartMode === 'revenue'
                          ? val > 0
                            ? formatPrice(val)
                            : '$0'
                          : `${val}`}
                      </div>

                      {/* Bar Track */}
                      <div className="w-full max-w-[44px] flex-1 flex items-end justify-center">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            val === 0
                              ? 'bg-zinc-100'
                              : isHovered
                              ? 'bg-red-600'
                              : isToday
                              ? 'bg-zinc-950'
                              : 'bg-zinc-800/85'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>

                      {/* X-Axis Day Label */}
                      <div className="mt-2.5 text-center">
                        <p className={`text-xs font-bold ${isToday ? 'text-zinc-950' : 'text-zinc-500'}`}>
                          {pt.day}
                        </p>
                        <p className="text-[10px] text-zinc-400 hidden sm:block">
                          {pt.date.slice(5)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-xs text-zinc-400">
                No activity data recorded in the past 7 days.
              </div>
            )}
          </div>
        </div>

        {/* Right: Attention Required + Top Brands */}
        <div className="lg:col-span-4 space-y-5">
          {/* Operational Alerts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3.5">
            <h2 className="text-sm font-bold text-zinc-950">Action Center</h2>

            <div className="space-y-2">
              <Link
                to="/admin/orders"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 hover:border-zinc-300 hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className={`h-4 w-4 ${metrics.pending_orders > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Pending Fulfillment</p>
                    <p className="text-[11px] text-zinc-500">Orders needing action</p>
                  </div>
                </div>
                <span className="text-sm font-black text-zinc-950">{metrics.pending_orders}</span>
              </Link>

              <Link
                to="/admin/inventory"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 hover:border-zinc-300 hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={`h-4 w-4 ${metrics.low_stock_count > 0 ? 'text-amber-600' : 'text-zinc-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Low Stock Variants</p>
                    <p className="text-[11px] text-zinc-500">5 or fewer units remaining</p>
                  </div>
                </div>
                <span className="text-sm font-black text-zinc-950">{metrics.low_stock_count}</span>
              </Link>

              <Link
                to="/admin/inventory"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 hover:border-zinc-300 hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  {metrics.out_of_stock_count > 0 ? (
                    <PackageX className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Out of Stock</p>
                    <p className="text-[11px] text-zinc-500">Requires restocking</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-black ${
                    metrics.out_of_stock_count > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {metrics.out_of_stock_count}
                </span>
              </Link>
            </div>
          </div>

          {/* Top Brands Breakdown */}
          {topBrands.length > 0 && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-950">Top Catalog Brands</h2>
                <Link
                  to="/admin/products"
                  className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950 transition"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {topBrands.map((b) => {
                  const maxCount = Math.max(1, topBrands[0]?.products_count || 1);
                  const widthPct = Math.round((b.products_count / maxCount) * 100);
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800">{b.name}</span>
                        <span className="font-bold text-zinc-500">{b.products_count} models</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Customer Orders Table */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Recent Customer Orders</h2>
            <p className="text-xs text-zinc-500">Latest storefront transactions and fulfillment progress</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-100 border border-zinc-200/60">
              {(['all', 'pending', 'confirmed', 'delivered'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOrderFilter(tab)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition cursor-pointer ${
                    orderFilter === tab
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 hover:text-zinc-950 pl-2 transition"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Items</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const itemsCount =
                    o.items?.reduce((sum, it) => sum + Number(it.quantity || 1), 0) ?? 1;
                  const isPaid = o.payment_status === 'paid';
                  return (
                    <tr key={o.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 pr-4">
                        <Link
                          to="/admin/orders"
                          className="font-mono text-xs font-extrabold text-zinc-950 hover:text-red-600 transition"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-zinc-500 whitespace-nowrap">
                        {formatDateTime(o.created_at)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="text-xs font-bold text-zinc-900">
                          {o.user?.name || o.shipping_address_snapshot?.full_name || 'Guest'}
                        </p>
                        {(o.user?.email || (o.shipping_address_snapshot as any)?.email) && (
                          <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                            {o.user?.email || (o.shipping_address_snapshot as any)?.email}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-zinc-600">
                        {itemsCount} {itemsCount === 1 ? 'unit' : 'units'}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isPaid ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isPaid ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-extrabold text-zinc-950 whitespace-nowrap">
                        {formatPrice(o.total_amount)}
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <Badge tone={orderStatusTone(o.status)} dot>
                          {statusLabel(o.status)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400 text-xs">
                    No matching orders found.
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
