<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Payment\PaymentManager;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService
{
    public function __construct(
        protected InventoryService $inventoryService,
        protected PaymentManager $paymentManager,
        protected CartService $cartService
    ) {}

    /**
     * Complete checkout and generate an order.
     *
     * @param User $user
     * @param Cart $cart
     * @param array $shippingAddress
     * @param string $paymentMethod
     * @param string $shippingMethod
     * @param string|null $customerNotes
     * @param array $paymentData
     * @return array ['order' => Order, 'payment_result' => array]
     * @throws Exception
     */
    public function checkout(
        User $user,
        Cart $cart,
        array $shippingAddress,
        string $paymentMethod = 'cod',
        string $shippingMethod = 'standard',
        ?string $customerNotes = null,
        array $paymentData = []
    ): array {
        $cart->load(['items.product', 'items.variant', 'coupon']);

        if ($cart->items->isEmpty()) {
            throw new Exception("Cannot checkout with an empty cart.");
        }

        return DB::transaction(function () use (
            $user,
            $cart,
            $shippingAddress,
            $paymentMethod,
            $shippingMethod,
            $customerNotes,
            $paymentData
        ) {
            // 1. Prepare items and check live pricing and stock
            $orderItemsData = [];
            $itemsForInventory = [];
            $calculatedSubtotal = 0;

            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $variant = $cartItem->variant;

                $unitPrice = $variant
                    ? ($variant->sale_price ?? $variant->price)
                    : ($product->sale_price ?? $product->base_price);

                $itemSubtotal = round($unitPrice * $cartItem->quantity, 2);
                $calculatedSubtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'variant_name' => $variant ? "{$variant->color} - {$variant->storage}" : null,
                    'sku' => $variant?->sku ?? $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $itemSubtotal,
                ];

                $itemsForInventory[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'quantity' => $cartItem->quantity,
                ];
            }

            // 2. Calculate discount, shipping, tax
            $discountAmount = 0;
            $couponCode = null;
            if ($cart->coupon) {
                $validation = $cart->coupon->isValidFor($user, $calculatedSubtotal);
                if ($validation['valid']) {
                    $discountAmount = $cart->coupon->calculateDiscount($calculatedSubtotal);
                    $couponCode = $cart->coupon->code;
                }
            }

            $shippingFee = match ($shippingMethod) {
                'express' => 25.00,
                'pickup' => 0.00,
                default => ($calculatedSubtotal >= 500 ? 0.00 : 15.00),
            };

            $taxAmount = 0.00;
            $totalAmount = max(0.00, round($calculatedSubtotal - $discountAmount + $shippingFee + $taxAmount, 2));

            // 3. Generate unique order number
            $orderNumber = 'PH-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            // 4. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $paymentMethod,
                'shipping_method' => $shippingMethod,
                'subtotal' => $calculatedSubtotal,
                'discount_amount' => $discountAmount,
                'shipping_fee' => $shippingFee,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'coupon_code' => $couponCode,
                'shipping_address_snapshot' => $shippingAddress,
                'customer_notes' => $customerNotes,
            ]);

            // 5. Create Order Items
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // 6. Deduct inventory with row locks
            $this->inventoryService->deductStock($itemsForInventory, $order->id, $user->id);

            // 7. Track coupon usage
            if ($cart->coupon && $discountAmount > 0) {
                CouponUsage::create([
                    'coupon_id' => $cart->coupon->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_amount' => $discountAmount,
                ]);
                $cart->coupon->increment('used_count');
            }

            // 8. Order status history
            $order->addStatusHistory('pending', 'Order placed successfully by customer.', $user->id);

            // 9. Process payment
            $gateway = $this->paymentManager->getGateway($paymentMethod);
            $paymentResult = $gateway->process($order, $paymentData);

            // 10. Clear cart
            $this->cartService->clearCart($cart);

            return [
                'order' => $order->fresh(['items', 'statusHistories', 'payments']),
                'payment' => $paymentResult,
            ];
        });
    }
}
