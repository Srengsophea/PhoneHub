<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService) {}

    protected function getActiveCart(Request $request)
    {
        $user = $request->user('sanctum');
        $sessionId = $request->header('X-Guest-Session-Id') ?? $request->input('guest_session_id');

        return $this->cartService->getCart($user, $sessionId);
    }

    public function show(Request $request): JsonResponse
    {
        $cart = $this->getActiveCart($request);

        return response()->json([
            'success' => true,
            'data' => $this->cartService->formatCartResponse($cart),
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1|max:10',
        ]);

        $cart = $this->getActiveCart($request);

        try {
            $updatedCart = $this->cartService->addItem(
                $cart,
                (int) $validated['product_id'],
                $validated['variant_id'] ? (int) $validated['variant_id'] : null,
                (int) ($validated['quantity'] ?? 1)
            );

            return response()->json([
                'success' => true,
                'message' => 'Product added to cart.',
                'data' => $updatedCart,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function updateItem(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0|max:10',
        ]);

        try {
            $cart = $this->cartService->updateQuantity($id, (int) $validated['quantity']);

            return response()->json([
                'success' => true,
                'message' => 'Cart updated.',
                'data' => $cart,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function removeItem(int $id): JsonResponse
    {
        $cart = $this->cartService->removeItem($id);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
            'data' => $cart,
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getActiveCart($request);
        $this->cartService->clearCart($cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
            'data' => $this->cartService->formatCartResponse($cart->fresh()),
        ]);
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $cart = $this->getActiveCart($request);
        $user = $request->user('sanctum');

        $result = $this->cartService->applyCoupon($cart, $validated['code'], $user);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $result['cart'],
        ]);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getActiveCart($request);
        $updatedCart = $this->cartService->removeCoupon($cart);

        return response()->json([
            'success' => true,
            'message' => 'Coupon removed.',
            'data' => $updatedCart,
        ]);
    }
}
