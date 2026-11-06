<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category', 'variants', 'primaryImage']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($brandId = $request->input('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku|max:100',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_active' => 'boolean',
            'warranty_info' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.name' => 'required|string',
            'variants.*.sku' => 'required|string',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.sale_price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.color' => 'nullable|string',
            'variants.*.color_hex' => 'nullable|string',
            'variants.*.storage' => 'nullable|string',
            'variants.*.ram' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*.image_path' => 'required|string',
            'images.*.is_primary' => 'boolean',
            'specifications' => 'nullable|array',
            'specifications.*.group_name' => 'required|string',
            'specifications.*.name' => 'required|string',
            'specifications.*.value' => 'required|string',
        ]);

        $product = DB::transaction(function () use ($validated, $request) {
            $slug = Str::slug($validated['name']);
            // Ensure unique slug
            if (Product::where('slug', $slug)->exists()) {
                $slug .= '-' . strtolower(Str::random(4));
            }

            $prod = Product::create(array_merge($validated, ['slug' => $slug]));

            // Add variants
            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $v) {
                    $prod->variants()->create($v);
                }
            } else {
                // Create default variant with product base price and stock
                $prod->variants()->create([
                    'sku' => $prod->sku . '-DEF',
                    'name' => 'Standard',
                    'price' => $prod->base_price,
                    'sale_price' => $prod->sale_price,
                    'stock' => 10,
                ]);
            }

            // Add images
            if (!empty($validated['images'])) {
                foreach ($validated['images'] as $i => $img) {
                    $prod->images()->create([
                        'image_path' => $img['image_path'],
                        'is_primary' => $img['is_primary'] ?? ($i === 0),
                        'display_order' => $i,
                    ]);
                }
            }

            // Add specifications
            if (!empty($validated['specifications'])) {
                foreach ($validated['specifications'] as $i => $spec) {
                    $prod->specifications()->create([
                        'group_name' => $spec['group_name'],
                        'name' => $spec['name'],
                        'value' => $spec['value'],
                        'display_order' => $i,
                    ]);
                }
            }

            // Audit log
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'product_created',
                'entity_type' => 'Product',
                'entity_id' => $prod->id,
                'new_values' => $prod->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $prod->load(['brand', 'category', 'variants', 'images', 'specifications']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'variants', 'images', 'specifications'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'brand_id' => 'sometimes|required|exists:brands,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'sku' => "sometimes|required|string|max:100|unique:products,sku,{$id}",
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'base_price' => 'sometimes|required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_active' => 'boolean',
            'warranty_info' => 'nullable|string',
            'variants' => 'nullable|array',
            'specifications' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        DB::transaction(function () use ($product, $validated, $request) {
            $oldValues = $product->toArray();
            $product->update($validated);

            if (isset($validated['variants'])) {
                // If existing variant IDs are passed, update or create
                foreach ($validated['variants'] as $v) {
                    if (isset($v['id']) && $v['id']) {
                        ProductVariant::where('id', $v['id'])->where('product_id', $product->id)->update([
                            'name' => $v['name'],
                            'sku' => $v['sku'],
                            'price' => $v['price'],
                            'sale_price' => $v['sale_price'] ?? null,
                            'stock' => $v['stock'],
                            'color' => $v['color'] ?? null,
                            'color_hex' => $v['color_hex'] ?? null,
                            'storage' => $v['storage'] ?? null,
                            'ram' => $v['ram'] ?? null,
                        ]);
                    } else {
                        $product->variants()->create($v);
                    }
                }
            }

            if (isset($validated['images'])) {
                $product->images()->delete();
                foreach ($validated['images'] as $i => $img) {
                    $product->images()->create([
                        'image_path' => $img['image_path'],
                        'is_primary' => $img['is_primary'] ?? ($i === 0),
                        'display_order' => $i,
                    ]);
                }
            }

            if (isset($validated['specifications'])) {
                $product->specifications()->delete();
                foreach ($validated['specifications'] as $i => $spec) {
                    $product->specifications()->create([
                        'group_name' => $spec['group_name'],
                        'name' => $spec['name'],
                        'value' => $spec['value'],
                        'display_order' => $i,
                    ]);
                }
            }

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'product_updated',
                'entity_type' => 'Product',
                'entity_id' => $product->id,
                'old_values' => $oldValues,
                'new_values' => $product->fresh()->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product->fresh(['brand', 'category', 'variants', 'images', 'specifications']),
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
        ]);

        $file = $request->file('image');
        $fileName = 'prod_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $targetDir = public_path('images/products');

        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $file->move($targetDir, $fileName);
        $imageUrl = '/images/products/' . $fileName;

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully.',
            'url' => $imageUrl,
            'image_path' => $imageUrl,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'product_deleted',
            'entity_type' => 'Product',
            'entity_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }
}
