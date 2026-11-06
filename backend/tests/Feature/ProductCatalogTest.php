<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function createProduct(string $name, float $price, ?Brand $brand = null, ?Category $category = null): Product
    {
        $brand = $brand ?? Brand::firstOrCreate(['slug' => 'apple'], ['name' => 'Apple']);
        $category = $category ?? Category::firstOrCreate(['slug' => 'smartphones'], ['name' => 'Smartphones']);

        $product = Product::create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => $name,
            'slug' => strtolower(str_replace(' ', '-', $name)),
            'sku' => 'SKU-' . rand(1000, 9999),
            'base_price' => $price,
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'sku' => $product->sku . '-V1',
            'name' => '256GB / Black',
            'price' => $price,
            'stock' => 10,
        ]);

        return $product;
    }

    public function test_can_list_active_products(): void
    {
        $this->createProduct('iPhone 16 Pro', 999.00);
        $this->createProduct('Galaxy S25 Ultra', 1299.00);

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_can_filter_products_by_brand(): void
    {
        $apple = Brand::create(['name' => 'Apple', 'slug' => 'apple']);
        $samsung = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);

        $this->createProduct('iPhone 16 Pro', 999.00, $apple);
        $this->createProduct('Galaxy S25 Ultra', 1299.00, $samsung);

        $response = $this->getJson('/api/v1/products?brand=apple');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'iPhone 16 Pro');
    }

    public function test_can_filter_products_by_price_range(): void
    {
        $this->createProduct('Budget Phone', 200.00);
        $this->createProduct('Midrange Phone', 500.00);
        $this->createProduct('Flagship Phone', 1200.00);

        $response = $this->getJson('/api/v1/products?min_price=400&max_price=800');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Midrange Phone');
    }

    public function test_can_view_product_details(): void
    {
        $product = $this->createProduct('iPhone 16 Pro Max', 1199.00);

        $response = $this->getJson("/api/v1/products/{$product->slug}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'iPhone 16 Pro Max',
                    'slug' => $product->slug,
                ],
            ]);
    }

    public function test_can_get_search_suggestions(): void
    {
        $this->createProduct('iPhone 16 Pro', 999.00);
        $this->createProduct('iPhone 15', 699.00);
        $this->createProduct('Google Pixel 9', 799.00);

        $response = $this->getJson('/api/v1/products/suggestions?q=iPhone');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
