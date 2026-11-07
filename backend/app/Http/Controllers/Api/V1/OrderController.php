<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with(['items.product.primaryImage', 'payments'])
            ->latest()
            ->paginate(10);

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

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->with([
                'items.product.primaryImage',
                'statusHistories',
                'payments',
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function track(string $orderNumber): JsonResponse
    {
        if (empty($orderNumber) || $orderNumber === 'undefined' || $orderNumber === 'null') {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid PhoneHub tracking number.',
            ], 400);
        }

        $order = Order::where('order_number', $orderNumber)
            ->with([
                'items.product.primaryImage',
                'statusHistories',
            ])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Order #{$orderNumber} was not found. Please double-check your tracking ID.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}
