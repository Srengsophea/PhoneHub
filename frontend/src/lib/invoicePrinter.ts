import type { Order } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/format';

export function printOrderInvoice(order: Order): void {
  const invoiceNumber = `INV-${order.order_number}`;
  const isPaid = order.payment_status === 'paid';
  const shipping = order.shipping_address_snapshot as any;
  const customerName = shipping?.full_name || order.user?.name || 'Valued Customer';
  const customerPhone = shipping?.phone || order.user?.phone || 'N/A';
  const customerAddress = shipping
    ? `${shipping.address_line_1 || ''}, ${shipping.city || ''} ${shipping.province || ''}, ${shipping.country || 'Cambodia'}`
    : 'Phnom Penh, Cambodia';

  const paymentMethodLabel =
    order.payment_method?.toUpperCase().includes('KHQR') || order.payment_method === 'bank_transfer'
      ? 'National Bank of Cambodia — Bakong KHQR (Verified)'
      : order.payment_method === 'cod'
      ? 'Cash on Delivery (COD)'
      : 'Credit / Debit Card';

  const logoUrl = window.location.origin + '/phonehub_logo.png';

  const itemsHtml =
    order.items && order.items.length > 0
      ? order.items
          .map((item) => {
            const unitPrice = formatPrice(item.unit_price);
            const lineTotal = formatPrice(item.subtotal ?? Number(item.unit_price) * item.quantity);
            return `
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7;">
                  <div style="font-weight: 700; color: #09090b; font-size: 13px;">${item.product_name}</div>
                  ${item.variant_name ? `<div style="font-size: 11px; color: #71717a; margin-top: 2px;">Spec: ${item.variant_name}</div>` : ''}
                  <div style="font-size: 10px; color: #059669; font-weight: 600; margin-top: 2px;">✓ 1-Year Official Manufacturer Warranty Included</div>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: center; font-weight: 700; color: #27272a;">${item.quantity}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; color: #3f3f46;">${unitPrice}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-weight: 800; color: #09090b;">${lineTotal}</td>
              </tr>
            `;
          })
          .join('')
      : `
          <tr>
            <td colspan="4" style="padding: 16px; text-align: center; color: #71717a;">Standard Device Order</td>
          </tr>
        `;

  const subtotalFormatted = formatPrice(order.subtotal || order.total_amount);
  const discountFormatted = Number(order.discount_amount) > 0 ? formatPrice(order.discount_amount) : null;
  const shippingFormatted = Number(order.shipping_fee) === 0 ? 'FREE' : formatPrice(order.shipping_fee);
  const grandTotalFormatted = formatPrice(order.total_amount);

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${order.order_number}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #09090b;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.45;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e4e4e7;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .brand-logo {
          height: 38px;
          width: auto;
          object-contain: contain;
        }
        .brand-text {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #09090b;
        }
        .brand-text span {
          color: #dc2626;
        }
        .company-meta {
          font-size: 11px;
          color: #71717a;
          line-height: 1.4;
        }
        .invoice-title-block {
          text-align: right;
        }
        .invoice-title {
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin: 0 0 6px 0;
          color: #09090b;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 6px;
          background: ${isPaid ? '#ecfdf5' : '#fffbeb'};
          color: ${isPaid ? '#047857' : '#b45309'};
          border: 1px solid ${isPaid ? '#a7f3d0' : '#fde68a'};
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          background: #fbfbfb;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .meta-col h3 {
          margin: 0 0 6px 0;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #71717a;
        }
        .meta-name {
          font-size: 14px;
          font-weight: 800;
          color: #09090b;
          margin-bottom: 2px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .table th {
          border-bottom: 2px solid #09090b;
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #09090b;
        }
        .totals-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-top: 1px solid #e4e4e7;
          padding-top: 16px;
          margin-bottom: 24px;
        }
        .warranty-box {
          max-width: 320px;
          font-size: 11px;
          color: #71717a;
          line-height: 1.45;
        }
        .totals-box {
          width: 250px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
          color: #52525b;
        }
        .totals-row.grand {
          border-top: 2px solid #09090b;
          padding-top: 8px;
          margin-top: 4px;
          font-size: 15px;
          font-weight: 900;
          color: #09090b;
        }
        .footer-stamp {
          border-top: 1px dashed #d4d4d8;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 10px;
          color: #a1a1aa;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div>
          <div class="brand-container">
            <img src="${logoUrl}" alt="PhoneHub" class="brand-logo" id="invoice-logo">
            <div class="brand-text">Phone<span>Hub</span></div>
          </div>
          <div class="company-meta">
            <strong>PhoneHub Flagship Store Cambodia</strong><br>
            Building 12, St. 2004, Phnom Penh, Cambodia<br>
            Tax ID: K008-902348712 • Tel: +855 87 656 560
          </div>
        </div>

        <div class="invoice-title-block">
          <div class="invoice-title">Official Invoice</div>
          <div style="font-size: 11px; font-weight: 700; color: #09090b;">
            Invoice No: <span style="font-family: monospace;">${invoiceNumber}</span>
          </div>
          <div style="font-size: 11px; color: #71717a;">
            Order Ref: <span style="font-family: monospace; font-weight: 600; color: #09090b;">${order.order_number}</span>
          </div>
          <div style="font-size: 11px; color: #71717a;">
            Date: ${formatDateTime(order.created_at)}
          </div>
          <div>
            <span class="status-badge">${isPaid ? '✓ PAID / SETTLED' : 'PAYMENT PENDING'}</span>
          </div>
        </div>
      </div>

      <!-- Customer & Payment Details -->
      <div class="meta-grid">
        <div class="meta-col">
          <h3>Billed & Shipped To:</h3>
          <div class="meta-name">${customerName}</div>
          <div style="color: #3f3f46; font-weight: 600;">${customerPhone}</div>
          <div style="color: #71717a; margin-top: 2px;">${customerAddress}</div>
        </div>

        <div class="meta-col" style="text-align: right;">
          <h3>Payment Method & Dispatch:</h3>
          <div style="font-size: 12px; font-weight: 800; color: #09090b;">${paymentMethodLabel}</div>
          <div style="color: #71717a; margin-top: 2px;">Fulfillment: Express Local Dispatch</div>
          ${order.paid_at ? `<div style="font-size: 11px; color: #71717a;">Settled: ${formatDateTime(order.paid_at)}</div>` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table class="table">
        <thead>
          <tr>
            <th style="text-align: left;">Description & Specifications</th>
            <th style="text-align: center; width: 60px;">Qty</th>
            <th style="text-align: right; width: 100px;">Unit Price</th>
            <th style="text-align: right; width: 110px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals & Warranty -->
      <div class="totals-section">
        <div class="warranty-box">
          <div style="font-weight: 800; color: #09090b; margin-bottom: 4px;">
            ✓ 1-Year Official Warranty & Authenticity Guaranteed
          </div>
          Thank you for choosing PhoneHub. All devices are factory sealed and genuine. Please retain this invoice as proof of purchase for warranty and manufacturer service.
        </div>

        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span style="font-weight: 700; color: #09090b;">${subtotalFormatted}</span>
          </div>
          ${
            discountFormatted
              ? `<div class="totals-row" style="color: #059669; font-weight: 600;">
                  <span>Discount:</span>
                  <span>-${discountFormatted}</span>
                </div>`
              : ''
          }
          <div class="totals-row">
            <span>Shipping:</span>
            <span style="font-weight: 700; color: #09090b;">${shippingFormatted}</span>
          </div>
          <div class="totals-row">
            <span>Estimated VAT (0%):</span>
            <span style="font-weight: 700; color: #09090b;">$0.00</span>
          </div>
          <div class="totals-row grand">
            <span>Grand Total:</span>
            <span>${grandTotalFormatted}</span>
          </div>
        </div>
      </div>

      <!-- Authentication Stamp -->
      <div class="footer-stamp">
        <div>
          <div style="font-family: monospace; font-weight: 700; color: #52525b;">AUTH-STAMP: PH-KH-${order.order_number}-CERTIFIED</div>
          <div style="margin-top: 2px;">Generated electronically • Certified valid without physical signature</div>
        </div>
        <div style="text-align: right;">
          <div style="border-bottom: 1px solid #71717a; width: 140px; padding-bottom: 3px; margin-bottom: 3px; font-weight: 800; color: #27272a; text-align: center;">
            PhoneHub Dispatch
          </div>
          <div style="text-align: center; font-size: 9px;">Authorized Representative</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create an isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(invoiceHtml);
  doc.close();

  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    document.body.removeChild(iframe);
    return;
  }

  // Ensure image logo is loaded before triggering print preview
  const logoImg = doc.getElementById('invoice-logo') as HTMLImageElement | null;
  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 2000);
  };

  if (logoImg && !logoImg.complete) {
    logoImg.onload = triggerPrint;
    logoImg.onerror = triggerPrint;
    // Safety fallback in case image load takes longer than 600ms
    setTimeout(triggerPrint, 600);
  } else {
    setTimeout(triggerPrint, 150);
  }
}
