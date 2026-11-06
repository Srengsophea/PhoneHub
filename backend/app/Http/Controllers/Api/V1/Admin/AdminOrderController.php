<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function __construct(protected InventoryService $inventoryService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user:id,name,email,phone', 'items', 'payments']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        $orders = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with([
            'user',
            'items.product.primaryImage',
            'statusHistories.changedByUser:id,name',
            'payments',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,processing,packed,shipped,out_for_delivery,delivered,cancelled,refunded',
            'notes' => 'nullable|string|max:500',
            'payment_status' => 'nullable|string|in:pending,paid,failed,refunded',
        ]);

        $order->addStatusHistory(
            $validated['status'],
            $validated['notes'] ?? "Status changed to {$validated['status']}",
            $request->user()->id
        );

        if (!empty($validated['payment_status'])) {
            $order->update(['payment_status' => $validated['payment_status']]);
            if ($validated['payment_status'] === 'paid' && $order->payments()->exists()) {
                $order->payments()->latest()->first()->update(['status' => 'paid']);
            }
        }

        // If cancelled or refunded, restore stock automatically
        if (in_array($validated['status'], ['cancelled', 'refunded'])) {
            $itemsForRestock = $order->items->map(fn($item) => [
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'quantity' => $item->quantity,
            ])->toArray();

            $this->inventoryService->restoreStock($itemsForRestock, $order->id, $request->user()->id, $validated['status']);
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'order_status_updated',
            'entity_type' => 'Order',
            'entity_id' => $order->id,
            'new_values' => ['status' => $validated['status'], 'payment_status' => $order->payment_status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $order->fresh(['statusHistories', 'payments']),
        ]);
    }
}
