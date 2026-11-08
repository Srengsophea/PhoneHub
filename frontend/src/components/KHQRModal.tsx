import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, ShieldCheck, Copy, Smartphone, RefreshCw, Loader2, Sparkles, Printer, ArrowRight, Download } from 'lucide-react';
import { generateKHQR, type GeneratedKHQR } from '@/lib/khqr';
import { formatPrice } from '@/lib/format';
import { Button } from './ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { updateLocalOrderStatus } from '@/lib/orders';
import { printOrderInvoice } from '@/lib/invoicePrinter';

interface KHQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  khqrData: GeneratedKHQR | null;
  order?: any;
}

export function KHQRModal({ isOpen, onClose, onSuccess, khqrData: initialKhqrData, order }: KHQRModalProps) {
  const [khqrData, setKhqrData] = useState<GeneratedKHQR | null>(initialKhqrData);
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setKhqrData(initialKhqrData);
    if (initialKhqrData?.currency) {
      setCurrency(initialKhqrData.currency);
    }
  }, [initialKhqrData]);

  useEffect(() => {
    if (!isOpen || !khqrData) return;
    setTimeLeft(15 * 60);
    setPaid(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Real-time verification with NBC Bakong Open API (ONLY confirms if money actually received)
  useEffect(() => {
    if (!isOpen || !khqrData || paid) return;
    let isSubscribed = true;

    const poll = async () => {
      try {
        const res = await api.post(`/orders/${encodeURIComponent(khqrData.billNumber)}/verify-payment`, {
          md5: khqrData.md5,
        });

        // ONLY mark paid if Bakong API actually verified the transaction
        if (isSubscribed && res.data?.paid) {
          setPaid(true);
          setChecking(false);
          updateLocalOrderStatus(khqrData.billNumber, 'confirmed', 'paid');
          toast.success('Payment received successfully via Bakong KHQR!');
          setTimeout(() => {
            onSuccess();
          }, 1200);
        }
      } catch (err) {
        // Silently continue polling
      }
    };

    const initialTimer = setTimeout(poll, 2500);
    const interval = setInterval(poll, 3000);

    return () => {
      isSubscribed = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isOpen, khqrData?.billNumber, khqrData?.md5, paid, onSuccess]);

  if (!isOpen || !khqrData) return null;

  const handleCurrencyChange = async (newCurrency: 'USD' | 'KHR') => {
    if (newCurrency === currency) return;
    setCurrency(newCurrency);
    const regenerated = await generateKHQR(khqrData.amountUsd, khqrData.billNumber, newCurrency);
    setKhqrData(regenerated);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(khqrData.bakongId);
    toast.success('Bakong Account ID copied to clipboard!');
  };

  const handleConfirmPaid = async () => {
    if (!khqrData) return;
    setChecking(true);
    try {
      const res = await api.post(`/orders/${encodeURIComponent(khqrData.billNumber)}/verify-payment`, {
        md5: khqrData.md5,
      });

      if (res.data?.paid) {
        updateLocalOrderStatus(khqrData.billNumber, 'confirmed', 'paid');
        setPaid(true);
        toast.success('Payment verified! Your order is confirmed.');
        return;
      }

      // DO NOT mark paid if Bakong account has not received the transfer
      toast.error('Payment not detected in Bakong account yet. Please scan the QR code to complete transfer.');
    } catch (err) {
      toast.error('Unable to verify transaction with Bakong at this moment.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-100">
        {/* KHQR Official Red Header */}
        <div className="bg-[#E12326] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center font-black text-sm tracking-wider text-[#E12326] shadow-sm">
              KH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wide">KHQR</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bakong
                </span>
              </div>
              <p className="text-[11px] text-white/90 font-medium">National Bank of Cambodia Standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4">
          {paid ? (
            <div className="py-8 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-zinc-950">Payment Confirmed!</h3>
                <p className="text-xs text-zinc-500">
                  Transaction verified on the National Bank of Cambodia Bakong network.
                </p>
                {khqrData && (
                  <p className="text-xs font-mono font-bold text-zinc-800 pt-1">
                    Order #{khqrData.billNumber}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                {order && (
                  <Button
                    type="button"
                    onClick={() => printOrderInvoice(order)}
                    className="w-full text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-lg h-11 justify-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Invoice (PDF)</span>
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={onSuccess}
                  variant="outline"
                  className="w-full text-xs font-bold gap-2 border-zinc-300 hover:bg-zinc-50 rounded-lg h-11 justify-center"
                >
                  <span>View Order Tracking</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Receiver & Amount Info */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                  <span className="text-zinc-500">Merchant:</span>
                  <span className="font-bold text-zinc-900">{khqrData.merchantName}</span>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 pt-1">
                  <span>Bakong ID:</span>
                  <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                    {khqrData.bakongId}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    title="Copy Bakong ID"
                    className="p-1 text-zinc-500 hover:text-zinc-900 transition rounded hover:bg-zinc-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center justify-center gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('USD')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                      currency === 'USD'
                        ? 'bg-[#E12326] text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('KHR')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                      currency === 'KHR'
                        ? 'bg-[#E12326] text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>

                <div className="pt-2">
                  <div className="text-3xl font-black text-zinc-950 tracking-tight">
                    {currency === 'USD' ? formatPrice(khqrData.amountUsd) : `${khqrData.amountKhr.toLocaleString()} KHR`}
                  </div>
                  <div className="text-xs font-medium text-zinc-400">
                    {currency === 'USD'
                      ? `≈ ${khqrData.amountKhr.toLocaleString()} KHR`
                      : `≈ ${formatPrice(khqrData.amountUsd)} USD`}
                  </div>
                </div>
              </div>

              {/* QR Code Container: Pure, Crisp & Unobstructed for Instant Camera Scan */}
              <div className="relative mx-auto w-64 h-64 rounded-2xl border-2 border-zinc-200 bg-white p-3 shadow-inner flex items-center justify-center">
                <img
                  src={khqrData.qrImageDataUrl}
                  alt="Bakong KHQR Payment Code"
                  className="w-full h-full object-contain select-none"
                />
              </div>

              {/* Expiry countdown and live status */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span>Live Bakong detection active</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-zinc-600">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{timeFormatted}</span>
                </div>
              </div>

              {/* Supported Banking Apps */}
              <div className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                Scan with <strong className="text-zinc-600">ABA Mobile</strong>,{' '}
                <strong className="text-zinc-600">Bakong App</strong>,{' '}
                <strong className="text-zinc-600">Wing Bank</strong>,{' '}
                <strong className="text-zinc-600">ACLEDA</strong>, or any Cambodia banking app.
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleConfirmPaid}
                  loading={checking}
                  size="lg"
                  className="w-full bg-[#E12326] hover:bg-[#c11b1e] text-white font-bold text-sm shadow-md"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Check Payment Status
                </Button>

                <div className="flex gap-2">
                  <a
                    href={khqrData.deeplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                    Open in Bakong App
                  </a>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition"
                  >
                    Close & Pay Later
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
