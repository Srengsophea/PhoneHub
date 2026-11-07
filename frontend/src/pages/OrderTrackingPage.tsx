import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Check,
  Truck,
  MapPin,
  AlertCircle,
  Loader2,
  Printer,
  ChevronLeft,
  Copy,
} from 'lucide-react';
import api from '@/lib/api';
import { Button, Input, Badge } from '@/components/ui';
import { formatPrice, formatDateTime, orderStatusTone, statusLabel, productImage } from '@/lib/format';
import type { Order } from '@/types';
import { printOrderInvoice } from '@/lib/invoicePrinter';
import { updateLocalOrderStatus } from '@/lib/orders';
import toast from 'react-hot-toast';

export function OrderTrackingPage() {
  const { orderNumber: paramNumber } = useParams<{ orderNumber?: string }>();
  const [searchParams] = useSearchParams();
  const queryNumber =
    searchParams.get('order') ||
    searchParams.get('num') ||
    searchParams.get('tracking') ||
    searchParams.get('orderNumber') ||
    '';

  const targetNumber = (paramNumber || queryNumber || '').trim();

  const navigate = useNavigate();

  const [inputNum, setInputNum] = useState(
    targetNumber && targetNumber !== 'undefined' && targetNumber !== 'null' ? targetNumber : ''
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function track(num: string) {
      if (!num || num === 'undefined' || num === 'null') {
        setError(null);
        setOrder(null);
        return;
      }

      setLoading(true);
      setError(null);

      // Query track API endpoint directly from backend
      try {
        const { data } = await api.get(`/orders/track/${encodeURIComponent(num)}`);
        if (data?.data) {
          setOrder(data.data);
          setLoading(false);
          return;
        }
      } catch {}

      // 3. Fallback: Search all user orders
      try {
        const { data } = await api.get('/orders');
        if (Array.isArray(data?.data)) {
          const matched = data.data.find(
            (o: Order) => o.order_number?.toLowerCase() === num.toLowerCase()
          );
          if (matched) {
            setOrder(matched);
            setLoading(false);
            return;
          }
        }
      } catch {}

      setOrder(null);
      setError(`Order #${num} was not found. Please double-check your tracking ID.`);
      setLoading(false);
    }

    if (targetNumber && targetNumber !== 'undefined' && targetNumber !== 'null') {
      setInputNum(targetNumber);
      track(targetNumber);
    } else {
      setInputNum('');
      setOrder(null);
      setError(null);
    }
  }, [targetNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNum.trim()) return;
    navigate(`/orders/track/${encodeURIComponent(inputNum.trim())}`);
  };

  const [verifying, setVerifying] = useState(false);

  const handleVerifyPayment = async () => {
    if (!order) return;
    setVerifying(true);
    try {
      const res = await api.post(`/orders/${encodeURIComponent(order.order_number)}/verify-payment`);
      if (res.data?.paid) {
        toast.success('Payment verified from Bakong! Your order is now confirmed.');
        setOrder((prev) => (prev ? { ...prev, payment_status: 'paid', status: 'confirmed' } : null));
        updateLocalOrderStatus(order.order_number, 'confirmed', 'paid');
      } else {
        toast.error('Payment not detected in Bakong account yet. Please scan the KHQR code to pay.');
      }
    } catch {
      toast.error('Unable to verify payment status right now.');
    } finally {
      setVerifying(false);
    }
  };

  const copyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success(`Copied ${num} to clipboard`);
  };

  const getStepLevel = (status?: string, paymentStatus?: string): number => {
    const s = (status || '').toLowerCase().trim();
    const p = (paymentStatus || '').toLowerCase().trim();

    if (s === 'delivered') return 4;
    if (s === 'shipped' || s === 'out_for_delivery') return 3;
    if (s === 'processing' || s === 'packed') return 2;
    if (s === 'confirmed' || p === 'paid') return 2;
    if (s === 'pending') return 1;
    return 1;
  };

  const statusSteps = [
    { step: 1, label: 'Order Placed', desc: 'Order received' },
    { step: 2, label: 'Confirmed & Prepping', desc: 'Payment verified' },
    { step: 3, label: 'In Transit', desc: 'On the way' },
    { step: 4, label: 'Delivered', desc: 'Completed' },
  ];

  return (
    <div className="container-page py-12 max-w-4xl space-y-10">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 shadow-2xs">
          <Truck className="h-3.5 w-3.5 text-zinc-900" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Real-Time Logistics Tracking
          </span>
        </div>

        <h1 className="text-3xl font-black text-zinc-950 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Enter your PhoneHub tracking number (e.g. PH-2026-...) to see real-time dispatch and delivery progress.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto pt-3">
          <Input
            value={inputNum}
            onChange={(e) => setInputNum(e.target.value)}
            placeholder="Enter tracking number (e.g. PH-20261107-...)"
            className="flex-1"
          />
          <Button type="submit" loading={loading} className="rounded-md font-bold bg-zinc-950 hover:bg-zinc-800">
            Track
          </Button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-xs font-bold text-zinc-600">Retrieving tracking records...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600 space-y-2">
          <AlertCircle className="h-6 w-6 mx-auto text-red-500" />
          <p className="font-bold">{error}</p>
          <div className="pt-2">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="rounded-md text-xs font-bold">
                Go to Order History
              </Button>
            </Link>
          </div>
        </div>
      )}

      {order && !loading && (
        <div className="rounded-md border border-zinc-200 bg-white p-6 sm:p-8 space-y-8 shadow-xs">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Number</p>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-2xl font-black font-mono text-zinc-950 tracking-tight">
                  {order.order_number}
                </h2>
                <button
                  type="button"
                  onClick={() => copyOrderNumber(order.order_number)}
                  className="p-1 text-zinc-400 hover:text-zinc-900 rounded transition"
                  title="Copy Tracking Number"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Placed on {formatDateTime(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => printOrderInvoice(order)}
                className="gap-1.5 rounded-md text-xs font-bold border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50"
              >
                <Printer className="h-3.5 w-3.5 text-zinc-700" />
                <span>Print Invoice (PDF)</span>
              </Button>
              <Badge tone={orderStatusTone(order.status)} dot>
                {statusLabel(order.status)}
              </Badge>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="py-6 px-2 sm:px-4">
            {(() => {
              const currentLevel = getStepLevel(order.status, order.payment_status);
              return (
                <div className="relative">
                  {/* Progress Line Track Connecting Circles */}
                  <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 -translate-y-1/2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-950 transition-all duration-700 ease-out"
                      style={{
                        width:
                          currentLevel === 1 ? '0%' :
                          currentLevel === 2 ? '33.33%' :
                          currentLevel === 3 ? '66.66%' :
                          '100%',
                      }}
                    />
                  </div>

                  {/* 4 Interactive Status Steps */}
                  <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                    {statusSteps.map((s) => {
                      const isCompleted = s.step < currentLevel;
                      const isActive = s.step === currentLevel;

                      return (
                        <div key={s.step} className="flex flex-col items-center">
                          <div
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all duration-300 ${
                              isCompleted
                                ? 'bg-zinc-950 text-white shadow-xs ring-4 ring-white'
                                : isActive
                                ? 'bg-zinc-950 text-white ring-4 ring-zinc-900/15 shadow-md scale-105'
                                : 'bg-white text-zinc-400 border-2 border-zinc-200 ring-4 ring-white'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4 stroke-[3]" />
                            ) : isActive ? (
                              <span className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-zinc-400 opacity-75"></span>
                                <span className="relative font-mono font-black">{s.step}</span>
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-zinc-400">{s.step}</span>
                            )}
                          </div>

                          <span
                            className={`text-xs mt-3 font-extrabold uppercase tracking-wider transition-colors ${
                              isCompleted || isActive ? 'text-zinc-950' : 'text-zinc-400'
                            }`}
                          >
                            {s.label}
                          </span>
                          <span className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">
                            {s.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tracking Updates & Activity Timeline */}
          {(() => {
            const histories = (order.status_histories || (order as any).statusHistories || []) as Array<{
              status: string;
              notes?: string;
              created_at: string;
            }>;
            if (!histories.length) return null;

            return (
              <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-900" />
                  <span>Tracking Milestones & Activity</span>
                </h4>
                <div className="space-y-3 pt-1">
                  {histories.slice().reverse().map((h, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                        {i === 0 && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                            i === 0 ? 'bg-emerald-600' : 'bg-zinc-400'
                          }`}
                        ></span>
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-zinc-900 capitalize">
                            {statusLabel(h.status)}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {formatDateTime(h.created_at)}
                          </span>
                        </div>
                        {h.notes && (
                          <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{h.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Order Details & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
            {/* Items Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Items in Package
              </h4>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs gap-3 p-3 rounded-md bg-zinc-50/70 border border-zinc-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-md bg-white border border-zinc-200 flex items-center justify-center p-1">
                          <Package className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-zinc-950 truncate">{it.product_name}</p>
                          {it.variant_name && (
                            <p className="text-[11px] text-zinc-500 truncate">{it.variant_name}</p>
                          )}
                          <p className="text-[11px] text-zinc-500">Qty: {it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-zinc-950 shrink-0">
                        {formatPrice(it.subtotal ?? Number(it.unit_price) * it.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Standard Sealed Package</p>
                )}
              </div>
            </div>

            {/* Delivery & Payment Summary */}
            <div className="rounded-md bg-zinc-50 p-5 space-y-3 text-xs border border-zinc-200/80">
              <h4 className="font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Logistics & Dispatch Details
              </h4>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping Method:</span>
                <span className="font-bold text-zinc-950">{order.shipping_method || 'Express Local Dispatch'}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Payment Method:</span>
                <span className="font-bold text-zinc-950 uppercase">
                  {order.payment_method?.toUpperCase().includes('KHQR') || order.payment_method === 'bank_transfer'
                    ? 'NBC Bakong KHQR'
                    : order.payment_method === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : 'Credit / Debit Card'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 items-center">
                <span>Payment Status:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-sm text-[10px] uppercase ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {order.payment_status === 'paid' ? 'Paid / Settled' : 'Payment Pending'}
                  </span>
                  {order.payment_status !== 'paid' && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleVerifyPayment}
                      loading={verifying}
                      className="h-6 px-2.5 text-[10px] font-bold bg-[#E12326] hover:bg-[#c11b1e] text-white rounded shadow-2xs"
                    >
                      Verify Bakong Transfer
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-zinc-600 pt-3 border-t border-zinc-200">
                <span className="font-bold text-zinc-900">Total Billed:</span>
                <span className="font-black text-base text-zinc-950">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <Link to="/profile" className="text-xs font-bold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Profile & Orders</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
