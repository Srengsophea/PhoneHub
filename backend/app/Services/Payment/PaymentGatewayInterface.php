<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;

interface PaymentGatewayInterface
{
    /**
     * Process order payment.
     *
     * @param Order $order
     * @param array $paymentData
     * @return array ['success' => bool, 'payment' => Payment, 'message' => string, 'redirect_url' => ?string]
     */
    public function process(Order $order, array $paymentData = []): array;

    /**
     * Handle incoming gateway webhook.
     *
     * @param array $payload
     * @param string|null $signature
     * @return array
     */
    public function handleWebhook(array $payload, ?string $signature = null): array;
}
