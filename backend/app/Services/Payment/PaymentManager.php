<?php

namespace App\Services\Payment;

use InvalidArgumentException;

class PaymentManager
{
    public function getGateway(string $method): PaymentGatewayInterface
    {
        return match (strtolower($method)) {
            'cod', 'cash_on_delivery' => new CashOnDeliveryGateway(),
            'bank_transfer', 'khqr' => new BankTransferGateway(),
            'stripe', 'card' => new StripeGateway(),
            default => throw new InvalidArgumentException("Unsupported payment method: {$method}"),
        };
    }
}
