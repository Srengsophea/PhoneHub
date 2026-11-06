<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_is_forbidden_from_admin_endpoints(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_dashboard_analytics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'metrics' => ['total_sales', 'total_orders', 'total_customers'],
                    'sales_over_time',
                    'category_distribution',
                ],
            ]);
    }

    public function test_admin_can_update_order_status_and_cancellation_restocks_inventory(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);

        $brand = Brand::create(['name' => 'Apple', 'slug' => 'apple']);
        $category = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones']);
        $product = Product::create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => 'iPhone 16 Pro',
            'slug' => 'iphone-16-pro',
            'sku' => 'IP16P-TEST',
            'base_price' => 999.00,
            'is_active' => true,
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'IP16P-256-BLK',
            'name' => '256GB / Black',
            'price' => 999.00,
            'stock' => 5, // Initially 5
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_number' => 'PH-TEST-001',
            'user_id' => $customer->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
            'subtotal' => 999.00,
            'total_amount' => 999.00,
            'shipping_address_snapshot' => ['full_name' => 'Test Customer'],
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'product_name' => $product->name,
            'sku' => $variant->sku,
            'unit_price' => 999.00,
            'quantity' => 2,
            'subtotal' => 1998.00,
        ]);

        // Admin updates status to confirmed
        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'confirmed',
            'notes' => 'Confirmed by staff',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        // Admin cancels the order -> should restock variant (+2)
        $cancelResponse = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'cancelled',
            'notes' => 'Customer requested cancellation',
        ]);

        $cancelResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');

        // Stock was 5, restocked +2, should now be 7
        $this->assertEquals(7, $variant->fresh()->stock);

        $this->assertDatabaseHas('inventory_transactions', [
            'variant_id' => $variant->id,
            'type' => 'cancelled',
            'quantity_change' => 2,
            'balance_after' => 7,
        ]);
    }
}
