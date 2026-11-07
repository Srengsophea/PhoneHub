<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\CheckoutService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(
        protected CheckoutService $checkoutService,
        protected CartService $cartService
    ) {}

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:50',
            'shipping_address.address_line_1' => 'required|string|max:255',
            'shipping_address.village' => 'nullable|string|max:100',
            'shipping_address.commune' => 'nullable|string|max:100',
            'shipping_address.district' => 'nullable|string|max:100',
            'shipping_address.province' => 'nullable|string|max:100',
            'shipping_address.postal_code' => 'nullable|string|max:20',
            'shipping_address.country' => 'nullable|string|max:100',
            'shipping_address.delivery_notes' => 'nullable|string|max:500',
            'payment_method' => 'required|string|in:cod,bank_transfer,stripe,khqr',
            'shipping_method' => 'nullable|string|in:standard,express,pickup',
            'customer_notes' => 'nullable|string|max:500',
            'payment_data' => 'nullable|array',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'nullable|integer|min:1|max:10',
            'guest_session_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $sessionId = $request->header('X-Guest-Session-Id') ?? $request->input('guest_session_id');
        $cart = $this->cartService->getCart($user, $sessionId);

        // If user's cart is empty in DB, synchronize items from guest session or payload
        if ($cart->items->isEmpty()) {
            if (!empty($sessionId)) {
                $cart = $this->cartService->mergeGuestCart($sessionId, $user);
            }

            if ($cart->items->isEmpty() && !empty($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    if (!empty($itemData['product_id'])) {
                        try {
                            $this->cartService->addItem(
                                $cart,
                                (int) $itemData['product_id'],
                                !empty($itemData['variant_id']) ? (int) $itemData['variant_id'] : null,
                                (int) ($itemData['quantity'] ?? 1)
                            );
                        } catch (Exception $e) {
                            // Continue adding other items
                        }
                    }
                }
                $cart = $this->cartService->getCart($user, null);
            }
        }

        try {
            $result = $this->checkoutService->checkout(
                $user,
                $cart,
                $validated['shipping_address'],
                $validated['payment_method'],
                $validated['shipping_method'] ?? 'standard',
                $validated['customer_notes'] ?? null,
                $validated['payment_data'] ?? []
            );

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data' => [
                    'order' => $result['order'],
                    'payment' => $result['payment'],
                ],
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
