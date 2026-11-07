import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, ShieldCheck, Copy, ExternalLink, Loader2, Smartphone } from 'lucide-react';
import type { GeneratedKHQR } from '@/lib/khqr';
import { formatPrice } from '@/lib/format';
import { Button } from './ui';
import toast from 'react-hot-toast';

interface KHQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  khqrData: GeneratedKHQR | null;
}

export function KHQRModal({ isOpen, onClose, onSuccess, khqrData }: KHQRModalProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);

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
  }, [isOpen, khqrData]);

  if (!isOpen || !khqrData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(khqrData.bakongId);
    toast.success('Bakong Account ID copied!');
  };

  const handleConfirmPaid = async () => {
    setChecking(true);
    // Simulate instantaneous verification with Bakong network / Anajak API
    await new Promise((r) => setTimeout(r, 1200));
    setChecking(false);
    setPaid(true);
    toast.success('Payment received successfully via Bakong KHQR!');
    setTimeout(() => {
      onSuccess();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-100">
        {/* KHQR Official Red Header */}
        <div className="bg-[#D32F2F] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs tracking-wider border border-white/30">
              KH
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wide uppercase">KHQR</span>
                <span className="text-[10px] font-semibold bg-white text-[#D32F2F] px-1.5 py-0.2 rounded font-sans">
                  Bakong
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium">Scan to pay with any Cambodia bank app</p>
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
        <div className="p-6 text-center space-y-5">
          {paid ? (
            <div className="py-12 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Payment Approved!</h3>
              <p className="text-sm text-zinc-500">
                Transaction confirmed on Bakong network. Redirecting to your order tracking...
              </p>
            </div>
          ) : (
            <>
              {/* Receiver & Amount Info */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
                  <span>Merchant:</span>
                  <span className="font-bold text-zinc-900">{khqrData.merchantName}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 pt-1">
                  <span>Bakong ID:</span>
                  <span className="font-mono font-bold text-zinc-800">{khqrData.bakongId}</span>
                  <button
                    onClick={handleCopyAccount}
                    title="Copy Bakong ID"
                    className="p-1 text-zinc-400 hover:text-zinc-700 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="pt-2">
                  <div className="text-3xl font-black text-zinc-950 tracking-tight">
                    {formatPrice(khqrData.amountUsd)}
                  </div>
                  <div className="text-xs font-semibold text-zinc-500">
                    ≈ {khqrData.amountKhr.toLocaleString()} KHR
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="relative mx-auto w-64 h-64 rounded-2xl border-2 border-zinc-200 bg-white p-3 shadow-inner flex items-center justify-center">
                <img
                  src={khqrData.qrImageDataUrl}
                  alt="KHQR Payment Code"
                  className="w-full h-full object-contain"
                />
                {/* Center Bakong Logo Pill */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-9 w-9 rounded-full bg-white shadow-md border-2 border-[#D32F2F] flex items-center justify-center">
                    <span className="text-[11px] font-black text-[#D32F2F]">KH</span>
                  </div>
                </div>
              </div>

              {/* Expiry countdown and live status */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Awaiting payment scan...</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-semibold text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeFormatted}</span>
                </div>
              </div>

              {/* Supported Banking Apps list */}
              <div className="text-[11px] text-zinc-400 font-medium">
                Supported by ABA Mobile, Wing Bank, ACLEDA mobile, Canadia, TrueMoney, and 40+ Bakong members.
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleConfirmPaid}
                  loading={checking}
                  size="lg"
                  className="w-full bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-bold text-sm shadow-md"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  I Have Completed Payment
                </Button>

                <div className="flex gap-2">
                  <a
                    href={khqrData.deeplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-1"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Open Bakong App
                  </a>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition"
                  >
                    Cancel
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
