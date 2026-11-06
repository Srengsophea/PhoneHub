<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartAndCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setupProductWithStock(int $stock = 10, float $price = 999.00): array
    {
        $brand = Brand::create(['name' => 'Apple', 'slug' => 'apple']);
        $category = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones']);

        $product = Product::create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => 'iPhone 16 Pro',
            'slug' => 'iphone-16-pro',
            'sku' => 'IP16P-TEST',
            'base_price' => $price,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'IP16P-256-BLK',
            'name' => '256GB / Black',
            'price' => $price,
            'stock' => $stock,
            'is_active' => true,
        ]);

        return [$product, $variant];
    }

    public function test_can_add_item_to_cart_and_update_quantity(): void
    {
        [$product, $variant] = $this->setupProductWithStock(10, 500.00);

        // Add item
        $addResponse = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 2,
        ], ['X-Guest-Session-Id' => 'session_test_123']);

        $addResponse->assertStatus(200)
            ->assertJsonPath('data.subtotal', 1000);

        $itemId = $addResponse->json('data.items.0.id');

        // Update item quantity
        $updateResponse = $this->putJson("/api/v1/cart/items/{$itemId}", [
            'quantity' => 3,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.subtotal', 1500);
    }

    public function test_cart_validates_stock_limit(): void
    {
        [$product, $variant] = $this->setupProductWithStock(2, 500.00);

        // Try adding 5 items when stock is only 2
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 5,
        ], ['X-Guest-Session-Id' => 'session_test_limit']);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_can_apply_valid_discount_coupon(): void
    {
        [$product, $variant] = $this->setupProductWithStock(10, 600.00);

        Coupon::create([
            'code' => 'DISCOUNT50',
            'type' => 'fixed',
            'value' => 50.00,
            'min_spend' => 200.00,
            'is_active' => true,
        ]);

        $sessionHeader = ['X-Guest-Session-Id' => 'session_coupon_test'];

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 1,
        ], $sessionHeader);

        $couponResponse = $this->postJson('/api/v1/cart/coupon', [
            'code' => 'DISCOUNT50',
        ], $sessionHeader);

        $couponResponse->assertStatus(200)
            ->assertJsonPath('data.discount_amount', 50)
            ->assertJsonPath('data.total_amount', 550);
    }

    public function test_customer_can_checkout_and_order_deducts_inventory(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        [$product, $variant] = $this->setupProductWithStock(10, 1000.00);

        // Add to user cart
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $checkoutResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/checkout', [
            'shipping_address' => [
                'full_name' => 'Customer Name',
                'phone' => '+855 12 345 678',
                'address_line_1' => 'Street 200',
                'commune' => 'Boeung Keng Kang',
                'district' => 'Chamkar Mon',
                'province' => 'Phnom Penh',
                'country' => 'Cambodia',
            ],
            'payment_method' => 'cod',
            'shipping_method' => 'standard',
        ]);

        $checkoutResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'order' => ['id', 'order_number', 'total_amount'],
                    'payment',
                ],
            ]);

        // Stock was 10, purchased 2, should now be 8
        $this->assertEquals(8, $variant->fresh()->stock);

        // Order exists in database
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_amount' => 2000.00,
            'payment_method' => 'cod',
        ]);

        // Inventory transaction created
        $this->assertDatabaseHas('inventory_transactions', [
            'variant_id' => $variant->id,
            'type' => 'sale',
            'quantity_change' => -2,
            'balance_after' => 8,
        ]);
    }
}
