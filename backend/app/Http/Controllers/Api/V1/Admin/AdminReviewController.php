<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['product:id,name,slug', 'user:id,name,email', 'images']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $reviews = $query->latest()->paginate(20);

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

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:approved,pending,rejected',
        ]);

        $review->update(['status' => $validated['status']]);

        // Recalculate product rating
        $avgRating = Review::where('product_id', $review->product_id)->where('status', 'approved')->avg('rating');
        $reviewsCount = Review::where('product_id', $review->product_id)->where('status', 'approved')->count();

        Product::where('id', $review->product_id)->update([
            'rating_cache' => round($avgRating ?? 5.0, 2),
            'reviews_count' => $reviewsCount,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'review_status_updated',
            'entity_type' => 'Review',
            'entity_id' => $review->id,
            'new_values' => ['status' => $validated['status']],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Review {$validated['status']}.",
            'data' => $review->fresh(),
        ]);
    }
}
