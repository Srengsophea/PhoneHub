<?php

namespace App\Services;

use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\ProductVariant;
use Exception;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Deduct stock for an array of ordered items with strict pessimistic row locking.
     *
     * @param array $items Array of ['product_id' => int, 'variant_id' => ?int, 'quantity' => int]
     * @param int $orderId Order reference ID
     * @param int|null $userId User performing checkout
     * @throws Exception
     */
    public function deductStock(array $items, int $orderId, ?int $userId = null): void
    {
        DB::transaction(function () use ($items, $orderId, $userId) {
            foreach ($items as $item) {
                $qty = (int) $item['quantity'];

                if (!empty($item['variant_id'])) {
                    /** @var ProductVariant $variant */
                    $variant = ProductVariant::where('id', $item['variant_id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($variant->stock < $qty) {
                        throw new Exception("Insufficient stock for {$variant->name}. Only {$variant->stock} left.");
                    }

                    $variant->decrement('stock', $qty);
                    $newBalance = $variant->fresh()->stock;

                    InventoryTransaction::create([
                        'product_id' => $variant->product_id,
                        'variant_id' => $variant->id,
                        'type' => 'sale',
                        'quantity_change' => -$qty,
                        'balance_after' => $newBalance,
                        'reference_type' => 'App\\Models\\Order',
                        'reference_id' => $orderId,
                        'notes' => "Sale deduction for Order #{$orderId}",
                        'user_id' => $userId,
                    ]);
                } else {
                    /** @var Product $product */
                    $product = Product::where('id', $item['product_id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    // For products without variants
                    $defaultVariant = $product->variants()->first();
                    if ($defaultVariant) {
                        if ($defaultVariant->stock < $qty) {
                            throw new Exception("Insufficient stock for {$product->name}.");
                        }
                        $defaultVariant->decrement('stock', $qty);
                        $newBalance = $defaultVariant->fresh()->stock;
                        $variantId = $defaultVariant->id;
                    } else {
                        $newBalance = 0;
                        $variantId = null;
                    }

                    InventoryTransaction::create([
                        'product_id' => $product->id,
                        'variant_id' => $variantId,
                        'type' => 'sale',
                        'quantity_change' => -$qty,
                        'balance_after' => $newBalance,
                        'reference_type' => 'App\\Models\\Order',
                        'reference_id' => $orderId,
                        'notes' => "Sale deduction for Order #{$orderId}",
                        'user_id' => $userId,
                    ]);
                }
            }
        });
    }

    /**
     * Restore stock upon order cancellation or return.
     */
    public function restoreStock(array $items, int $orderId, ?int $userId = null, string $reason = 'cancellation'): void
    {
        DB::transaction(function () use ($items, $orderId, $userId, $reason) {
            foreach ($items as $item) {
                $qty = (int) $item['quantity'];

                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::where('id', $item['variant_id'])
                        ->lockForUpdate()
                        ->first();

                    if ($variant) {
                        $variant->increment('stock', $qty);
                        $newBalance = $variant->fresh()->stock;

                        InventoryTransaction::create([
                            'product_id' => $variant->product_id,
                            'variant_id' => $variant->id,
                            'type' => $reason,
                            'quantity_change' => $qty,
                            'balance_after' => $newBalance,
                            'reference_type' => 'App\\Models\\Order',
                            'reference_id' => $orderId,
                            'notes' => "Restocked due to order {$reason}",
                            'user_id' => $userId,
                        ]);
                    }
                }
            }
        });
    }

    /**
     * Admin manual stock adjustment.
     */
    public function adjustStock(int $productId, ?int $variantId, int $qtyChange, string $type, ?string $notes = null, ?int $userId = null): void
    {
        DB::transaction(function () use ($productId, $variantId, $qtyChange, $type, $notes, $userId) {
            if ($variantId) {
                $variant = ProductVariant::where('id', $variantId)
                    ->lockForUpdate()
                    ->firstOrFail();

                $newBalance = max(0, $variant->stock + $qtyChange);
                $actualChange = $newBalance - $variant->stock;
                $variant->update(['stock' => $newBalance]);

                InventoryTransaction::create([
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'type' => $type,
                    'quantity_change' => $actualChange,
                    'balance_after' => $newBalance,
                    'notes' => $notes,
                    'user_id' => $userId,
                ]);
            }
        });
    }
}
