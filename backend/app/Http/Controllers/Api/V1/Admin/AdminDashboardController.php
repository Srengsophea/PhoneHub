<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $totalSales = (float) Order::where('payment_status', 'paid')->sum('total_amount');
        $todaySales = (float) Order::where('payment_status', 'paid')->whereDate('created_at', $today)->sum('total_amount');
        $monthlySales = (float) Order::where('payment_status', 'paid')->where('created_at', '>=', $startOfMonth)->sum('total_amount');

        $totalOrders = Order::count();
        $pendingOrders = Order::whereIn('status', ['pending', 'processing', 'packed'])->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::count();

        $lowStockVariants = ProductVariant::where('stock', '<=', 5)->where('stock', '>', 0)->count();
        $outOfStockVariants = ProductVariant::where('stock', '<=', 0)->count();

        // 7-day sales timeline
        $salesOverTime = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $dayName = Carbon::now()->subDays($i)->format('D');
            
            $dayOrders = Order::whereDate('created_at', $date)->count();
            $dayRevenue = (float) Order::whereDate('created_at', $date)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            $salesOverTime[] = [
                'date' => $date,
                'day' => $dayName,
                'orders' => $dayOrders,
                'revenue' => round($dayRevenue, 2),
            ];
        }

        // Category distribution
        $categoriesRevenue = Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'products_count']);

        // Top brands
        $topBrands = Brand::withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'products_count']);

        // Recent Orders
        $recentOrders = Order::with(['user:id,name,email', 'items'])
            ->latest()
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_sales' => round($totalSales, 2),
                    'today_sales' => round($todaySales, 2),
                    'monthly_sales' => round($monthlySales, 2),
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'total_customers' => $totalCustomers,
                    'total_products' => $totalProducts,
                    'low_stock_count' => $lowStockVariants,
                    'out_of_stock_count' => $outOfStockVariants,
                ],
                'sales_over_time' => $salesOverTime,
                'category_distribution' => $categoriesRevenue,
                'top_brands' => $topBrands,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }
}
