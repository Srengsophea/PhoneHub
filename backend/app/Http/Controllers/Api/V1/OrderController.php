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
        if (!$md5) {
            $payment = $order->payments()->latest()->first();
            $md5 = $payment?->payload['md5'] ?? null;
        }

        $bakongToken = env('BAKONG_API_TOKEN');
        $isPaid = false;
        $txData = null;

        // 1. Primary settlement check: Lorndavid Bakong Gateway (https://lorndavid.online/docs)
        if ($md5) {
            try {
                $response = Http::timeout(5)->get("https://lorndavid.online/api/v1/check/{$md5}");
                if ($response->successful()) {
                    $json = $response->json();
                    if (($json['responseCode'] ?? 1) === 0 && !empty($json['data'])) {
                        $isPaid = true;
                        $txData = $json['data'];
                    }
                }
            } catch (\Throwable $e) {
                // Gateway network timeout handling
            }
        }

        // 2. Secondary fallback: Direct NBC Bakong Open API (if BAKONG_API_TOKEN is set)
        if (!$isPaid && $bakongToken && $md5) {
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

        // ONLY approve if Bakong network genuinely confirmed the transaction
        if ($isPaid) {
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
                        'bakong_transaction' => $txData,
                    ],
                ]);
            }

            $payer = $txData['fromAccountId'] ?? 'Customer';
            $order->statusHistories()->create([
                'status' => 'confirmed',
                'notes' => "Payment verified via Bakong KHQR network (Payer: {$payer}).",
            ]);

            return response()->json([
                'success' => true,
                'paid' => true,
                'message' => 'Payment confirmed on Bakong network! Your order has been confirmed.',
                'data' => $order->fresh(['items.product.primaryImage', 'statusHistories', 'payments']),
            ]);
        }

        // If Bakong has NOT confirmed payment yet, remain pending
        return response()->json([
            'success' => true,
            'paid' => false,
            'message' => 'Payment has not been received yet. Please complete the bank transfer.',
            'data' => $order,
        ]);
    }

    public function generateKhqr(Request $request, string $orderNumber): JsonResponse
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

        $currency = $request->input('currency', 'USD');
        $amount = $currency === 'KHR'
            ? round($order->total_amount * 4100)
            : round((float)$order->total_amount, 2);

        try {
            $response = Http::timeout(6)->post('https://lorndavid.online/api/v1/khqr/generate', [
                'accountId' => 'sophea_sreng2@bkrt',
                'merchantName' => 'PhoneHub',
                'amount' => $amount,
                'currency' => $currency,
                'billNumber' => $order->order_number,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $payment = $order->payments()->latest()->first();
                if ($payment) {
                    $payload = $payment->payload ?? [];
                    $payload['md5'] = $data['md5'] ?? null;
                    $payload['qr_string'] = $data['qrString'] ?? $data['qr'] ?? null;
                    $payment->update(['payload' => $payload]);
                }

                return response()->json([
                    'success' => true,
                    'data' => $data,
                ]);
            }
        } catch (\Throwable $e) {
            // Ignore
        }

        return response()->json([
            'success' => false,
            'message' => 'Unable to generate KHQR from gateway.',
        ], 500);
    }
}
