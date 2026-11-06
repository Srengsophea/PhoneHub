<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->active()
            ->with(['brand', 'category', 'variants', 'images', 'primaryImage']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhereHas('brand', function ($bq) use ($search) {
                      $bq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Brand filter (slug or ID)
        if ($brand = $request->input('brand')) {
            $query->whereHas('brand', function ($bq) use ($brand) {
                if (is_numeric($brand)) {
                    $bq->where('id', $brand);
                } else {
                    $bq->where('slug', $brand);
                }
            });
        }

        // Category filter (slug or ID)
        if ($category = $request->input('category')) {
            $query->whereHas('category', function ($cq) use ($category) {
                if (is_numeric($category)) {
                    $cq->where('id', $category);
                } else {
                    $cq->where('slug', $category);
                }
            });
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', (float) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', (float) $request->input('max_price'));
        }

        // RAM & Storage filter via variants
        if ($ram = $request->input('ram')) {
            $query->whereHas('variants', function ($vq) use ($ram) {
                $vq->where('ram', 'like', "%{$ram}%");
            });
        }
        if ($storage = $request->input('storage')) {
            $query->whereHas('variants', function ($vq) use ($storage) {
                $vq->where('storage', 'like', "%{$storage}%");
            });
        }

        // In Stock filter
        if ($request->boolean('in_stock')) {
            $query->whereHas('variants', function ($vq) {
                $vq->where('stock', '>', 0);
            });
        }

        // On Sale filter
        if ($request->boolean('on_sale')) {
            $query->where(function ($q) {
                $q->whereNotNull('sale_price')
                  ->orWhereHas('variants', function ($vq) {
                      $vq->whereNotNull('sale_price');
                  });
            });
        }

        // Featured filter
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Sorting
        $sort = $request->input('sort', 'featured');
        match ($sort) {
            'newest' => $query->latest(),
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            'best_selling' => $query->orderBy('is_bestseller', 'desc')->latest(),
            'highest_rated' => $query->orderBy('rating_cache', 'desc')->orderBy('reviews_count', 'desc'),
            default => $query->orderBy('is_featured', 'desc')->latest(),
        };

        $perPage = (int) $request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with([
                'brand',
                'category',
                'variants.images',
                'images',
                'specifications',
                'reviews.user',
                'reviews.images',
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $q = $request->input('q', '');
        if (strlen($q) < 2) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $products = Product::active()
            ->where('name', 'like', "%{$q}%")
            ->with(['brand', 'primaryImage'])
            ->limit(6)
            ->get(['id', 'brand_id', 'name', 'slug', 'base_price', 'sale_price']);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }
}
