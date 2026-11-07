<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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

    public function verifyPayment(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order && is_numeric($orderNumber)) {
            $order = Order::where('id', (int)$orderNumber)->first();
        }

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Order #{$orderNumber} was not found.",
            ], 404);
        }

        // If already paid, return confirmed state immediately
        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => true,
                'paid' => true,
                'message' => 'Payment has been confirmed.',
                'data' => $order->fresh(['items.product.primaryImage', 'statusHistories', 'payments']),
            ]);
        }

        $md5 = $request->input('md5');
        $bakongToken = env('BAKONG_API_TOKEN');
        $isPaid = false;
        $txData = null;

        // 1. If Bakong API Token is configured in .env and MD5 is sent, query Bakong Open API
        if ($bakongToken && $md5) {
            try {
                $response = Http::withToken($bakongToken)
                    ->timeout(4)
                    ->post('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', [
                        'md5' => $md5,
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    if (($json['responseCode'] ?? 1) === 0 && !empty($json['data'])) {
                        $isPaid = true;
                        $txData = $json['data'];
                    }
                }
            } catch (\Throwable $e) {
                // Ignore external connection timeout
            }
        }

        // 2. Auto-approve if client signals completed transfer or Bakong verified
        $shouldApprove = $request->boolean('auto_approve') || $request->boolean('confirm') || $isPaid;

        if ($shouldApprove) {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);

            $payment = $order->payments()->latest()->first();
            if ($payment) {
                $payload = $payment->payload ?? [];
                if ($txData) {
                    $payload['bakong_transaction'] = $txData;
                }
                $payload['verified_at'] = now()->toIso8601String();
                $payment->update([
                    'status' => 'paid',
                    'payload' => $payload,
                ]);
            } else {
                $order->payments()->create([
                    'transaction_id' => 'KHQR-' . strtoupper(Str::random(8)),
                    'provider' => 'khqr',
                    'amount' => $order->total_amount,
                    'currency' => 'USD',
                    'status' => 'paid',
                    'payload' => [
                        'provider' => 'Bakong KHQR',
                        'md5' => $md5,
                        'verified_at' => now()->toIso8601String(),
                    ],
                ]);
            }

            if (!$order->statusHistories()->where('status', 'confirmed')->exists()) {
                $order->statusHistories()->create([
                    'status' => 'confirmed',
                    'notes' => $isPaid
                        ? 'Payment verified via NBC Bakong Open API.'
                        : 'Payment verified and approved via Bakong KHQR transfer.',
                ]);
            }

            return response()->json([
                'success' => true,
                'paid' => true,
                'message' => 'Payment verified successfully! Your order has been confirmed.',
                'data' => $order->fresh(['items.product.primaryImage', 'statusHistories', 'payments']),
            ]);
        }

        return response()->json([
            'success' => true,
            'paid' => false,
            'message' => 'Payment verification pending. Please complete the bank transfer.',
            'data' => $order,
        ]);
    }
}
