import React, { useRef } from 'react';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatPrice, formatDateTime } from '@/lib/format';
import { printOrderInvoice } from '@/lib/invoicePrinter';
import type { Order } from '@/types';

interface InvoiceModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, open, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open || !order) return null;

  const handlePrint = () => {
    printOrderInvoice(order);
  };

  const invoiceNumber = `INV-${order.order_number}`;
  const isPaid = order.payment_status === 'paid';
  const shipping = order.shipping_address_snapshot as any;
  const customerName = shipping?.full_name || order.user?.name || 'Valued Customer';
  const customerPhone = shipping?.phone || order.user?.phone || 'N/A';
  const customerAddress = shipping
    ? `${shipping.address_line_1 || ''}, ${shipping.city || ''} ${shipping.province || ''}, ${shipping.country || 'Cambodia'}`
    : 'Phnom Penh, Cambodia';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-md shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Tax Invoice Preview
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-semibold text-zinc-700">{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-md font-semibold"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-print-area" ref={printRef} className="p-8 sm:p-10 space-y-8 bg-white text-zinc-900">
          {/* Header Row: Official Logo & Company Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-200 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src="/phonehub_logo.png"
                  alt="PhoneHub"
                  className="h-10 w-auto object-contain"
                />
                <span className="font-extrabold text-2xl tracking-tight text-zinc-950">
                  Phone<span className="text-red-600">Hub</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                PhoneHub Official Flagship Store • Sealed & Certified Mobile Devices
              </p>
              <p className="text-xs text-zinc-500">
                Building 12, St. 2004, Phnom Penh, Cambodia <br />
                VAT / Tax ID: K008-902348712 • Tel: +855 87 656 560
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-950">
                Official Invoice
              </h1>
              <p className="text-xs font-bold text-zinc-600">
                Invoice No: <span className="font-mono text-zinc-950">{invoiceNumber}</span>
              </p>
              <p className="text-xs text-zinc-500">
                Order Ref: <span className="font-mono text-zinc-900 font-semibold">{order.order_number}</span>
              </p>
              <p className="text-xs text-zinc-500">
                Date: {formatDateTime(order.created_at)}
              </p>
              <div className="pt-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                    isPaid ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isPaid ? 'PAID / SETTLED' : 'PAYMENT PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Meta Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50/70 p-5 rounded-md border border-zinc-200/80 text-xs">
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-zinc-500 block">
                Billed & Shipped To:
              </span>
              <p className="text-sm font-extrabold text-zinc-950">{customerName}</p>
              <p className="text-zinc-600">{customerPhone}</p>
              <p className="text-zinc-600 leading-relaxed">{customerAddress}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="font-bold uppercase tracking-wider text-zinc-500 block">
                Payment & Fulfillment:
              </span>
              <p className="text-sm font-bold text-zinc-950">
                {order.payment_method?.toUpperCase().includes('KHQR') || order.payment_method === 'bank_transfer'
                  ? 'NBC Bakong KHQR (Verified)'
                  : order.payment_method === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : 'Credit / Debit Card'}
              </p>
              <p className="text-zinc-600">
                Fulfillment: Express Local Dispatch
              </p>
              {order.paid_at && (
                <p className="text-zinc-500">
                  Settled At: {formatDateTime(order.paid_at)}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-950 text-zinc-900 uppercase font-black tracking-wider">
                  <th className="py-2.5 pr-4">Description & Specifications</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 pl-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-3 pr-4">
                        <span className="font-bold text-zinc-950 text-sm block">
                          {item.product_name}
                        </span>
                        {item.variant_name && (
                          <span className="text-xs text-zinc-500 mt-0.5 block">
                            Specification: {item.variant_name}
                          </span>
                        )}
                        <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="h-3 w-3" /> 1-Year Official Warranty Included
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-zinc-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-700">
                        {formatPrice(item.unit_price)}
                      </td>
                      <td className="py-3 pl-3 text-right font-extrabold text-zinc-950">
                        {formatPrice(item.subtotal ?? Number(item.unit_price) * item.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-zinc-500">
                      Standard Order Package
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-zinc-200">
            <div className="space-y-2 text-xs text-zinc-500 max-w-sm">
              <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Official Warranty & Authenticity Guaranteed</span>
              </div>
              <p className="leading-relaxed">
                Thank you for your order with PhoneHub. All devices are factory sealed and certified. For warranty claims or technical support, please present this receipt.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-zinc-900">
                  {formatPrice(order.subtotal || order.total_amount)}
                </span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Shipping & Handling:</span>
                <span className="font-semibold text-zinc-900">
                  {Number(order.shipping_fee) === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Estimated Tax (VAT 0%):</span>
                <span className="font-semibold text-zinc-900">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-zinc-950 text-base font-black text-zinc-950">
                <span>Grand Total:</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Official Sign-off & Barcode Footer */}
          <div className="pt-8 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-zinc-400">
            <div>
              <p className="font-mono text-zinc-500 tracking-wider">
                AUTH-STAMP: PH-KH-{order.order_number}-CERTIFIED
              </p>
              <p className="mt-1">Generated electronically • Valid without physical signature</p>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-zinc-400 pb-1 mb-1 text-center font-bold text-zinc-700">
                PhoneHub Dispatch
              </div>
              <p className="text-[10px] text-zinc-400 text-center">Authorized Representative</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
