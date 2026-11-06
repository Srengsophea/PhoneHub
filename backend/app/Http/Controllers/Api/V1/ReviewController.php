<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(int $productId): JsonResponse
    {
        $reviews = Review::where('product_id', $productId)
            ->where('status', 'approved')
            ->with(['user:id,name,avatar', 'images'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:255',
            'comment' => 'required|string|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'string', // URL or base64 or path
        ]);

        $user = $request->user();
        $productId = (int) $validated['product_id'];

        // Verify purchase: Check if user has an order containing this product
        $orderItem = OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('product_id', $productId)->first();

        // Check if user already submitted a review for this product
        $existing = Review::where('user_id', $user->id)->where('product_id', $productId)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a review for this product.',
            ], 422);
        }

        $review = DB::transaction(function () use ($validated, $user, $productId, $orderItem) {
            $r = Review::create([
                'product_id' => $productId,
                'user_id' => $user->id,
                'order_item_id' => $orderItem?->id,
                'rating' => $validated['rating'],
                'title' => $validated['title'],
                'comment' => $validated['comment'],
                'is_verified_purchase' => (bool) $orderItem,
                'status' => 'approved', // Auto-approved or moderated
            ]);

            if (!empty($validated['images'])) {
                foreach ($validated['images'] as $img) {
                    ReviewImage::create([
                        'review_id' => $r->id,
                        'image_path' => $img,
                    ]);
                }
            }

            // Recalculate product rating cache
            $avgRating = Review::where('product_id', $productId)->where('status', 'approved')->avg('rating');
            $reviewsCount = Review::where('product_id', $productId)->where('status', 'approved')->count();

            Product::where('id', $productId)->update([
                'rating_cache' => round($avgRating ?? 5.0, 2),
                'reviews_count' => $reviewsCount,
            ]);

            return $r->load(['user:id,name,avatar', 'images']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'data' => $review,
        ], 201);
    }
}
