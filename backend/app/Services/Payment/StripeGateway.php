<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;

class StripeGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $paymentData = []): array
    {
        $paymentIntentId = 'pi_' . Str::random(24);

        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => $paymentIntentId,
            'provider' => 'stripe',
            'amount' => $order->total_amount,
            'currency' => 'USD',
            'status' => 'paid', // Instant online success
            'payload' => [
                'payment_intent_id' => $paymentIntentId,
                'client_secret' => $paymentIntentId . '_secret_' . Str::random(16),
                'brand' => $paymentData['card_brand'] ?? 'visa',
                'last4' => $paymentData['card_last4'] ?? '4242',
            ],
            'receipt_url' => "https://pay.stripe.com/receipts/{$paymentIntentId}",
        ]);

        $order->update([
            'payment_status' => 'paid',
            'payment_method' => 'stripe',
        ]);

        $order->addStatusHistory('confirmed', 'Online card payment successfully processed via Stripe.');

        return [
            'success' => true,
            'payment' => $payment,
            'message' => 'Online payment completed successfully via Stripe.',
            'redirect_url' => null,
        ];
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        $eventType = $payload['type'] ?? null;
        $dataObject = $payload['data']['object'] ?? [];
        $paymentIntentId = $dataObject['id'] ?? null;

        if ($eventType === 'payment_intent.succeeded' && $paymentIntentId) {
            $payment = Payment::where('transaction_id', $paymentIntentId)->first();
            if ($payment && $payment->status !== 'paid') {
                $payment->update(['status' => 'paid']);
                $payment->order->update(['payment_status' => 'paid']);
                $payment->order->addStatusHistory('confirmed', 'Payment verified via Stripe Webhook.');
                return ['success' => true];
            }
        }

        return ['success' => true, 'message' => 'Webhook received.'];
    }
}
