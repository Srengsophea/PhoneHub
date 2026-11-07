<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;

class BankTransferGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $paymentData = []): array
    {
        $refNumber = 'KHQR-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => $refNumber,
            'provider' => 'khqr',
            'amount' => $order->total_amount,
            'currency' => 'USD',
            'status' => 'pending',
            'payload' => [
                'bank_name' => 'Bakong KHQR (All Banks)',
                'account_name' => 'PhoneHub',
                'account_number' => 'sophea_sreng2@bkrt',
                'reference_code' => $order->order_number,
                'bakong_id' => 'sophea_sreng2@bkrt',
                'khqr_payload' => '00020101021229220018sophea_sreng2@bkrt520459995303840540' . strlen(number_format($order->total_amount, 2, '.', '')) . number_format($order->total_amount, 2, '.', '') . '5802KH5908PhoneHub6010Phnom Penh6304',
            ],
        ]);

        $order->update([
            'payment_status' => 'pending',
            'payment_method' => 'khqr',
        ]);

        return [
            'success' => true,
            'payment' => $payment,
            'message' => 'Bank transfer details generated. Please complete payment using KHQR.',
            'redirect_url' => null,
            'bank_info' => $payment->payload,
        ];
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        // For automated bank webhook callbacks (e.g. ABA PayWay webhook)
        $txId = $payload['tran_id'] ?? null;
        if ($txId) {
            $payment = Payment::where('transaction_id', $txId)->first();
            if ($payment) {
                $payment->update([
                    'status' => 'paid',
                    'payload' => array_merge($payment->payload ?? [], ['webhook' => $payload]),
                ]);
                $payment->order->update(['payment_status' => 'paid']);
                $payment->order->addStatusHistory('confirmed', 'Payment received via Bank KHQR.');
                return ['success' => true];
            }
        }
        return ['success' => false, 'message' => 'Payment not found.'];
    }
}
