<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin and Demo Customer Accounts
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('ChangeMe123!'),
                'phone' => '+855 12 888 999',
                'role' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Sophea Pich',
                'password' => Hash::make('Password123!'),
                'phone' => '+855 12 345 678',
                'role' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Demo Address for Customer
        Address::firstOrCreate(
            ['user_id' => $customer->id, 'is_default' => true],
            [
                'full_name' => 'Sophea Pich',
                'phone' => '+855 12 345 678',
                'address_line_1' => '#45, Street 240',
                'address_line_2' => 'Apartment 3B',
                'village' => 'Phum 4',
                'commune' => 'Chaktomuk',
                'district' => 'Doun Penh',
                'province' => 'Phnom Penh',
                'postal_code' => '12207',
                'country' => 'Cambodia',
                'delivery_notes' => 'Please call 10 minutes before arrival.',
                'is_default' => true,
            ]
        );

        // 2. Create Brands
        $brandsData = [
            ['name' => 'Apple', 'slug' => 'apple', 'logo' => 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'Samsung', 'slug' => 'samsung', 'logo' => 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'Google', 'slug' => 'google', 'logo' => 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'Xiaomi', 'slug' => 'xiaomi', 'logo' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'OnePlus', 'slug' => 'oneplus', 'logo' => 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'OPPO', 'slug' => 'oppo', 'logo' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'Vivo', 'slug' => 'vivo', 'logo' => 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'Realme', 'slug' => 'realme', 'logo' => 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'Honor', 'slug' => 'honor', 'logo' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'Sony', 'slug' => 'sony', 'logo' => 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'ASUS', 'slug' => 'asus', 'logo' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'Nothing', 'slug' => 'nothing', 'logo' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&fit=crop', 'is_featured' => true],
            ['name' => 'Infinix', 'slug' => 'infinix', 'logo' => 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'Tecno', 'slug' => 'tecno', 'logo' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&fit=crop', 'is_featured' => false],
            ['name' => 'Motorola', 'slug' => 'motorola', 'logo' => 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=200&fit=crop', 'is_featured' => false],
        ];

        $brands = [];
        foreach ($brandsData as $b) {
            $brands[$b['slug']] = Brand::firstOrCreate(['slug' => $b['slug']], $b);
        }

        // 3. Create Hierarchical Categories
        $catSmartphones = Category::firstOrCreate(['slug' => 'smartphones'], [
            'name' => 'Smartphones',
            'slug' => 'smartphones',
            'description' => 'Flagship, premium, and budget smartphones from leading manufacturers.',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $subCategories = [
            ['name' => 'iPhone', 'slug' => 'iphone', 'parent_id' => $catSmartphones->id],
            ['name' => 'Samsung Galaxy', 'slug' => 'samsung-galaxy', 'parent_id' => $catSmartphones->id],
            ['name' => 'Google Pixel', 'slug' => 'google-pixel', 'parent_id' => $catSmartphones->id],
            ['name' => 'Xiaomi & Redmi', 'slug' => 'xiaomi-redmi', 'parent_id' => $catSmartphones->id],
            ['name' => 'OnePlus Phones', 'slug' => 'oneplus-phones', 'parent_id' => $catSmartphones->id],
            ['name' => 'OPPO & Vivo', 'slug' => 'oppo-vivo', 'parent_id' => $catSmartphones->id],
            ['name' => 'Gaming Phones', 'slug' => 'gaming-phones', 'parent_id' => $catSmartphones->id],
        ];

        $categories = ['smartphones' => $catSmartphones];
        foreach ($subCategories as $sc) {
            $categories[$sc['slug']] = Category::firstOrCreate(['slug' => $sc['slug']], $sc);
        }

        $catAccessories = Category::firstOrCreate(['slug' => 'accessories'], [
            'name' => 'Accessories',
            'slug' => 'accessories',
            'description' => 'Chargers, cases, cables, earbuds, and protective accessories.',
            'display_order' => 2,
            'is_active' => true,
        ]);
        $categories['accessories'] = $catAccessories;

        // 4. Create 20+ Realistic Smartphones with Variants and Specs
        $phonesList = [
            // Apple
            [
                'name' => 'iPhone 16 Pro Max',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP16PM',
                'base_price' => 1199.00,
                'sale_price' => 1149.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-16-pro-max.jpg',
                'desc' => 'The ultimate iPhone with titanium design, A18 Pro chip, 48MP fusion camera system, and Camera Control.',
                'variants' => [
                    ['name' => '256GB / Natural Titanium', 'sku' => 'IP16PM-256-NAT', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Natural Titanium', 'color_hex' => '#9e968d', 'price' => 1199.00, 'sale_price' => 1149.00, 'stock' => 15],
                    ['name' => '512GB / Black Titanium', 'sku' => 'IP16PM-512-BLK', 'storage' => '512GB', 'ram' => '8GB', 'color' => 'Black Titanium', 'color_hex' => '#323234', 'price' => 1399.00, 'sale_price' => null, 'stock' => 8],
                    ['name' => '1TB / Desert Titanium', 'sku' => 'IP16PM-1TB-DES', 'storage' => '1TB', 'ram' => '8GB', 'color' => 'Desert Titanium', 'color_hex' => '#d4af8c', 'price' => 1599.00, 'sale_price' => null, 'stock' => 4],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.9" Super Retina XDR OLED', 'Resolution' => '2868 x 1320 pixels (120Hz ProMotion)'],
                    'Performance' => ['Processor' => 'Apple A18 Pro (3nm)', 'GPU' => 'Apple 6-Core GPU with Ray Tracing'],
                    'Camera' => ['Main Camera' => '48MP + 48MP Ultra-Wide + 12MP 5x Telephoto', 'Front Camera' => '12MP TrueDepth with Autofocus'],
                    'Battery' => ['Capacity' => '4685 mAh', 'Charging' => 'MagSafe 25W, Qi2 Wireless, USB-C 3.2'],
                    'Warranty' => ['Official Warranty' => '1 Year Apple Official Local Warranty'],
                ]
            ],
            [
                'name' => 'iPhone 16 Pro',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP16P',
                'base_price' => 999.00,
                'sale_price' => 949.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-16-pro.jpg',
                'desc' => 'Grade 5 titanium design with 6.3-inch display, A18 Pro chip, and pro triple camera array.',
                'variants' => [
                    ['name' => '128GB / White Titanium', 'sku' => 'IP16P-128-WHT', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'White Titanium', 'color_hex' => '#f2f1ed', 'price' => 999.00, 'sale_price' => 949.00, 'stock' => 12],
                    ['name' => '256GB / Black Titanium', 'sku' => 'IP16P-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Black Titanium', 'color_hex' => '#323234', 'price' => 1099.00, 'sale_price' => null, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.3" Super Retina XDR OLED', 'Resolution' => '2622 x 1206 pixels (120Hz ProMotion)'],
                    'Performance' => ['Processor' => 'Apple A18 Pro (3nm)', 'RAM' => '8GB Unified Memory'],
                    'Camera' => ['Main Camera' => '48MP + 48MP Ultra-Wide + 12MP 5x Telephoto'],
                    'Battery' => ['Capacity' => '3582 mAh', 'Charging' => 'Fast USB-C & MagSafe'],
                    'Warranty' => ['Official Warranty' => '1 Year Apple Official Local Warranty'],
                ]
            ],
            [
                'name' => 'iPhone 16',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP16',
                'base_price' => 799.00,
                'sale_price' => 759.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-16.jpg',
                'desc' => 'Featuring Camera Control, 48MP Fusion camera, Apple Intelligence support, and A18 chip.',
                'variants' => [
                    ['name' => '128GB / Ultramarine', 'sku' => 'IP16-128-BLU', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Ultramarine', 'color_hex' => '#3b5998', 'price' => 799.00, 'sale_price' => 759.00, 'stock' => 20],
                    ['name' => '256GB / Pink', 'sku' => 'IP16-256-PNK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Pink', 'color_hex' => '#fbcfe8', 'price' => 899.00, 'sale_price' => null, 'stock' => 14],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Super Retina XDR OLED', 'Resolution' => '2556 x 1179 pixels'],
                    'Performance' => ['Processor' => 'Apple A18 (3nm)'],
                    'Camera' => ['Main Camera' => '48MP Dual Camera System + 12MP Ultra-Wide'],
                    'Battery' => ['Capacity' => '3561 mAh'],
                ]
            ],
            [
                'name' => 'iPhone 15',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP15',
                'base_price' => 699.00,
                'sale_price' => 649.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-15.jpg',
                'desc' => 'Dynamic Island, 48MP main camera, USB-C connector, and all-day battery life.',
                'variants' => [
                    ['name' => '128GB / Black', 'sku' => 'IP15-128-BLK', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Black', 'color_hex' => '#1e293b', 'price' => 699.00, 'sale_price' => 649.00, 'stock' => 18],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Super Retina XDR OLED'],
                    'Performance' => ['Processor' => 'Apple A16 Bionic'],
                ]
            ],

            // Samsung
            [
                'name' => 'Samsung Galaxy S25 Ultra',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS25U',
                'base_price' => 1299.00,
                'sale_price' => 1249.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-s25-ultra.jpg',
                'desc' => 'Next-gen Galaxy AI powerhouse with Snapdragon 8 Elite, 200MP Quad Tele System, and built-in S Pen.',
                'variants' => [
                    ['name' => '256GB / Titanium Silver', 'sku' => 'S25U-256-SLV', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Titanium Silver', 'color_hex' => '#cbd5e1', 'price' => 1299.00, 'sale_price' => 1249.00, 'stock' => 16],
                    ['name' => '512GB / Titanium Black', 'sku' => 'S25U-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Titanium Black', 'color_hex' => '#0f172a', 'price' => 1419.00, 'sale_price' => null, 'stock' => 7],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.8" Dynamic AMOLED 2X', 'Resolution' => '3120 x 1440 (1-120Hz LTPO, 2600 nits)'],
                    'Performance' => ['Processor' => 'Qualcomm Snapdragon 8 Elite for Galaxy (3nm)', 'RAM' => '12GB / 16GB LPDDR5X'],
                    'Camera' => ['Main Camera' => '200MP OIS + 50MP 5x Periscope + 50MP Ultra-wide + 10MP 3x Telephoto'],
                    'Battery' => ['Capacity' => '5000 mAh', 'Charging' => '45W Wired, 15W Wireless, Reverse Wireless'],
                    'Features' => ['S Pen' => 'Integrated Bluetooth S Pen with Air Actions'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S25 Plus',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS25P',
                'base_price' => 999.00,
                'sale_price' => 949.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-s25-plus.jpg',
                'desc' => 'Brilliant 6.7-inch QHD+ screen, pro-grade 50MP triple camera, and Snapdragon 8 Elite speed.',
                'variants' => [
                    ['name' => '256GB / Cobalt Violet', 'sku' => 'S25P-256-VIO', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Cobalt Violet', 'color_hex' => '#581c87', 'price' => 999.00, 'sale_price' => 949.00, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Dynamic AMOLED 2X (120Hz)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Elite'],
                    'Battery' => ['Capacity' => '4900 mAh'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy Z Fold6',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGZF6',
                'base_price' => 1899.00,
                'sale_price' => 1799.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-z-fold6.jpg',
                'desc' => 'Ultra-thin, light, foldable design with massive 7.6-inch inner display and enhanced Galaxy AI multitasking.',
                'variants' => [
                    ['name' => '512GB / Navy Blue', 'sku' => 'ZF6-512-NVY', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Navy Blue', 'color_hex' => '#1e3a8a', 'price' => 1899.00, 'sale_price' => 1799.00, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Inner Display' => '7.6" Foldable Dynamic AMOLED 2X', 'Cover Display' => '6.3" Dynamic AMOLED 2X'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 for Galaxy'],
                    'Battery' => ['Capacity' => '4400 mAh'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy Z Flip6',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGFLIP6',
                'base_price' => 1099.00,
                'sale_price' => 999.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-z-flip6.jpg',
                'desc' => 'Compact pocket-sized flip phone with 50MP FlexCam, vapor chamber cooling, and FlexWindow.',
                'variants' => [
                    ['name' => '256GB / Mint', 'sku' => 'FLIP6-256-MNT', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Mint', 'color_hex' => '#a7f3d0', 'price' => 1099.00, 'sale_price' => 999.00, 'stock' => 11],
                ],
                'specs' => [
                    'Display' => ['Main Display' => '6.7" Dynamic AMOLED 2X', 'FlexWindow' => '3.4" Super AMOLED'],
                    'Camera' => ['Main Camera' => '50MP OIS + 12MP Ultra-wide'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy A55 5G',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGA55',
                'base_price' => 449.00,
                'sale_price' => 399.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-a55.jpg',
                'desc' => 'Premium metal frame, Gorilla Glass Victus+, 50MP camera with OIS, and 5000 mAh battery.',
                'variants' => [
                    ['name' => '128GB / Awesome Iceblue', 'sku' => 'A55-128-ICE', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Ice Blue', 'color_hex' => '#bfdbfe', 'price' => 449.00, 'sale_price' => 399.00, 'stock' => 25],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.6" Super AMOLED 120Hz'],
                    'Performance' => ['Processor' => 'Samsung Exynos 1480 (4nm)'],
                    'Battery' => ['Capacity' => '5000 mAh, 25W Fast Charge'],
                ]
            ],

            // Google Pixel
            [
                'name' => 'Google Pixel 9 Pro XL',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP9PXL',
                'base_price' => 1099.00,
                'sale_price' => 1049.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/google-pixel-9-pro-xl.jpg',
                'desc' => 'The biggest, best Pixel yet with Google Tensor G4, Gemini Live AI, and groundbreaking triple pro camera.',
                'variants' => [
                    ['name' => '256GB / Obsidian', 'sku' => 'P9PXL-256-OBS', 'storage' => '256GB', 'ram' => '16GB', 'color' => 'Obsidian', 'color_hex' => '#18181b', 'price' => 1099.00, 'sale_price' => 1049.00, 'stock' => 14],
                    ['name' => '512GB / Hazel', 'sku' => 'P9PXL-512-HZL', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Hazel', 'color_hex' => '#78716c', 'price' => 1219.00, 'sale_price' => null, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.8" Super Actua OLED (1-120Hz, 3000 nits)'],
                    'Performance' => ['Processor' => 'Google Tensor G4 with Titan M2 Coprocessor', 'RAM' => '16GB'],
                    'Camera' => ['Main Camera' => '50MP Octa PD + 48MP Quad PD 5x Telephoto + 48MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5060 mAh, 37W Fast Charge'],
                    'Software' => ['OS' => 'Android 15 with 7 Years of OS & Security Updates'],
                ]
            ],
            [
                'name' => 'Google Pixel 9 Pro',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP9P',
                'base_price' => 999.00,
                'sale_price' => 949.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/google-pixel-9-pro.jpg',
                'desc' => 'All the pro camera features in a compact 6.3-inch form factor with 16GB of RAM and Tensor G4.',
                'variants' => [
                    ['name' => '128GB / Porcelain', 'sku' => 'P9P-128-POR', 'storage' => '128GB', 'ram' => '16GB', 'color' => 'Porcelain', 'color_hex' => '#f5f5f4', 'price' => 999.00, 'sale_price' => 949.00, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.3" Super Actua OLED 120Hz'],
                    'Performance' => ['Processor' => 'Google Tensor G4'],
                ]
            ],
            [
                'name' => 'Google Pixel 9',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP9',
                'base_price' => 799.00,
                'sale_price' => 749.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/google-pixel-9.jpg',
                'desc' => 'Iconic dual camera design, Google AI magic features, and Actua display.',
                'variants' => [
                    ['name' => '128GB / Peony', 'sku' => 'P9-128-PEO', 'storage' => '128GB', 'ram' => '12GB', 'color' => 'Peony', 'color_hex' => '#fda4af', 'price' => 799.00, 'sale_price' => 749.00, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.3" Actua OLED 120Hz'],
                    'Camera' => ['Main Camera' => '50MP + 48MP Ultra-wide'],
                ]
            ],

            // Xiaomi
            [
                'name' => 'Xiaomi 15 Pro',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'XM15P',
                'base_price' => 929.00,
                'sale_price' => 879.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/xiaomi-15-pro.jpg',
                'desc' => 'Leica Summilux optics, Snapdragon 8 Elite, massive 6100 mAh battery, and 2K 120Hz quad-curved screen.',
                'variants' => [
                    ['name' => '512GB / Titanium Gray', 'sku' => 'XM15P-512-GRY', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Titanium Gray', 'color_hex' => '#4b5563', 'price' => 929.00, 'sale_price' => 879.00, 'stock' => 15],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.73" 2K OLED (1-120Hz LTPO, 3200 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Elite (3nm)', 'RAM' => '16GB LPDDR5X'],
                    'Camera' => ['Main Camera' => 'Triple 50MP Leica System with 5x Periscope'],
                    'Battery' => ['Capacity' => '6100 mAh, 90W HyperCharge, 50W Wireless'],
                ]
            ],
            [
                'name' => 'Xiaomi 14 Ultra',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'XM14U',
                'base_price' => 1199.00,
                'sale_price' => 1099.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/xiaomi-14-ultra.jpg',
                'desc' => '1-inch LYT-900 sensor with stepless variable aperture, quad 50MP Leica cameras, and vegan leather back.',
                'variants' => [
                    ['name' => '512GB / White Leather', 'sku' => 'XM14U-512-WHT', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'White', 'color_hex' => '#fafaf9', 'price' => 1199.00, 'sale_price' => 1099.00, 'stock' => 6],
                ],
                'specs' => [
                    'Camera' => ['Main Sensor' => '1-inch Sony LYT-900 (50MP)'],
                    'Battery' => ['Capacity' => '5000 mAh, 90W Wired'],
                ]
            ],
            [
                'name' => 'Redmi Note 14 Pro+',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'RN14PP',
                'base_price' => 389.00,
                'sale_price' => 349.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/redmi-note-14-pro-plus.jpg',
                'desc' => '200MP OIS camera, IP68 dust & water resistance, 6200 mAh massive silicon-carbon battery.',
                'variants' => [
                    ['name' => '256GB / Midnight Black', 'sku' => 'RN14PP-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Midnight Black', 'color_hex' => '#111827', 'price' => 389.00, 'sale_price' => 349.00, 'stock' => 28],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 1.5K AMOLED 120Hz'],
                    'Battery' => ['Capacity' => '6200 mAh, 90W TurboCharge'],
                ]
            ],

            // OnePlus
            [
                'name' => 'OnePlus 13',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OP13',
                'base_price' => 899.00,
                'sale_price' => 849.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/oneplus-13.jpg',
                'desc' => 'Hasselblad 50MP triple cameras, Snapdragon 8 Elite, 6000 mAh glacier battery with 100W SUPERVOOC.',
                'variants' => [
                    ['name' => '256GB / Arctic Dawn', 'sku' => 'OP13-256-WHT', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Arctic Dawn', 'color_hex' => '#e2e8f0', 'price' => 899.00, 'sale_price' => 849.00, 'stock' => 14],
                    ['name' => '512GB / Obsidian Black', 'sku' => 'OP13-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Obsidian Black', 'color_hex' => '#1e293b', 'price' => 999.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.82" 2K Oriental Screen (120Hz LTPO)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Elite', 'RAM' => '12GB / 16GB LPDDR5X'],
                    'Camera' => ['Main Camera' => 'Triple 50MP Hasselblad with Sony LYT-808'],
                    'Battery' => ['Capacity' => '6000 mAh, 100W Wired, 50W Wireless'],
                ]
            ],
            [
                'name' => 'OnePlus 12R',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OP12R',
                'base_price' => 499.00,
                'sale_price' => 449.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/oneplus-12r.jpg',
                'desc' => 'Flagship performance killer with 4th-gen LTPO 120Hz display and Snapdragon 8 Gen 2.',
                'variants' => [
                    ['name' => '128GB / Iron Gray', 'sku' => 'OP12R-128-GRY', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Iron Gray', 'color_hex' => '#475569', 'price' => 499.00, 'sale_price' => 449.00, 'stock' => 19],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K AMOLED (1-120Hz LTPO 4.0)'],
                    'Battery' => ['Capacity' => '5500 mAh, 100W Charging'],
                ]
            ],

            // OPPO & Vivo
            [
                'name' => 'OPPO Find X8 Pro',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OFX8P',
                'base_price' => 1099.00,
                'sale_price' => 1049.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/oppo-find-x8-pro.jpg',
                'desc' => 'Dual periscope telephoto system with Hasselblad imaging, Dimensity 9400 power, and Quick Button.',
                'variants' => [
                    ['name' => '512GB / Space Black', 'sku' => 'FX8P-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Space Black', 'color_hex' => '#18181b', 'price' => 1099.00, 'sale_price' => 1049.00, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" Infinite View AMOLED (120Hz)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 9400 (3nm)'],
                    'Camera' => ['Main Camera' => 'Quad 50MP Hasselblad with Dual Periscope (3x & 6x)'],
                    'Battery' => ['Capacity' => '5910 mAh, 80W Wired, 50W Wireless'],
                ]
            ],
            [
                'name' => 'Vivo X100 Pro',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VX100P',
                'base_price' => 999.00,
                'sale_price' => 899.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/vivo-x100-pro.jpg',
                'desc' => 'ZEISS APO Floating Telephoto camera with V3 imaging chip and 1-inch main sensor.',
                'variants' => [
                    ['name' => '512GB / Sunset Orange', 'sku' => 'X100P-512-ORG', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Sunset Orange', 'color_hex' => '#ea580c', 'price' => 999.00, 'sale_price' => 899.00, 'stock' => 7],
                ],
                'specs' => [
                    'Camera' => ['Main Camera' => '50MP 1-inch Sony IMX989 + 50MP ZEISS APO + 50MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5400 mAh, 100W Dual-Cell FlashCharge'],
                ]
            ],
            [
                'name' => 'Realme GT 6 5G',
                'brand' => 'realme',
                'category' => 'smartphones',
                'sku' => 'RMGT6',
                'base_price' => 549.00,
                'sale_price' => 499.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/realme-gt-6-5g.jpg',
                'desc' => 'World-record 6000-nit ultra-bright display, Snapdragon 8s Gen 3, and 120W SUPERVOOC charge.',
                'variants' => [
                    ['name' => '256GB / Fluid Silver', 'sku' => 'GT6-256-SLV', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Fluid Silver', 'color_hex' => '#94a3b8', 'price' => 549.00, 'sale_price' => 499.00, 'stock' => 16],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 8T LTPO AMOLED (6000 nits Peak)'],
                    'Battery' => ['Capacity' => '5500 mAh, 120W Charge (50% in 10 mins)'],
                ]
            ],

            // Additional Flagships & Popular Models
            [
                'name' => 'iPhone 16 Plus',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP16PLS',
                'base_price' => 899.00,
                'sale_price' => 849.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-16-plus.jpg',
                'desc' => 'Spacious 6.7-inch Super Retina XDR OLED, A18 3nm silicon, 48MP Fusion camera, and industry-leading battery life.',
                'variants' => [
                    ['name' => '128GB / Ultramarine', 'sku' => 'IP16PLS-128-BLU', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Ultramarine', 'color_hex' => '#3b5998', 'price' => 899.00, 'sale_price' => 849.00, 'stock' => 16],
                    ['name' => '256GB / White', 'sku' => 'IP16PLS-256-WHT', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'White', 'color_hex' => '#f8fafc', 'price' => 999.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Retina XDR OLED', 'Resolution' => '2796 x 1290 pixels'],
                    'Performance' => ['Processor' => 'Apple A18 (3nm)'],
                    'Camera' => ['Main Camera' => '48MP Dual System + 12MP Ultra-wide'],
                    'Battery' => ['Capacity' => '4674 mAh'],
                ]
            ],
            [
                'name' => 'iPhone 15 Pro Max',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP15PM',
                'base_price' => 1099.00,
                'sale_price' => 999.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-15-pro-max.jpg',
                'desc' => 'Aerospace Grade 5 titanium, A17 Pro powerhouse chip, customized Action Button, and 5x optical telephoto camera.',
                'variants' => [
                    ['name' => '256GB / Natural Titanium', 'sku' => 'IP15PM-256-NAT', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Natural Titanium', 'color_hex' => '#9e968d', 'price' => 1099.00, 'sale_price' => 999.00, 'stock' => 12],
                    ['name' => '512GB / Blue Titanium', 'sku' => 'IP15PM-512-BLU', 'storage' => '512GB', 'ram' => '8GB', 'color' => 'Blue Titanium', 'color_hex' => '#1e293b', 'price' => 1299.00, 'sale_price' => null, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Retina XDR OLED (120Hz ProMotion)'],
                    'Performance' => ['Processor' => 'Apple A17 Pro (3nm)'],
                    'Camera' => ['Main Camera' => '48MP + 12MP 5x Telephoto + 12MP Ultra-wide'],
                ]
            ],
            [
                'name' => 'iPhone 14',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP14',
                'base_price' => 599.00,
                'sale_price' => 549.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-14.jpg',
                'desc' => 'Super Retina XDR OLED display, durable Ceramic Shield front, dual-camera system with Photonic Engine, and Crash Detection.',
                'variants' => [
                    ['name' => '128GB / Midnight', 'sku' => 'IP14-128-MID', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Midnight', 'color_hex' => '#0f172a', 'price' => 599.00, 'sale_price' => 549.00, 'stock' => 20],
                    ['name' => '256GB / Starlight', 'sku' => 'IP14-256-STA', 'storage' => '256GB', 'ram' => '6GB', 'color' => 'Starlight', 'color_hex' => '#f1f5f9', 'price' => 699.00, 'sale_price' => null, 'stock' => 15],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Super Retina XDR OLED'],
                    'Performance' => ['Processor' => 'Apple A15 Bionic'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S25',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS25',
                'base_price' => 799.00,
                'sale_price' => 749.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-s25.jpg',
                'desc' => 'Compact flagship speed with Snapdragon 8 Elite, 50MP triple camera system, and on-device Galaxy AI assistant.',
                'variants' => [
                    ['name' => '128GB / Silver Shadow', 'sku' => 'S25-128-SLV', 'storage' => '128GB', 'ram' => '12GB', 'color' => 'Silver Shadow', 'color_hex' => '#cbd5e1', 'price' => 799.00, 'sale_price' => 749.00, 'stock' => 18],
                    ['name' => '256GB / Mint', 'sku' => 'S25-256-MNT', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Mint', 'color_hex' => '#86efac', 'price' => 869.00, 'sale_price' => null, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.2" Dynamic AMOLED 2X 120Hz'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Elite for Galaxy (3nm)'],
                    'Battery' => ['Capacity' => '4000 mAh, 25W Fast Charge'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS24U',
                'base_price' => 1199.00,
                'sale_price' => 1049.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-s24-ultra.jpg',
                'desc' => 'Corning Gorilla Armor anti-reflective glass, titanium chassis, 200MP Quad-Tele camera, and integrated Bluetooth S Pen.',
                'variants' => [
                    ['name' => '256GB / Titanium Gray', 'sku' => 'S24U-256-GRY', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Titanium Gray', 'color_hex' => '#71717a', 'price' => 1199.00, 'sale_price' => 1049.00, 'stock' => 14],
                    ['name' => '512GB / Titanium Violet', 'sku' => 'S24U-512-VIO', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Titanium Violet', 'color_hex' => '#581c87', 'price' => 1349.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.8" QHD+ Dynamic AMOLED 2X (1-120Hz LTPO)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 for Galaxy'],
                    'Camera' => ['Main Camera' => '200MP + 50MP 5x Periscope + 12MP Ultra-wide + 10MP 3x'],
                    'Battery' => ['Capacity' => '5000 mAh, 45W Fast Charge'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S24 FE',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS24FE',
                'base_price' => 649.00,
                'sale_price' => 599.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-s24-fe.jpg',
                'desc' => 'Flagship Galaxy AI tools on a massive 6.7-inch 120Hz AMOLED display with ProVisual Engine.',
                'variants' => [
                    ['name' => '128GB / Blue', 'sku' => 'S24FE-128-BLU', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Blue', 'color_hex' => '#93c5fd', 'price' => 649.00, 'sale_price' => 599.00, 'stock' => 16],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Dynamic AMOLED 2X 120Hz'],
                    'Performance' => ['Processor' => 'Samsung Exynos 2400e (4nm)'],
                    'Battery' => ['Capacity' => '4700 mAh'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy A35 5G',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGA35',
                'base_price' => 349.00,
                'sale_price' => 299.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-a35.jpg',
                'desc' => 'Awesome 120Hz Super AMOLED screen, 50MP optical image stabilization, IP67 water proofing, and Knox Security.',
                'variants' => [
                    ['name' => '128GB / Awesome Lilac', 'sku' => 'A35-128-LIL', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Awesome Lilac', 'color_hex' => '#e9d5ff', 'price' => 349.00, 'sale_price' => 299.00, 'stock' => 25],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.6" Super AMOLED 120Hz'],
                    'Battery' => ['Capacity' => '5000 mAh, 25W Fast Charge'],
                ]
            ],
            [
                'name' => 'Google Pixel 9 Pro Fold',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP9PF',
                'base_price' => 1799.00,
                'sale_price' => 1699.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/google-pixel-9-pro-fold.jpg',
                'desc' => 'Thinnest foldable smartphone with 8.0-inch Super Actua Flex inner display, Google Tensor G4, and pro triple camera with 5x telephoto.',
                'variants' => [
                    ['name' => '256GB / Obsidian', 'sku' => 'P9PF-256-OBS', 'storage' => '256GB', 'ram' => '16GB', 'color' => 'Obsidian', 'color_hex' => '#18181b', 'price' => 1799.00, 'sale_price' => 1699.00, 'stock' => 5],
                    ['name' => '512GB / Porcelain', 'sku' => 'P9PF-512-POR', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Porcelain', 'color_hex' => '#f5f5f4', 'price' => 1929.00, 'sale_price' => null, 'stock' => 3],
                ],
                'specs' => [
                    'Display' => ['Inner Display' => '8.0" Super Actua Flex (1-120Hz, 2700 nits)', 'Outer Display' => '6.3" Actua OLED 120Hz'],
                    'Performance' => ['Processor' => 'Google Tensor G4 (4nm)'],
                    'Battery' => ['Capacity' => '4650 mAh, 45W Fast Charging'],
                ]
            ],
            [
                'name' => 'Google Pixel 8a',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP8A',
                'base_price' => 499.00,
                'sale_price' => 429.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/google-pixel-8a.jpg',
                'desc' => 'Flagship Tensor G3 AI capabilities, Best Take, Audio Magic Eraser, and silky-smooth 120Hz Actua display.',
                'variants' => [
                    ['name' => '128GB / Bay Blue', 'sku' => 'P8A-128-BLU', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Bay Blue', 'color_hex' => '#60a5fa', 'price' => 499.00, 'sale_price' => 429.00, 'stock' => 18],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Actua OLED 120Hz'],
                    'Performance' => ['Processor' => 'Google Tensor G3'],
                    'Camera' => ['Main Camera' => '64MP Dual Camera System + 13MP Ultra-wide'],
                ]
            ],
            [
                'name' => 'Xiaomi 15',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'XM15',
                'base_price' => 799.00,
                'sale_price' => 749.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/xiaomi-15.jpg',
                'desc' => 'Golden size 6.36-inch compact flagship with ultra-narrow bezels, Snapdragon 8 Elite, and Leica Summilux lens.',
                'variants' => [
                    ['name' => '256GB / Emerald Green', 'sku' => 'XM15-256-GRN', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Emerald Green', 'color_hex' => '#065f46', 'price' => 799.00, 'sale_price' => 749.00, 'stock' => 15],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.36" 1.5K OLED (1-120Hz LTPO, 3200 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Elite (3nm)'],
                    'Battery' => ['Capacity' => '5400 mAh, 90W HyperCharge, 50W Wireless'],
                ]
            ],
            [
                'name' => 'POCO F6 Pro',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'POCF6P',
                'base_price' => 499.00,
                'sale_price' => 449.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/poco-f6-pro.jpg',
                'desc' => 'Hyper-performance flagship redefined: WQHD+ 120Hz Flow AMOLED, Snapdragon 8 Gen 2, 50MP Light Fusion 800 sensor, and 120W charging.',
                'variants' => [
                    ['name' => '256GB / Black', 'sku' => 'F6P-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Black', 'color_hex' => '#1e293b', 'price' => 499.00, 'sale_price' => 449.00, 'stock' => 20],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 2K 120Hz AMOLED (4000 nits Peak)'],
                    'Battery' => ['Capacity' => '5000 mAh, 120W HyperCharge'],
                ]
            ],
            [
                'name' => 'POCO X6 Pro 5G',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'POCX6P',
                'base_price' => 329.00,
                'sale_price' => 289.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/poco-x6-pro.jpg',
                'desc' => 'Dimensity 8300-Ultra gaming powerhouse with CrystalRes 120Hz Flow AMOLED and 64MP triple camera with OIS.',
                'variants' => [
                    ['name' => '256GB / Yellow', 'sku' => 'X6P-256-YEL', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Yellow', 'color_hex' => '#eab308', 'price' => 329.00, 'sale_price' => 289.00, 'stock' => 24],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 1.5K AMOLED 120Hz'],
                    'Battery' => ['Capacity' => '5000 mAh, 67W Turbo Charge'],
                ]
            ],
            [
                'name' => 'OnePlus Open',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OPOPEN',
                'base_price' => 1499.00,
                'sale_price' => 1399.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/oneplus-open.jpg',
                'desc' => 'Lightweight flagship foldable with dual 120Hz 2K ProXDR displays, Hasselblad triple camera array, and Open Canvas multitasking.',
                'variants' => [
                    ['name' => '512GB / Emerald Dusk', 'sku' => 'OPEN-512-GRN', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Emerald Dusk', 'color_hex' => '#047857', 'price' => 1499.00, 'sale_price' => 1399.00, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Main Display' => '7.82" Flexi-fluid AMOLED 120Hz', 'Cover Display' => '6.31" Super Fluid AMOLED 120Hz'],
                    'Performance' => ['Processor' => 'Qualcomm Snapdragon 8 Gen 2'],
                    'Battery' => ['Capacity' => '4805 mAh, 67W Fast Charge'],
                ]
            ],
            [
                'name' => 'OnePlus Nord 4 5G',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OPN4',
                'base_price' => 399.00,
                'sale_price' => 359.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/oneplus-nord-4.jpg',
                'desc' => 'Full metal unibody craftsmanship, Snapdragon 7+ Gen 3 performance, 5500 mAh battery with 100W SUPERVOOC.',
                'variants' => [
                    ['name' => '256GB / Mercurial Silver', 'sku' => 'N4-256-SLV', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Mercurial Silver', 'color_hex' => '#94a3b8', 'price' => 399.00, 'sale_price' => 359.00, 'stock' => 18],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.74" 1.5K AMOLED 120Hz'],
                    'Battery' => ['Capacity' => '5500 mAh, 100W Charging'],
                ]
            ],
            [
                'name' => 'Vivo X200 Pro',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VX200P',
                'base_price' => 1049.00,
                'sale_price' => 999.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/vivo-x200-pro.jpg',
                'desc' => '200MP ZEISS APO Telephoto camera, MediaTek Dimensity 9400 (3nm), and 6000 mAh BlueVolt battery.',
                'variants' => [
                    ['name' => '512GB / Titanium Blue', 'sku' => 'X200P-512-BLU', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Titanium Blue', 'color_hex' => '#1e40af', 'price' => 1049.00, 'sale_price' => 999.00, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K LTPO AMOLED 120Hz'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 9400 (3nm)'],
                    'Camera' => ['Main Camera' => '50MP LYT-818 + 200MP ZEISS APO Telephoto + 50MP Ultra-wide'],
                    'Battery' => ['Capacity' => '6000 mAh, 90W FlashCharge'],
                ]
            ],
            [
                'name' => 'OPPO Find N3 Flip',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OFN3F',
                'base_price' => 899.00,
                'sale_price' => 799.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/oppo-find-n3-flip.jpg',
                'desc' => 'Intuitive vertical cover screen, triple Hasselblad camera system with dedicated telephoto portrait lens.',
                'variants' => [
                    ['name' => '256GB / Cream Gold', 'sku' => 'N3F-256-GLD', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Cream Gold', 'color_hex' => '#fef08a', 'price' => 899.00, 'sale_price' => 799.00, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Main Display' => '6.8" AMOLED 120Hz', 'Cover Display' => '3.26" AMOLED'],
                    'Battery' => ['Capacity' => '4300 mAh, 44W SUPERVOOC'],
                ]
            ],
            [
                'name' => 'Honor Magic 6 Pro',
                'brand' => 'honor',
                'category' => 'smartphones',
                'sku' => 'HNM6P',
                'base_price' => 1099.00,
                'sale_price' => 999.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/honor-magic-6-pro.jpg',
                'desc' => '180MP Periscope Telephoto with AI Motion Sensing, NanoCrystal Shield 10x drop resistance, and 5600 mAh silicon-carbon battery.',
                'variants' => [
                    ['name' => '512GB / Epi Green', 'sku' => 'M6P-512-GRN', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Epi Green', 'color_hex' => '#15803d', 'price' => 1099.00, 'sale_price' => 999.00, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.8" LTPO AMOLED (5000 nits Peak, 4320Hz PWM)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3'],
                    'Camera' => ['Main Camera' => '50MP + 180MP Periscope Telephoto + 50MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5600 mAh, 80W Wired, 66W Wireless'],
                ]
            ],
            [
                'name' => 'Sony Xperia 1 VI',
                'brand' => 'sony',
                'category' => 'smartphones',
                'sku' => 'SNX1VI',
                'base_price' => 1299.00,
                'sale_price' => 1199.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/sony-xperia-1-vi.jpg',
                'desc' => 'Professional Alpha camera ergonomics, 85-170mm continuous true optical zoom lens, 2-day battery, and 3.5mm headphone jack.',
                'variants' => [
                    ['name' => '256GB / Khaki Green', 'sku' => 'X1VI-256-GRN', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Khaki Green', 'color_hex' => '#365314', 'price' => 1299.00, 'sale_price' => 1199.00, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.5" FHD+ LTPO OLED 120Hz (Bravia AI powered)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3'],
                    'Camera' => ['Main Camera' => '48MP Exmor T + 12MP 85-170mm Optical Zoom + 12MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5000 mAh, 30W Fast Charging'],
                ]
            ],
            [
                'name' => 'ASUS ROG Phone 8 Pro',
                'brand' => 'asus',
                'category' => 'gaming-phones',
                'sku' => 'ROG8P',
                'base_price' => 1199.00,
                'sale_price' => 1099.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/asus-rog-phone-8-pro.jpg',
                'desc' => 'Ultimate gaming beast with customizable AniMe Vision mini-LED rear matrix, 165Hz AMOLED, AirTrigger controls, and IP68 water resistance.',
                'variants' => [
                    ['name' => '512GB / Phantom Black', 'sku' => 'ROG8P-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Phantom Black', 'color_hex' => '#09090b', 'price' => 1199.00, 'sale_price' => 1099.00, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" Samsung Flexible AMOLED (165Hz, 2500 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 with GameCool 8 Vapor Chamber'],
                    'Features' => ['Gaming' => 'AirTriggers ultrasonic shoulder buttons, AniMe Vision LED Matrix'],
                    'Battery' => ['Capacity' => '5500 mAh, 65W HyperCharge, 15W Wireless'],
                ]
            ],
        ];

        $phonesList = array_merge($phonesList, MorePhonesData::getPhones());

        foreach ($phonesList as $pData) {
            $brand = $brands[$pData['brand']];
            $category = $categories[$pData['category']] ?? $categories['smartphones'];
            $slug = Str::slug(str_replace('+', ' Plus', $pData['name']));

            $product = Product::where('slug', $slug)->orWhere('sku', $pData['sku'])->first();
            $productPayload = [
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'name' => $pData['name'],
                'slug' => $slug,
                'sku' => $pData['sku'],
                'short_description' => $pData['desc'],
                'description' => $pData['desc'] . "\n\nOfficial international warranty included with express local delivery across all 25 provinces of Cambodia. Package includes genuine box, certified fast charger, and manufacturer manual.",
                'base_price' => $pData['base_price'],
                'sale_price' => $pData['sale_price'],
                'has_variants' => count($pData['variants']) > 1,
                'is_featured' => $pData['is_featured'],
                'is_bestseller' => $pData['is_bestseller'],
                'is_active' => true,
                'warranty_info' => '1-Year Official Local & Brand Warranty',
                'rating_cache' => 4.90,
                'reviews_count' => rand(15, 65),
            ];

            if ($product) {
                $product->update($productPayload);
            } else {
                $product = Product::create($productPayload);
            }

            // Primary Image
            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'is_primary' => true],
                [
                    'image_path' => $pData['image'],
                    'display_order' => 0,
                ]
            );

            // Variants
            foreach ($pData['variants'] as $vData) {
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $vData['sku']],
                    array_merge($vData, [
                        'product_id' => $product->id,
                        'is_active' => true,
                    ])
                );

                // Initial inventory transaction
                InventoryTransaction::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'variant_id' => $variant->id,
                        'type' => 'purchase',
                    ],
                    [
                        'quantity_change' => $variant->stock,
                        'balance_after' => $variant->stock,
                        'notes' => 'Initial stock replenishment',
                        'user_id' => $admin->id,
                    ]
                );
            }

            // Tech Specs
            $orderIdx = 0;
            foreach ($pData['specs'] as $group => $items) {
                foreach ($items as $sName => $sVal) {
                    ProductSpecification::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'group_name' => $group,
                            'name' => $sName,
                        ],
                        [
                            'value' => $sVal,
                            'display_order' => $orderIdx++,
                        ]
                    );
                }
            }

            // Seed sample customer review
            Review::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'user_id' => $customer->id,
                ],
                [
                    'rating' => 5,
                    'title' => "Incredible performance and sleek design!",
                    'comment' => "Received my {$product->name} on the exact same day in Phnom Penh. Genuine brand new sealed box with warranty card. The display and battery life are phenomenal.",
                    'is_verified_purchase' => true,
                    'status' => 'approved',
                ]
            );
        }

        // 5. Create Test Coupons
        Coupon::updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => 'percentage',
                'value' => 10.00,
                'min_spend' => 100.00,
                'max_discount' => 50.00,
                'usage_limit' => 500,
                'per_user_limit' => 1,
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'PHONEHUB50'],
            [
                'type' => 'fixed',
                'value' => 50.00,
                'min_spend' => 500.00,
                'max_discount' => 50.00,
                'usage_limit' => 200,
                'per_user_limit' => 1,
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'FLAGSHIP100'],
            [
                'type' => 'fixed',
                'value' => 100.00,
                'min_spend' => 1000.00,
                'max_discount' => 100.00,
                'usage_limit' => 100,
                'per_user_limit' => 1,
                'is_active' => true,
            ]
        );

        // 6. Create Hero Banners
        Banner::updateOrCreate(
            ['title' => 'Latest Smartphones. Better Prices.'],
            [
                'subtitle' => 'Discover the newest smartphones from the world’s leading brands with 1-year official warranty.',
                'image_url' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80',
                'link_url' => '/products',
                'button_text' => 'Shop Flagships',
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        Banner::updateOrCreate(
            ['title' => 'Galaxy AI is Here.'],
            [
                'subtitle' => 'Experience the groundbreaking Galaxy S25 Ultra with Snapdragon 8 Elite and instant trade-in bonus.',
                'image_url' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1600&auto=format&fit=crop&q=80',
                'link_url' => '/products/samsung-galaxy-s25-ultra',
                'button_text' => 'Order Galaxy S25 Ultra',
                'display_order' => 2,
                'is_active' => true,
            ]
        );

        // 7. System Settings
        Setting::set('store_name', 'PhoneHub Cambodia');
        Setting::set('store_email', 'support@phonehub.com');
        Setting::set('store_phone', '+855 23 888 999');
        Setting::set('currency', 'USD');
        Setting::set('free_shipping_threshold', 500);

        // 8. Seed Demo Order for Live Tracking
        $demoPhone = Product::where('slug', 'iphone-16-pro-max')->first() ?? Product::first();
        if ($demoPhone) {
            $demoOrder = Order::updateOrCreate(
                ['order_number' => 'PH-2026-8891'],
                [
                    'user_id' => $customer->id,
                    'status' => 'out_for_delivery',
                    'payment_status' => 'paid',
                    'payment_method' => 'bakong_khqr',
                    'shipping_method' => 'express',
                    'subtotal' => 1149.00,
                    'discount_amount' => 50.00,
                    'shipping_fee' => 0.00,
                    'tax_amount' => 0.00,
                    'total_amount' => 1099.00,
                    'coupon_code' => 'PHONEHUB50',
                    'shipping_address_snapshot' => [
                        'full_name' => 'Sophea Pich',
                        'phone' => '+855 12 345 678',
                        'address_line_1' => '#45, Street 240, Apartment 3B',
                        'commune' => 'Chaktomuk',
                        'district' => 'Doun Penh',
                        'province' => 'Phnom Penh',
                        'country' => 'Cambodia',
                        'delivery_notes' => 'Call 5 minutes before arrival. Leave at building reception if unavailable.'
                    ],
                    'customer_notes' => 'Please include extra screen protector and official warranty card.'
                ]
            );

            $demoOrder->items()->delete();
            $demoOrder->items()->create([
                'product_id' => $demoPhone->id,
                'variant_id' => $demoPhone->variants()->first()?->id,
                'product_name' => $demoPhone->name,
                'variant_name' => '256GB / Natural Titanium',
                'sku' => 'IP16PM-256-NAT',
                'unit_price' => 1149.00,
                'quantity' => 1,
                'subtotal' => 1149.00,
            ]);

            $demoOrder->statusHistories()->delete();
            $demoOrder->statusHistories()->createMany([
                ['status' => 'pending', 'notes' => 'Order received and verified via Bakong KHQR', 'created_at' => now()->subHours(4)],
                ['status' => 'confirmed', 'notes' => 'Payment verified. Device allocated for fulfillment.', 'created_at' => now()->subHours(3)],
                ['status' => 'processing', 'notes' => 'Device IMEI registered: 356789123456789. Genuine seal verified.', 'created_at' => now()->subHours(2)],
                ['status' => 'packed', 'notes' => 'Packaged in shockproof security box with official warranty booklet.', 'created_at' => now()->subHours(1)],
                ['status' => 'shipped', 'notes' => 'Dispatched from Phnom Penh Central Distribution Hub.', 'created_at' => now()->subMinutes(45)],
                ['status' => 'out_for_delivery', 'notes' => 'Courier Rider Sokha V. (+855 12 999 111) is on the way.', 'created_at' => now()->subMinutes(15)],
            ]);
        }
    }
}
