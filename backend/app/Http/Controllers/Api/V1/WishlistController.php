<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $wishlists = Wishlist::where('user_id', $user->id)
            ->with(['product.brand', 'product.primaryImage', 'product.variants'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $wishlists,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product saved to wishlist.',
            'data' => $wishlist->load(['product.brand', 'product.primaryImage']),
        ], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $user = $request->user();
        Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product removed from wishlist.',
        ]);
    }
}
