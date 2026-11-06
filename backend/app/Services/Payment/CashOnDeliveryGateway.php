<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;

class CashOnDeliveryGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $paymentData = []): array
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => 'COD-' . strtoupper(Str::random(10)),
            'provider' => 'cod',
            'amount' => $order->total_amount,
            'currency' => 'USD',
            'status' => 'pending',
            'payload' => [
                'type' => 'Cash On Delivery',
                'instructions' => 'Please prepare exact cash amount upon package delivery.',
            ],
        ]);

        $order->update([
            'payment_status' => 'pending',
            'payment_method' => 'cod',
        ]);

        return [
            'success' => true,
            'payment' => $payment,
            'message' => 'Cash on delivery selected. Order is being processed.',
            'redirect_url' => null,
        ];
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        return ['status' => 'ignored', 'message' => 'COD does not require webhooks.'];
    }
}
