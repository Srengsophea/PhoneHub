import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button, Input, Badge } from '@/components/ui';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel } from '@/lib/format';
import type { Order } from '@/types';

export function OrderTrackingPage() {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();

  const [inputNum, setInputNum] = useState(orderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function track(num: string) {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/orders/track/${encodeURIComponent(num)}`);
        setOrder(data.data);
      } catch (err: any) {
        setOrder(null);
        setError(err.response?.data?.message || 'Order not found. Please double-check your tracking ID.');
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      setInputNum(orderNumber);
      track(orderNumber);
    }
  }, [orderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNum.trim()) return;
    navigate(`/orders/track/${encodeURIComponent(inputNum.trim())}`);
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepStatus = (stepKey: string, currentStatus?: string) => {
    const orderIndex = statusSteps.findIndex((s) => s.key === currentStatus);
    const thisIndex = statusSteps.findIndex((s) => s.key === stepKey);
    if (thisIndex <= orderIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="container-page py-12 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Enter your PhoneHub tracking number (e.g. PH-2026-...) to see real-time dispatch and delivery progress.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto pt-4">
          <Input
            value={inputNum}
            onChange={(e) => setInputNum(e.target.value)}
            placeholder="Enter tracking number..."
            className="flex-1"
          />
          <Button type="submit" loading={loading}>
            Track
          </Button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
          {error}
        </div>
      )}

      {order && !loading && (
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 space-y-8 shadow-soft">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Number</p>
              <h2 className="text-xl font-extrabold text-zinc-900 mt-0.5">{order.order_number}</h2>
              <p className="text-xs text-zinc-500 mt-1">Placed on {formatDateTime(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={orderStatusTone(order.status)} dot>
                {statusLabel(order.status)}
              </Badge>
            </div>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center py-4">
            {statusSteps.map((s, idx) => {
              const st = getStepStatus(s.key, order.status);
              return (
                <div key={s.key} className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition ${
                      st === 'completed'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                    }`}
                  >
                    {st === 'completed' ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${st === 'completed' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Order Details & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                Items in Package
              </h4>
              <div className="space-y-3">
                {order.items?.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-zinc-900">{it.product_name}</p>
                      <p className="text-xs text-zinc-500">Qty: {it.quantity}</p>
                    </div>
                    <span className="font-bold text-zinc-900">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-zinc-400 mb-2">Delivery Summary</h4>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping Method:</span>
                <span className="font-medium text-zinc-900">{order.shipping_method || 'Express Dispatch'}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Payment Method:</span>
                <span className="font-medium text-zinc-900 uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-zinc-600 pt-2 border-t border-zinc-200">
                <span className="font-semibold text-zinc-900">Total Billed:</span>
                <span className="font-bold text-sm text-zinc-900">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

