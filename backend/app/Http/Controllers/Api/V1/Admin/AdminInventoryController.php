<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InventoryTransaction;
use App\Models\ProductVariant;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function __construct(protected InventoryService $inventoryService) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProductVariant::with(['product:id,name,sku,base_price,brand_id', 'product.brand:id,name']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->boolean('low_stock_only')) {
            $query->where('stock', '<=', 5);
        }

        $variants = $query->orderBy('stock', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $variants->items(),
            'meta' => [
                'current_page' => $variants->currentPage(),
                'last_page' => $variants->lastPage(),
                'total' => $variants->total(),
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $query = InventoryTransaction::with([
            'product:id,name,sku',
            'variant:id,name,sku',
            'user:id,name',
        ])->latest();

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        $history = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $history->items(),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'total' => $history->total(),
            ],
        ]);
    }

    public function adjust(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity_change' => 'required|integer|not_in:0',
            'type' => 'required|string|in:purchase,adjustment,damage,return',
            'notes' => 'nullable|string|max:500',
        ]);

        $variant = ProductVariant::findOrFail($validated['variant_id']);

        $this->inventoryService->adjustStock(
            $variant->product_id,
            $variant->id,
            (int) $validated['quantity_change'],
            $validated['type'],
            $validated['notes'] ?? null,
            $request->user()->id
        );

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'inventory_adjusted',
            'entity_type' => 'ProductVariant',
            'entity_id' => $variant->id,
            'new_values' => [
                'qty_change' => $validated['quantity_change'],
                'type' => $validated['type'],
                'new_stock' => $variant->fresh()->stock,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock adjusted successfully.',
            'data' => $variant->fresh(['product']),
        ]);
    }
}
