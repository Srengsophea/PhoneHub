<?php

use App\Http\Controllers\Api\V1\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\V1\Admin\AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminInventoryController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminReviewController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\UserProfileController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Services\Payment\PaymentManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Authentication (Rate limited)
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
        });
    });

    // Public Catalog
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/suggestions', [ProductController::class, 'suggestions']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{slug}', [BrandController::class, 'show']);

    // Order Tracking (Public)
    Route::get('/orders/track/{orderNumber}', [OrderController::class, 'track']);

    // Cart Operations (Supports Guest Session + Authenticated)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'show']);
        Route::post('/items', [CartController::class, 'addItem']);
        Route::put('/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/items/{id}', [CartController::class, 'removeItem']);
        Route::delete('/', [CartController::class, 'clear']);
        Route::post('/coupon', [CartController::class, 'applyCoupon']);
        Route::delete('/coupon', [CartController::class, 'removeCoupon']);
    });

    // Payment Webhooks
    Route::post('/payment/webhook/{provider?}', function (Request $request, ?string $provider = 'stripe', PaymentManager $manager) {
        $gateway = $manager->getGateway($provider);
        $result = $gateway->handleWebhook($request->all(), $request->header('Stripe-Signature'));
        return response()->json($result);
    });

    // Customer Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Checkout & Orders
        Route::post('/checkout', [CheckoutController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);

        // Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);

        // Product Reviews
        Route::post('/reviews', [ReviewController::class, 'store']);

        // User Profile & Addresses
        Route::get('/user/dashboard', [UserProfileController::class, 'dashboard']);
        Route::put('/user/profile', [UserProfileController::class, 'updateProfile']);
        Route::put('/user/password', [UserProfileController::class, 'changePassword']);

        Route::get('/user/addresses', [UserProfileController::class, 'addresses']);
        Route::post('/user/addresses', [UserProfileController::class, 'storeAddress']);
        Route::put('/user/addresses/{id}', [UserProfileController::class, 'updateAddress']);
        Route::delete('/user/addresses/{id}', [UserProfileController::class, 'destroyAddress']);
        Route::post('/user/addresses/{id}/default', [UserProfileController::class, 'setDefaultAddress']);
    });

    // Admin Panel Protected Routes (RBAC)
    Route::middleware(['auth:sanctum', 'role:admin,super_admin,manager'])->prefix('admin')->group(function () {
        // Dashboard Stats & Analytics
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);

        // Product Management
        Route::post('/products/upload-image', [AdminProductController::class, 'uploadImage']);
        Route::apiResource('products', AdminProductController::class);

        // Inventory Management
        Route::get('/inventory', [AdminInventoryController::class, 'index']);
        Route::get('/inventory/history', [AdminInventoryController::class, 'history']);
        Route::post('/inventory/adjust', [AdminInventoryController::class, 'adjust']);

        // Order Management
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Customer Management
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{id}', [AdminCustomerController::class, 'show']);
        Route::put('/customers/{id}/toggle-status', [AdminCustomerController::class, 'toggleStatus']);

        // Coupon Management
        Route::get('/coupons', [AdminCouponController::class, 'index']);
        Route::post('/coupons', [AdminCouponController::class, 'store']);
        Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);

        // Review Moderation
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::put('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);

        // Audit Logs
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
    });

});
