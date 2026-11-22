<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Exception;

class CartService
{
    public function getCart(?User $user, ?string $sessionId): Cart
    {
        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        } elseif ($sessionId) {
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        } else {
            $cart = Cart::create();
        }

        return $cart->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function addItem(Cart $cart, int $productId, ?int $variantId = null, int $quantity = 1): Cart
    {
        $product = Product::with('variants')->findOrFail($productId);

        $price = $product->sale_price ?? $product->base_price;
        $variant = null;

        if ($variantId) {
            $variant = ProductVariant::where('product_id', $productId)->where('id', $variantId)->firstOrFail();
        } elseif ($product->variants->isNotEmpty()) {
            // Auto-assign the default in-stock variant so stock limits are always enforced
            $variant = $product->variants->first(fn ($v) => $v->stock > 0) ?? $product->variants->first();
            $variantId = $variant?->id;
        }

        if ($variant) {
            $price = $variant->sale_price ?? $variant->price;

            if ($variant->stock <= 0) {
                throw new Exception('This option is currently out of stock.');
            }
            if ($variant->stock < $quantity) {
                throw new Exception("Only {$variant->stock} items available in stock.");
            }
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($item) {
            $newQuantity = $item->quantity + $quantity;
            if ($variant && $variant->stock < $newQuantity) {
                throw new Exception("Cannot add more. Only {$variant->stock} available in stock.");
            }
            $item->update([
                'quantity' => $newQuantity,
                'unit_price' => $price,
            ]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'unit_price' => $price,
            ]);
        }

        return $this->formatCartResponse($cart->fresh());
    }

    public function updateQuantity(int $cartItemId, int $quantity): Cart
    {
        $item = CartItem::with(['variant', 'product.variants'])->findOrFail($cartItemId);
        $cart = $item->cart;

        if ($quantity <= 0) {
            $item->delete();
        } else {
            $variant = $item->variant;
            if (!$variant && $item->product && $item->product->variants->isNotEmpty()) {
                $variant = $item->product->variants->first(fn ($v) => $v->stock > 0) ?? $item->product->variants->first();
                if ($variant) {
                    $item->variant_id = $variant->id;
                }
            }

            if ($variant && $variant->stock < $quantity) {
                throw new Exception("Only {$variant->stock} items available in stock.");
            }
            $item->update([
                'variant_id' => $item->variant_id,
                'quantity' => $quantity,
            ]);
        }

        return $this->formatCartResponse($cart->fresh());
    }

    public function removeItem(int $cartItemId): Cart
    {
        $item = CartItem::findOrFail($cartItemId);
        $cart = $item->cart;
        $item->delete();

        return $this->formatCartResponse($cart->fresh());
    }

    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
        $cart->update(['coupon_id' => null]);
    }

    public function applyCoupon(Cart $cart, string $code, ?User $user = null): array
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();
        if (!$coupon) {
            return ['success' => false, 'message' => 'Coupon code does not exist.'];
        }

        $check = $coupon->isValidFor($user, $cart->subtotal);
        if (!$check['valid']) {
            return ['success' => false, 'message' => $check['message']];
        }

        $cart->update(['coupon_id' => $coupon->id]);

        return [
            'success' => true,
            'message' => 'Coupon applied successfully.',
            'cart' => $this->formatCartResponse($cart->fresh()),
        ];
    }

    public function removeCoupon(Cart $cart): Cart
    {
        $cart->update(['coupon_id' => null]);
        return $this->formatCartResponse($cart->fresh());
    }

    public function mergeGuestCart(string $sessionId, User $user): Cart
    {
        $guestCart = Cart::where('session_id', $sessionId)->first();
        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

        if ($guestCart && $guestCart->id !== $userCart->id) {
            foreach ($guestCart->items as $guestItem) {
                $existing = CartItem::where('cart_id', $userCart->id)
                    ->where('product_id', $guestItem->product_id)
                    ->where('variant_id', $guestItem->variant_id)
                    ->first();

                if ($existing) {
                    $existing->update(['quantity' => $existing->quantity + $guestItem->quantity]);
                } else {
                    $guestItem->update(['cart_id' => $userCart->id]);
                }
            }

            if ($guestCart->coupon_id && !$userCart->coupon_id) {
                $userCart->update(['coupon_id' => $guestCart->coupon_id]);
            }

            $guestCart->delete();
        }

        return $this->formatCartResponse($userCart->fresh());
    }

    public function formatCartResponse(Cart $cart): Cart
    {
        $cart->load(['items.product.images', 'items.product.variants', 'items.variant', 'coupon']);
        // Attach dynamic attributes
        $cart->subtotal = $cart->subtotal;
        $cart->discount_amount = $cart->discount_amount;
        $cart->shipping_fee = $cart->shipping_fee;
        $cart->tax_amount = $cart->tax_amount;
        $cart->total_amount = $cart->total_amount;

        return $cart;
    }
}
