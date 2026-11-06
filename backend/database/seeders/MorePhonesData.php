<?php

namespace Database\Seeders;

class MorePhonesData
{
    public static function getPhones(): array
    {
        return [
            // ==================== APPLE ====================
            [
                'name' => 'iPhone 15 Pro',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP15P',
                'base_price' => 999.00,
                'sale_price' => 949.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-15-pro.jpg',
                'desc' => 'Aerospace-grade titanium design, A17 Pro gaming chip, customizable Action Button, and versatile 48MP Pro camera system with USB-C 3.',
                'variants' => [
                    ['name' => '128GB / Natural Titanium', 'sku' => 'IP15P-128-NAT', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Natural Titanium', 'color_hex' => '#9ca3af', 'price' => 999.00, 'sale_price' => 949.00, 'stock' => 15],
                    ['name' => '256GB / Black Titanium', 'sku' => 'IP15P-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Black Titanium', 'color_hex' => '#1f2937', 'price' => 1099.00, 'sale_price' => null, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Super Retina XDR OLED (120Hz ProMotion)'],
                    'Performance' => ['Processor' => 'Apple A17 Pro (3nm)'],
                    'Camera' => ['Main' => '48MP Main + 12MP Ultra-wide + 12MP 3x Telephoto'],
                    'Battery' => ['Capacity' => '3274 mAh, USB-C 3, MagSafe 15W'],
                ]
            ],
            [
                'name' => 'iPhone 15 Plus',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP15PL',
                'base_price' => 899.00,
                'sale_price' => 849.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-15-plus.jpg',
                'desc' => 'Super-sized 6.7-inch display, Dynamic Island, 48MP main camera with 2x Telephoto, color-infused back glass, and all-day battery life.',
                'variants' => [
                    ['name' => '128GB / Pink', 'sku' => 'IP15PL-128-PNK', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Pink', 'color_hex' => '#fbcfe8', 'price' => 899.00, 'sale_price' => 849.00, 'stock' => 10],
                    ['name' => '256GB / Black', 'sku' => 'IP15PL-256-BLK', 'storage' => '256GB', 'ram' => '6GB', 'color' => 'Black', 'color_hex' => '#111827', 'price' => 999.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Retina XDR OLED'],
                    'Performance' => ['Processor' => 'Apple A16 Bionic (4nm)'],
                    'Camera' => ['Main' => '48MP Main + 12MP Ultra-wide with 2x Telephoto'],
                    'Battery' => ['Capacity' => '4383 mAh, USB-C, 26 hours video playback'],
                ]
            ],
            [
                'name' => 'iPhone 14 Pro Max',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP14PM',
                'base_price' => 949.00,
                'sale_price' => 899.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-14-pro-max.jpg',
                'desc' => 'The original Dynamic Island flagship with Always-On display, 48MP Pro camera system, and A16 Bionic speed in surgical-grade stainless steel.',
                'variants' => [
                    ['name' => '128GB / Deep Purple', 'sku' => 'IP14PM-128-PUR', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Deep Purple', 'color_hex' => '#4a154b', 'price' => 949.00, 'sale_price' => 899.00, 'stock' => 8],
                    ['name' => '256GB / Space Black', 'sku' => 'IP14PM-256-BLK', 'storage' => '256GB', 'ram' => '6GB', 'color' => 'Space Black', 'color_hex' => '#18181b', 'price' => 1049.00, 'sale_price' => null, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Retina XDR OLED (120Hz ProMotion, Always-On)'],
                    'Performance' => ['Processor' => 'Apple A16 Bionic'],
                    'Camera' => ['Main' => '48MP Pro + 12MP Ultra-wide + 12MP 3x Telephoto'],
                    'Battery' => ['Capacity' => '4323 mAh, MagSafe wireless'],
                ]
            ],
            [
                'name' => 'iPhone 14 Pro',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP14P',
                'base_price' => 849.00,
                'sale_price' => 799.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-14-pro.jpg',
                'desc' => 'Compact 6.1-inch Pro powerhouse featuring Dynamic Island, 48MP camera sensor, Always-On Retina display, and A16 Bionic.',
                'variants' => [
                    ['name' => '128GB / Space Black', 'sku' => 'IP14P-128-BLK', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Space Black', 'color_hex' => '#18181b', 'price' => 849.00, 'sale_price' => 799.00, 'stock' => 10],
                    ['name' => '256GB / Gold', 'sku' => 'IP14P-256-GLD', 'storage' => '256GB', 'ram' => '6GB', 'color' => 'Gold', 'color_hex' => '#fef08a', 'price' => 949.00, 'sale_price' => null, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Super Retina XDR OLED (120Hz ProMotion)'],
                    'Performance' => ['Processor' => 'Apple A16 Bionic'],
                    'Camera' => ['Main' => '48MP Quad-pixel + 12MP Ultra-wide + 12MP Telephoto'],
                    'Battery' => ['Capacity' => '3200 mAh'],
                ]
            ],
            [
                'name' => 'iPhone 14 Plus',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP14PL',
                'base_price' => 699.00,
                'sale_price' => 649.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-14-plus.jpg',
                'desc' => 'Think big with a larger 6.7-inch display and all-day battery life. Dual-camera system for stunning photos in low light and bright light.',
                'variants' => [
                    ['name' => '128GB / Blue', 'sku' => 'IP14PL-128-BLU', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Blue', 'color_hex' => '#93c5fd', 'price' => 699.00, 'sale_price' => 649.00, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Retina XDR OLED'],
                    'Performance' => ['Processor' => 'Apple A15 Bionic (5-core GPU)'],
                    'Battery' => ['Capacity' => '4325 mAh, Up to 26 hours video playback'],
                ]
            ],
            [
                'name' => 'iPhone 13 Pro Max',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP13PM',
                'base_price' => 799.00,
                'sale_price' => 749.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-13-pro-max.jpg',
                'desc' => 'Legendary battery life champion with 6.7" 120Hz ProMotion, 3x optical telephoto camera, and durable surgical-grade stainless steel.',
                'variants' => [
                    ['name' => '128GB / Sierra Blue', 'sku' => 'IP13PM-128-SBL', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Sierra Blue', 'color_hex' => '#7dd3fc', 'price' => 799.00, 'sale_price' => 749.00, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Retina XDR with ProMotion 120Hz'],
                    'Performance' => ['Processor' => 'Apple A15 Bionic (5-core GPU)'],
                    'Camera' => ['Main' => '12MP Pro triple camera with 3x optical zoom'],
                    'Battery' => ['Capacity' => '4352 mAh, Class-leading battery endurance'],
                ]
            ],
            [
                'name' => 'iPhone 13',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IP13',
                'base_price' => 549.00,
                'sale_price' => 499.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/iphone-13.jpg',
                'desc' => 'The most popular iPhone in the world with bright Super Retina XDR display, Cinematic mode in 1080p, durable flat-edge design, and A15 Bionic.',
                'variants' => [
                    ['name' => '128GB / Midnight', 'sku' => 'IP13-128-MID', 'storage' => '128GB', 'ram' => '4GB', 'color' => 'Midnight', 'color_hex' => '#0f172a', 'price' => 549.00, 'sale_price' => 499.00, 'stock' => 20],
                    ['name' => '256GB / Starlight', 'sku' => 'IP13-256-STA', 'storage' => '256GB', 'ram' => '4GB', 'color' => 'Starlight', 'color_hex' => '#f1f5f9', 'price' => 649.00, 'sale_price' => null, 'stock' => 14],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" Super Retina XDR OLED'],
                    'Performance' => ['Processor' => 'Apple A15 Bionic'],
                    'Camera' => ['Main' => '12MP Main + 12MP Ultra-wide with sensor-shift OIS'],
                    'Battery' => ['Capacity' => '3227 mAh'],
                ]
            ],
            [
                'name' => 'iPhone SE (3rd Gen)',
                'brand' => 'apple',
                'category' => 'iphone',
                'sku' => 'IPSE3',
                'base_price' => 429.00,
                'sale_price' => 399.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/iphone-se-3rd-gen.jpg',
                'desc' => 'Lightning-fast A15 Bionic chip and fast 5G in an iconic 4.7-inch compact design with Home button and Touch ID.',
                'variants' => [
                    ['name' => '64GB / Midnight', 'sku' => 'IPSE3-64-MID', 'storage' => '64GB', 'ram' => '4GB', 'color' => 'Midnight', 'color_hex' => '#020617', 'price' => 429.00, 'sale_price' => 399.00, 'stock' => 11],
                    ['name' => '128GB / (PRODUCT)RED', 'sku' => 'IPSE3-128-RED', 'storage' => '128GB', 'ram' => '4GB', 'color' => 'RED', 'color_hex' => '#ef4444', 'price' => 479.00, 'sale_price' => null, 'stock' => 7],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '4.7" Retina HD display'],
                    'Performance' => ['Processor' => 'Apple A15 Bionic with 5G'],
                    'Biometrics' => ['Security' => 'Touch ID fingerprint sensor'],
                    'Battery' => ['Capacity' => '2018 mAh with Qi wireless charging'],
                ]
            ],

            // ==================== SAMSUNG ====================
            [
                'name' => 'Samsung Galaxy S24 Plus',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS24P',
                'base_price' => 899.00,
                'sale_price' => 849.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-s24-plus.jpg',
                'desc' => 'Stunning 6.7-inch QHD+ display with uniform bezels, Snapdragon 8 Gen 3 for Galaxy, Galaxy AI tools, and 4900mAh battery.',
                'variants' => [
                    ['name' => '256GB / Onyx Black', 'sku' => 'S24P-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Onyx Black', 'color_hex' => '#18181b', 'price' => 899.00, 'sale_price' => 849.00, 'stock' => 10],
                    ['name' => '512GB / Marble Gray', 'sku' => 'S24P-512-GRY', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Marble Gray', 'color_hex' => '#9ca3af', 'price' => 999.00, 'sale_price' => null, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" QHD+ Dynamic AMOLED 2X (1-120Hz, 2600 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 for Galaxy'],
                    'Battery' => ['Capacity' => '4900 mAh, 45W Fast Charging'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S24',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS24',
                'base_price' => 699.00,
                'sale_price' => 649.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-s24.jpg',
                'desc' => 'Compact flagship perfection with 6.2" Dynamic AMOLED 2X, armor aluminum frame, Circle to Search with Google, and 50MP triple cameras.',
                'variants' => [
                    ['name' => '128GB / Cobalt Violet', 'sku' => 'S24-128-VIO', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Cobalt Violet', 'color_hex' => '#581c87', 'price' => 699.00, 'sale_price' => 649.00, 'stock' => 14],
                    ['name' => '256GB / Amber Yellow', 'sku' => 'S24-256-YEL', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Amber Yellow', 'color_hex' => '#fef08a', 'price' => 759.00, 'sale_price' => null, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.2" FHD+ Dynamic AMOLED 2X 120Hz'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3'],
                    'Battery' => ['Capacity' => '4000 mAh'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S23 Ultra',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS23U',
                'base_price' => 849.00,
                'sale_price' => 799.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-s23-ultra.jpg',
                'desc' => 'Epic 200MP camera sensor with 100x Space Zoom, integrated S-Pen stylus, Snapdragon 8 Gen 2 for Galaxy, and legendary 5000mAh battery life.',
                'variants' => [
                    ['name' => '256GB / Phantom Black', 'sku' => 'S23U-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Phantom Black', 'color_hex' => '#0f172a', 'price' => 849.00, 'sale_price' => 799.00, 'stock' => 12],
                    ['name' => '512GB / Green', 'sku' => 'S23U-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Green', 'color_hex' => '#14532d', 'price' => 949.00, 'sale_price' => null, 'stock' => 7],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.8" Edge QHD+ Dynamic AMOLED 2X 120Hz'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2 for Galaxy'],
                    'Camera' => ['Main' => '200MP Main + 10MP 10x Periscope + 10MP 3x + 12MP Ultra-wide'],
                    'Stylus' => ['Features' => 'Embedded S-Pen with Air Actions'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy S23 FE',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGS23FE',
                'base_price' => 499.00,
                'sale_price' => 449.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-s23-fe.jpg',
                'desc' => 'Fan Edition value with premium glass and aluminum build, 50MP pro-grade camera, Galaxy AI capabilities, and 120Hz Dynamic AMOLED.',
                'variants' => [
                    ['name' => '128GB / Mint', 'sku' => 'S23FE-128-MNT', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Mint', 'color_hex' => '#86efac', 'price' => 499.00, 'sale_price' => 449.00, 'stock' => 15],
                    ['name' => '256GB / Graphite', 'sku' => 'S23FE-256-GRP', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Graphite', 'color_hex' => '#334155', 'price' => 559.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.4" Dynamic AMOLED 2X (120Hz)'],
                    'Performance' => ['Processor' => 'Exynos 2200 / Snapdragon 8 Gen 1'],
                    'Battery' => ['Capacity' => '4500 mAh, 25W Fast Charge'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy Z Fold5',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGZF5',
                'base_price' => 1349.00,
                'sale_price' => 1249.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-z-fold5.jpg',
                'desc' => 'Gapless Flex Hinge foldable with expansive 7.6-inch Dynamic AMOLED 2X main screen, PC-like multitasking taskbar, and S-Pen Fold Edition support.',
                'variants' => [
                    ['name' => '256GB / Icy Blue', 'sku' => 'ZF5-256-BLU', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Icy Blue', 'color_hex' => '#bfdbfe', 'price' => 1349.00, 'sale_price' => 1249.00, 'stock' => 6],
                    ['name' => '512GB / Phantom Black', 'sku' => 'ZF5-512-BLK', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Phantom Black', 'color_hex' => '#0f172a', 'price' => 1449.00, 'sale_price' => null, 'stock' => 4],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '7.6" Main QXGA+ & 6.2" Cover 120Hz AMOLED'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2 for Galaxy'],
                    'Durability' => ['Rating' => 'Armor Aluminum Frame, IPX8 Water Resistant'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy Z Flip5',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGZFL5',
                'base_price' => 749.00,
                'sale_price' => 699.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-z-flip5.jpg',
                'desc' => 'Compact pocket folder with generous 3.4-inch Flex Window cover display, hands-free FlexCam photography, and zero-gap folding design.',
                'variants' => [
                    ['name' => '256GB / Mint', 'sku' => 'ZFL5-256-MNT', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Mint', 'color_hex' => '#a7f3d0', 'price' => 749.00, 'sale_price' => 699.00, 'stock' => 9],
                    ['name' => '512GB / Lavender', 'sku' => 'ZFL5-512-LAV', 'storage' => '512GB', 'ram' => '8GB', 'color' => 'Lavender', 'color_hex' => '#e9d5ff', 'price' => 849.00, 'sale_price' => null, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" FHD+ 120Hz Main & 3.4" Flex Window'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2 for Galaxy'],
                    'Battery' => ['Capacity' => '3700 mAh, 25W Fast Charge'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy A25 5G',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGA25',
                'base_price' => 269.00,
                'sale_price' => 239.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/samsung-galaxy-a25-5g.jpg',
                'desc' => 'Vibrant 6.5" Super AMOLED 120Hz display, 50MP camera with Optical Image Stabilization (OIS), stereo speakers, and 5000mAh battery.',
                'variants' => [
                    ['name' => '128GB / Blue Black', 'sku' => 'A25-128-BLK', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Blue Black', 'color_hex' => '#1e293b', 'price' => 269.00, 'sale_price' => 239.00, 'stock' => 16],
                    ['name' => '256GB / Yellow', 'sku' => 'A25-256-YEL', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Yellow', 'color_hex' => '#fde047', 'price' => 299.00, 'sale_price' => null, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.5" FHD+ Super AMOLED 120Hz (1000 nits)'],
                    'Camera' => ['Main' => '50MP OIS + 8MP Ultra-wide + 2MP Macro'],
                    'Battery' => ['Capacity' => '5000 mAh, 25W Fast Charging'],
                ]
            ],
            [
                'name' => 'Samsung Galaxy A15 5G',
                'brand' => 'samsung',
                'category' => 'samsung-galaxy',
                'sku' => 'SGA15',
                'base_price' => 199.00,
                'sale_price' => 179.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/samsung-galaxy-a15-5g.jpg',
                'desc' => 'Best-selling value champion with 6.5" Super AMOLED 90Hz screen, 50MP triple camera, octa-core 5G processor, and 5000mAh battery.',
                'variants' => [
                    ['name' => '128GB / Blue', 'sku' => 'A15-128-BLU', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Blue', 'color_hex' => '#38bdf8', 'price' => 199.00, 'sale_price' => 179.00, 'stock' => 25],
                    ['name' => '256GB / Light Blue', 'sku' => 'A15-256-LBL', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Light Blue', 'color_hex' => '#bae6fd', 'price' => 229.00, 'sale_price' => null, 'stock' => 18],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.5" FHD+ Super AMOLED 90Hz (800 nits)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 6100+ 5G'],
                    'Battery' => ['Capacity' => '5000 mAh, 25W Fast Charging'],
                ]
            ],

            // ==================== GOOGLE PIXEL ====================
            [
                'name' => 'Google Pixel 8 Pro',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP8P',
                'base_price' => 749.00,
                'sale_price' => 699.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/google-pixel-8-pro.jpg',
                'desc' => 'Super Actua display, Google Tensor G3, on-device object temperature sensor, Best Take, Video Boost, and pro-level triple camera controls.',
                'variants' => [
                    ['name' => '128GB / Bay Blue', 'sku' => 'P8P-128-BAY', 'storage' => '128GB', 'ram' => '12GB', 'color' => 'Bay Blue', 'color_hex' => '#60a5fa', 'price' => 749.00, 'sale_price' => 699.00, 'stock' => 10],
                    ['name' => '256GB / Obsidian', 'sku' => 'P8P-256-OBS', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Obsidian', 'color_hex' => '#1e293b', 'price' => 829.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super Actua LTPO OLED (1-120Hz, 2400 nits)'],
                    'Performance' => ['Processor' => 'Google Tensor G3 with Titan M2 security'],
                    'Camera' => ['Main' => '50MP Octa PD + 48MP Ultra-wide + 48MP 5x Telephoto'],
                ]
            ],
            [
                'name' => 'Google Pixel 8',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP8',
                'base_price' => 549.00,
                'sale_price' => 499.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/google-pixel-8.jpg',
                'desc' => 'Compact 6.2" Actua 120Hz display with contoured edges, Google Tensor G3 speed, Audio Magic Eraser, and all-day intelligent battery.',
                'variants' => [
                    ['name' => '128GB / Rose', 'sku' => 'P8-128-ROS', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Rose', 'color_hex' => '#fda4af', 'price' => 549.00, 'sale_price' => 499.00, 'stock' => 12],
                    ['name' => '256GB / Hazel', 'sku' => 'P8-256-HAZ', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Hazel', 'color_hex' => '#64748b', 'price' => 619.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.2" Actua OLED 120Hz (2000 nits)'],
                    'Performance' => ['Processor' => 'Google Tensor G3'],
                    'Battery' => ['Capacity' => '4575 mAh, 27W Fast Charge'],
                ]
            ],
            [
                'name' => 'Google Pixel 7 Pro',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP7P',
                'base_price' => 499.00,
                'sale_price' => 449.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/google-pixel-7-pro.jpg',
                'desc' => 'Iconic polished aluminum camera visor with 5x optical telephoto zoom, Photo Unblur, Real Tone photography, and 6.7-inch QHD+ 120Hz screen.',
                'variants' => [
                    ['name' => '128GB / Snow', 'sku' => 'P7P-128-SNW', 'storage' => '128GB', 'ram' => '12GB', 'color' => 'Snow', 'color_hex' => '#f8fafc', 'price' => 499.00, 'sale_price' => 449.00, 'stock' => 7],
                    ['name' => '256GB / Obsidian', 'sku' => 'P7P-256-OBS', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Obsidian', 'color_hex' => '#0f172a', 'price' => 569.00, 'sale_price' => null, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" QHD+ LTPO OLED 120Hz'],
                    'Performance' => ['Processor' => 'Google Tensor G2'],
                    'Camera' => ['Main' => '50MP Main + 12MP Ultra-wide + 48MP 5x Telephoto'],
                ]
            ],
            [
                'name' => 'Google Pixel 7a',
                'brand' => 'google',
                'category' => 'google-pixel',
                'sku' => 'GP7A',
                'base_price' => 349.00,
                'sale_price' => 319.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/google-pixel-7a.jpg',
                'desc' => 'Flagship-grade camera capabilities with 64MP sensor, Google Tensor G2, wireless charging support, and smooth 90Hz OLED display.',
                'variants' => [
                    ['name' => '128GB / Sea', 'sku' => 'P7A-128-SEA', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Sea', 'color_hex' => '#bae6fd', 'price' => 349.00, 'sale_price' => 319.00, 'stock' => 14],
                    ['name' => '128GB / Charcoal', 'sku' => 'P7A-128-CHR', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Charcoal', 'color_hex' => '#334155', 'price' => 349.00, 'sale_price' => null, 'stock' => 11],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" FHD+ OLED (90Hz)'],
                    'Performance' => ['Processor' => 'Google Tensor G2'],
                    'Battery' => ['Capacity' => '4385 mAh with Qi wireless charging'],
                ]
            ],

            // ==================== XIAOMI / REDMI / POCO ====================
            [
                'name' => 'Xiaomi 14T Pro',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'MI14TP',
                'base_price' => 749.00,
                'sale_price' => 699.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/xiaomi-14t-pro.jpg',
                'desc' => 'Master light with Leica Summilux optical lens, Dimensity 9300+ powerhouse, 144Hz AI display, 120W HyperCharge, and 50W wireless.',
                'variants' => [
                    ['name' => '256GB / Titan Black', 'sku' => '14TP-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Titan Black', 'color_hex' => '#18181b', 'price' => 749.00, 'sale_price' => 699.00, 'stock' => 12],
                    ['name' => '512GB / Titan Blue', 'sku' => '14TP-512-BLU', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Titan Blue', 'color_hex' => '#3b82f6', 'price' => 829.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 1.5K 144Hz AI AMOLED (4000 nits)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 9300+ (4nm)'],
                    'Camera' => ['Main' => '50MP Light Fusion 900 Leica + 50MP Telephoto + 12MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5000 mAh, 120W Wired, 50W Wireless'],
                ]
            ],
            [
                'name' => 'Xiaomi 14T',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'MI14T',
                'base_price' => 599.00,
                'sale_price' => 549.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/xiaomi-14t.jpg',
                'desc' => 'Leica triple camera system with 5 focal lengths, MediaTek Dimensity 8300-Ultra, 144Hz CrystalRes display, and 67W HyperCharge.',
                'variants' => [
                    ['name' => '256GB / Titan Gray', 'sku' => '14T-256-GRY', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Titan Gray', 'color_hex' => '#94a3b8', 'price' => 599.00, 'sale_price' => 549.00, 'stock' => 10],
                    ['name' => '512GB / Lemon Green', 'sku' => '14T-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Lemon Green', 'color_hex' => '#bef264', 'price' => 659.00, 'sale_price' => null, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 144Hz AMOLED (4000 nits peak)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 8300-Ultra'],
                    'Battery' => ['Capacity' => '5000 mAh, 67W HyperCharge'],
                ]
            ],
            [
                'name' => 'Xiaomi 13T Pro',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'MI13TP',
                'base_price' => 549.00,
                'sale_price' => 499.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/xiaomi-13t-pro.jpg',
                'desc' => 'Co-engineered with Leica featuring 50MP Sony IMX707 sensor, Dimensity 9200+, 120W HyperCharge, IP68 rating, and 144Hz CrystalRes OLED.',
                'variants' => [
                    ['name' => '256GB / Alpine Blue', 'sku' => '13TP-256-BLU', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Alpine Blue (Vegan Leather)', 'color_hex' => '#60a5fa', 'price' => 549.00, 'sale_price' => 499.00, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 1.5K 144Hz AMOLED (2600 nits)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 9200+'],
                    'Battery' => ['Capacity' => '5000 mAh, 120W HyperCharge (19 min full charge)'],
                ]
            ],
            [
                'name' => 'Redmi Note 13 Pro+ 5G',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'RN13PP',
                'base_price' => 389.00,
                'sale_price' => 359.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/redmi-note-13-pro-plus-5g.jpg',
                'desc' => 'Curved 1.5K 120Hz CrystalRes AMOLED display, 200MP OIS camera, IP68 flagship water resistance, and lightning-fast 120W HyperCharge.',
                'variants' => [
                    ['name' => '256GB / Midnight Black', 'sku' => 'R13PP-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Midnight Black', 'color_hex' => '#0f172a', 'price' => 389.00, 'sale_price' => 359.00, 'stock' => 15],
                    ['name' => '512GB / Aurora Purple', 'sku' => 'R13PP-512-PUR', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Aurora Purple', 'color_hex' => '#c084fc', 'price' => 429.00, 'sale_price' => null, 'stock' => 11],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 1.5K 120Hz Curved AMOLED (Corning Gorilla Glass Victus)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 7200-Ultra (4nm)'],
                    'Camera' => ['Main' => '200MP Samsung ISOCELL HP3 with OIS + 4X In-Sensor Zoom'],
                    'Battery' => ['Capacity' => '5000 mAh, 120W HyperCharge'],
                ]
            ],
            [
                'name' => 'Redmi Note 13 5G',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'RN13',
                'base_price' => 229.00,
                'sale_price' => 199.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/redmi-note-13-5g.jpg',
                'desc' => 'Ultra-thin bezels with 120Hz FHD+ AMOLED display, 108MP 3x lossless zoom triple camera, and MediaTek Dimensity 6080 5G performance.',
                'variants' => [
                    ['name' => '128GB / Graphite Black', 'sku' => 'R13-128-BLK', 'storage' => '128GB', 'ram' => '6GB', 'color' => 'Graphite Black', 'color_hex' => '#1e293b', 'price' => 229.00, 'sale_price' => 199.00, 'stock' => 18],
                    ['name' => '256GB / Ocean Teal', 'sku' => 'R13-256-TEL', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Ocean Teal', 'color_hex' => '#0d9488', 'price' => 259.00, 'sale_price' => null, 'stock' => 14],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" FHD+ 120Hz AMOLED'],
                    'Camera' => ['Main' => '108MP 3X In-sensor zoom + 8MP Ultra-wide + 2MP Macro'],
                    'Battery' => ['Capacity' => '5000 mAh, 33W Fast Charging'],
                ]
            ],
            [
                'name' => 'Redmi 13C',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'R13C',
                'base_price' => 139.00,
                'sale_price' => 119.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/redmi-13c.jpg',
                'desc' => 'Smooth 6.74-inch 90Hz display, 50MP AI triple camera, octa-core processor, massive 5000mAh battery, and sleek 8.09mm ultra-slim profile.',
                'variants' => [
                    ['name' => '128GB / Clover Green', 'sku' => '13C-128-GRN', 'storage' => '128GB', 'ram' => '4GB', 'color' => 'Clover Green', 'color_hex' => '#4ade80', 'price' => 139.00, 'sale_price' => 119.00, 'stock' => 30],
                    ['name' => '256GB / Midnight Black', 'sku' => '13C-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Midnight Black', 'color_hex' => '#0f172a', 'price' => 159.00, 'sale_price' => null, 'stock' => 22],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.74" 90Hz Eye Care display'],
                    'Performance' => ['Processor' => 'MediaTek Helio G85'],
                    'Battery' => ['Capacity' => '5000 mAh, 18W Type-C'],
                ]
            ],
            [
                'name' => 'POCO F6',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'PF6',
                'base_price' => 399.00,
                'sale_price' => 369.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/poco-f6.jpg',
                'desc' => 'Flagship performance unleashed with Snapdragon 8s Gen 3, WildBoost Optimization 3.0, 90W turbo charging, and 50MP Sony IMX882 OIS camera.',
                'variants' => [
                    ['name' => '256GB / Black', 'sku' => 'F6-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Black', 'color_hex' => '#18181b', 'price' => 399.00, 'sale_price' => 369.00, 'stock' => 14],
                    ['name' => '512GB / Titanium', 'sku' => 'F6-512-TIT', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Titanium', 'color_hex' => '#71717a', 'price' => 449.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 1.5K 120Hz Flow AMOLED (2400 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8s Gen 3 (4nm)'],
                    'Battery' => ['Capacity' => '5000 mAh, 90W Turbo Charge'],
                ]
            ],
            [
                'name' => 'POCO M6 Pro',
                'brand' => 'xiaomi',
                'category' => 'xiaomi-redmi',
                'sku' => 'PM6P',
                'base_price' => 199.00,
                'sale_price' => 179.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/poco-m6-pro.jpg',
                'desc' => '120Hz Flow AMOLED with ultra-slim bezels, MediaTek Helio G99-Ultra, 64MP triple camera with OIS, and 67W turbo charging.',
                'variants' => [
                    ['name' => '256GB / Blue', 'sku' => 'M6P-256-BLU', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Blue', 'color_hex' => '#3b82f6', 'price' => 199.00, 'sale_price' => 179.00, 'stock' => 16],
                    ['name' => '512GB / Black', 'sku' => 'M6P-512-BLK', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Black', 'color_hex' => '#09090b', 'price' => 229.00, 'sale_price' => null, 'stock' => 12],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 120Hz Flow AMOLED'],
                    'Performance' => ['Processor' => 'MediaTek Helio G99-Ultra'],
                    'Battery' => ['Capacity' => '5000 mAh, 67W Turbo Charge'],
                ]
            ],

            // ==================== ONEPLUS ====================
            [
                'name' => 'OnePlus 12',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OP12',
                'base_price' => 799.00,
                'sale_price' => 749.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/oneplus-12.jpg',
                'desc' => 'Flagship excellence with Snapdragon 8 Gen 3, 4th Gen Hasselblad camera with 64MP periscope telephoto, 2K 120Hz ProXDR screen, and 5400mAh battery.',
                'variants' => [
                    ['name' => '256GB / Silky Black', 'sku' => 'OP12-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Silky Black', 'color_hex' => '#18181b', 'price' => 799.00, 'sale_price' => 749.00, 'stock' => 12],
                    ['name' => '512GB / Flowy Emerald', 'sku' => 'OP12-512-EMR', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Flowy Emerald', 'color_hex' => '#065f46', 'price' => 899.00, 'sale_price' => null, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.82" 2K 120Hz ProXDR LTPO AMOLED (4500 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 with Dual Cryo-velocity VC'],
                    'Camera' => ['Main' => '50MP Sony LYT-808 + 64MP 3X Periscope + 48MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5400 mAh, 100W SUPERVOOC, 50W AIRVOOC'],
                ]
            ],
            [
                'name' => 'OnePlus 11 5G',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OP11',
                'base_price' => 549.00,
                'sale_price' => 499.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/oneplus-11-5g.jpg',
                'desc' => 'Black Hole design aesthetic with 3rd Gen Hasselblad Camera for Mobile, Snapdragon 8 Gen 2, signature Alert Slider, and 100W SUPERVOOC charge.',
                'variants' => [
                    ['name' => '128GB / Titan Black', 'sku' => 'OP11-128-BLK', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Titan Black', 'color_hex' => '#1f2937', 'price' => 549.00, 'sale_price' => 499.00, 'stock' => 8],
                    ['name' => '256GB / Eternal Green', 'sku' => 'OP11-256-GRN', 'storage' => '256GB', 'ram' => '16GB', 'color' => 'Eternal Green', 'color_hex' => '#047857', 'price' => 619.00, 'sale_price' => null, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" QHD+ 120Hz 2K Super Fluid AMOLED with LTPO 3.0'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2'],
                    'Battery' => ['Capacity' => '5000 mAh, 100W Fast Charge'],
                ]
            ],
            [
                'name' => 'OnePlus Nord CE4',
                'brand' => 'oneplus',
                'category' => 'oneplus-phones',
                'sku' => 'OPNCE4',
                'base_price' => 299.00,
                'sale_price' => 269.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/oneplus-nord-ce4.jpg',
                'desc' => 'Fast and smooth Snapdragon 7 Gen 3, 100W SUPERVOOC charging, 5500mAh massive battery, and 120Hz FHD+ AMOLED display with Aqua Touch.',
                'variants' => [
                    ['name' => '128GB / Dark Chrome', 'sku' => 'NCE4-128-CHR', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Dark Chrome', 'color_hex' => '#334155', 'price' => 299.00, 'sale_price' => 269.00, 'stock' => 15],
                    ['name' => '256GB / Celadon Marble', 'sku' => 'NCE4-256-MBL', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Celadon Marble', 'color_hex' => '#a7f3d0', 'price' => 339.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" FHD+ 120Hz AMOLED (Aqua Touch)'],
                    'Performance' => ['Processor' => 'Qualcomm Snapdragon 7 Gen 3'],
                    'Battery' => ['Capacity' => '5500 mAh, 100W SUPERVOOC (1-100% in 29 min)'],
                ]
            ],

            // ==================== OPPO ====================
            [
                'name' => 'OPPO Find N3',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OFN3',
                'base_price' => 1399.00,
                'sale_price' => 1299.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/oppo-find-n3.jpg',
                'desc' => 'Thin and light book foldable with expansive 7.82-inch inner screen, revolutionary Boundless View multitasking, and Hasselblad portrait cameras.',
                'variants' => [
                    ['name' => '512GB / Champagne Gold', 'sku' => 'FN3-512-GLD', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Champagne Gold', 'color_hex' => '#fef08a', 'price' => 1399.00, 'sale_price' => 1299.00, 'stock' => 5],
                    ['name' => '512GB / Classic Black', 'sku' => 'FN3-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Classic Black (Vegan Leather)', 'color_hex' => '#111827', 'price' => 1399.00, 'sale_price' => null, 'stock' => 4],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '7.82" 120Hz Foldable OLED & 6.31" 120Hz Cover OLED'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2'],
                    'Camera' => ['Main' => '48MP Stacked Pixel Main + 64MP 3X Telephoto + 48MP Ultra-wide'],
                    'Battery' => ['Capacity' => '4805 mAh, 67W SUPERVOOC'],
                ]
            ],
            [
                'name' => 'OPPO Reno 12 Pro 5G',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OR12P',
                'base_price' => 499.00,
                'sale_price' => 459.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/oppo-reno-12-pro-5g.jpg',
                'desc' => 'AI Portrait Expert featuring Quad-Curved Infinite View screen, AI Eraser 2.0, MediaTek Dimensity 7300-Energy, and 80W SUPERVOOC fast charge.',
                'variants' => [
                    ['name' => '256GB / Nebula Silver', 'sku' => 'R12P-256-SLV', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Nebula Silver', 'color_hex' => '#cbd5e1', 'price' => 499.00, 'sale_price' => 459.00, 'stock' => 14],
                    ['name' => '512GB / Space Brown', 'sku' => 'R12P-512-BRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Space Brown', 'color_hex' => '#451a03', 'price' => 549.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Quad-Curved 120Hz AMOLED (Gorilla Glass Victus 2)'],
                    'Camera' => ['Main' => '50MP Sony LYT-600 OIS + 50MP Telephoto + 8MP Ultra-wide + 50MP Selfie'],
                    'Battery' => ['Capacity' => '5000 mAh, 80W SUPERVOOC'],
                ]
            ],
            [
                'name' => 'OPPO Reno 12 5G',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OR12',
                'base_price' => 399.00,
                'sale_price' => 369.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/oppo-reno-12-5g.jpg',
                'desc' => 'Futuristic Fluid Design with 3D Dual-Curved display, AI Studio generative photo features, Splash Touch water resistance, and 80W flash charging.',
                'variants' => [
                    ['name' => '256GB / Astro Silver', 'sku' => 'R12-256-SLV', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Astro Silver', 'color_hex' => '#e2e8f0', 'price' => 399.00, 'sale_price' => 369.00, 'stock' => 12],
                    ['name' => '512GB / Matte Brown', 'sku' => 'R12-512-BRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Matte Brown', 'color_hex' => '#5c2c16', 'price' => 439.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" 3D Dual-Curved 120Hz AMOLED'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 7300-Energy (4nm)'],
                    'Battery' => ['Capacity' => '5000 mAh, 80W Flash Charge'],
                ]
            ],
            [
                'name' => 'OPPO A79 5G',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OA79',
                'base_price' => 239.00,
                'sale_price' => 219.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/oppo-a79-5g.jpg',
                'desc' => 'Glowing Feather texture finish with 6.72" FHD+ Sunlight Display, Dual Stereo Speakers with 300% Ultra Volume Mode, and 33W SUPERVOOC.',
                'variants' => [
                    ['name' => '128GB / Glowing Green', 'sku' => 'A79-128-GRN', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Glowing Green', 'color_hex' => '#86efac', 'price' => 239.00, 'sale_price' => 219.00, 'stock' => 15],
                    ['name' => '256GB / Mystery Black', 'sku' => 'A79-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Mystery Black', 'color_hex' => '#1e293b', 'price' => 269.00, 'sale_price' => null, 'stock' => 11],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.72" FHD+ 90Hz Sunlight Display (680 nits)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 6020 5G'],
                    'Battery' => ['Capacity' => '5000 mAh, 33W SUPERVOOC'],
                ]
            ],
            [
                'name' => 'OPPO A60',
                'brand' => 'oppo',
                'category' => 'oppo-vivo',
                'sku' => 'OA60',
                'base_price' => 169.00,
                'sale_price' => 149.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/oppo-a60.jpg',
                'desc' => 'US Military-Grade shock resistance certified with 950 nits Ultra Bright Display, Splash Touch, 45W SUPERVOOC, and 50MP ultra-clear camera.',
                'variants' => [
                    ['name' => '128GB / Ripple Blue', 'sku' => 'A60-128-BLU', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Ripple Blue', 'color_hex' => '#7dd3fc', 'price' => 169.00, 'sale_price' => 149.00, 'stock' => 20],
                    ['name' => '256GB / Midnight Purple', 'sku' => 'A60-256-PUR', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Midnight Purple', 'color_hex' => '#581c87', 'price' => 189.00, 'sale_price' => null, 'stock' => 14],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.67" 90Hz Ultra Bright display (950 nits)'],
                    'Durability' => ['Rating' => 'MIL-STD-810H Military-Grade Shock Resistance'],
                    'Battery' => ['Capacity' => '5000 mAh, 45W SUPERVOOC'],
                ]
            ],

            // ==================== VIVO ====================
            [
                'name' => 'Vivo X Fold3 Pro',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VXF3P',
                'base_price' => 1449.00,
                'sale_price' => 1349.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/vivo-x-fold3-pro.jpg',
                'desc' => 'The ultimate foldable with Snapdragon 8 Gen 3, ZEISS APO Telephoto camera, carbon-fiber ultra-light hinge, IPX8 rating, and 5700mAh battery.',
                'variants' => [
                    ['name' => '512GB / Celestial Black', 'sku' => 'XF3P-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Celestial Black', 'color_hex' => '#0f172a', 'price' => 1449.00, 'sale_price' => 1349.00, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '8.03" 120Hz LTPO 8T AMOLED & 6.53" 120Hz Cover (4500 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 with Vivo V3 chip'],
                    'Camera' => ['Main' => '50MP VCS Bionic OIS + 64MP ZEISS Telephoto + 50MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5700 mAh, 100W FlashCharge, 50W Wireless'],
                ]
            ],
            [
                'name' => 'Vivo V40 Pro 5G',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VV40P',
                'base_price' => 549.00,
                'sale_price' => 499.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/vivo-v40-pro-5g.jpg',
                'desc' => 'ZEISS Multifocal Portrait with 50MP Sony IMX921, 50MP Telephoto portrait, Dimensity 9200+ flagship chip, and 5500mAh ultra-slim battery.',
                'variants' => [
                    ['name' => '256GB / Moonlight White', 'sku' => 'V40P-256-WHT', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Moonlight White', 'color_hex' => '#f1f5f9', 'price' => 549.00, 'sale_price' => 499.00, 'stock' => 12],
                    ['name' => '512GB / Stellar Silver', 'sku' => 'V40P-512-SLV', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Stellar Silver', 'color_hex' => '#94a3b8', 'price' => 599.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K 120Hz 3D Curved AMOLED (4500 nits)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 9200+ (4nm)'],
                    'Camera' => ['Main' => '50MP ZEISS OIS Main + 50MP Telephoto + 50MP Ultra-wide + 50MP Group Selfie'],
                    'Battery' => ['Capacity' => '5500 mAh, 80W FlashCharge'],
                ]
            ],
            [
                'name' => 'Vivo V40 5G',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VV40',
                'base_price' => 429.00,
                'sale_price' => 389.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/vivo-v40-5g.jpg',
                'desc' => 'Dual 50MP ZEISS Camera system with Aura Light, Snapdragon 7 Gen 3, IP68 & IP69 dual water protection, and 5500mAh battery in a 7.58mm frame.',
                'variants' => [
                    ['name' => '256GB / Nebula Purple', 'sku' => 'V40-256-PUR', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Nebula Purple', 'color_hex' => '#a855f7', 'price' => 429.00, 'sale_price' => 389.00, 'stock' => 14],
                    ['name' => '512GB / Titanium Gray', 'sku' => 'V40-512-GRY', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Titanium Gray', 'color_hex' => '#64748b', 'price' => 469.00, 'sale_price' => null, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K 120Hz AMOLED (4500 nits peak)'],
                    'Performance' => ['Processor' => 'Snapdragon 7 Gen 3 (4nm)'],
                    'Battery' => ['Capacity' => '5500 mAh BlueVolt, 80W FlashCharge'],
                ]
            ],
            [
                'name' => 'Vivo V30 Pro',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VV30P',
                'base_price' => 379.00,
                'sale_price' => 349.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/vivo-v30-pro.jpg',
                'desc' => 'Co-engineered with ZEISS featuring Studio Aura Light Portrait, four 50MP cameras, MediaTek Dimensity 8200, and featherweight 188g design.',
                'variants' => [
                    ['name' => '256GB / Bloom White', 'sku' => 'V30P-256-WHT', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Bloom White', 'color_hex' => '#ffffff', 'price' => 379.00, 'sale_price' => 349.00, 'stock' => 10],
                    ['name' => '512GB / Lush Green', 'sku' => 'V30P-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Lush Green', 'color_hex' => '#15803d', 'price' => 419.00, 'sale_price' => null, 'stock' => 7],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K 120Hz 3D Curved AMOLED (2800 nits)'],
                    'Camera' => ['Main' => '50MP Sony IMX920 OIS + 50MP Portrait + 50MP Ultra-wide + 50MP Selfie'],
                    'Battery' => ['Capacity' => '5000 mAh, 80W FlashCharge'],
                ]
            ],
            [
                'name' => 'Vivo Y28',
                'brand' => 'vivo',
                'category' => 'oppo-vivo',
                'sku' => 'VY28',
                'base_price' => 189.00,
                'sale_price' => 169.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/vivo-y28.jpg',
                'desc' => 'Mega 6000mAh 4-year health battery with 44W FlashCharge, Dynamic Light synchronization, Dual Stereo Speakers with 300% volume, and IP64.',
                'variants' => [
                    ['name' => '128GB / Gleaming Orange', 'sku' => 'Y28-128-ORG', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Gleaming Orange', 'color_hex' => '#fb923c', 'price' => 189.00, 'sale_price' => 169.00, 'stock' => 18],
                    ['name' => '256GB / Agate Green', 'sku' => 'Y28-256-GRN', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Agate Green', 'color_hex' => '#14532d', 'price' => 209.00, 'sale_price' => null, 'stock' => 14],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.68" 90Hz Eye Protection Sunlight Screen (1000 nits)'],
                    'Battery' => ['Capacity' => '6000 mAh, 44W FlashCharge'],
                ]
            ],

            // ==================== REALME ====================
            [
                'name' => 'Realme 13 Pro+ 5G',
                'brand' => 'realme',
                'category' => 'smartphones',
                'sku' => 'R13PP',
                'base_price' => 399.00,
                'sale_price' => 369.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/realme-13-pro-plus-5g.jpg',
                'desc' => 'Monet-inspired gold design with HYPERIMAGE+ camera architecture, Sony LYT-701 main camera with OIS, Sony LYT-600 periscope, and 80W charge.',
                'variants' => [
                    ['name' => '256GB / Monet Gold', 'sku' => 'R13P-256-GLD', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Monet Gold', 'color_hex' => '#fef08a', 'price' => 399.00, 'sale_price' => 369.00, 'stock' => 14],
                    ['name' => '512GB / Emerald Green', 'sku' => 'R13P-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Emerald Green', 'color_hex' => '#047857', 'price' => 439.00, 'sale_price' => null, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" 120Hz Curved OLED (Corning Gorilla Glass 7i)'],
                    'Camera' => ['Main' => '50MP Sony LYT-701 OIS + 50MP Sony LYT-600 3X Periscope + 8MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5200 mAh, 80W SUPERVOOC'],
                ]
            ],
            [
                'name' => 'Realme 12 Pro+ 5G',
                'brand' => 'realme',
                'category' => 'smartphones',
                'sku' => 'R12PP',
                'base_price' => 349.00,
                'sale_price' => 319.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/realme-12-pro-plus-5g.jpg',
                'desc' => 'Luxury watch design mastercrafted by Ollivier Savéo with 64MP periscope telephoto 120X zoom, Sony IMX890 OIS, and Snapdragon 7s Gen 2.',
                'variants' => [
                    ['name' => '256GB / Submarine Blue', 'sku' => 'R12P-256-BLU', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Submarine Blue (Vegan Leather)', 'color_hex' => '#1e3a8a', 'price' => 349.00, 'sale_price' => 319.00, 'stock' => 12],
                    ['name' => '512GB / Navigator Beige', 'sku' => 'R12P-512-BGE', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Navigator Beige', 'color_hex' => '#fef3c7', 'price' => 389.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" 120Hz Curved AMOLED (2160Hz PWM)'],
                    'Performance' => ['Processor' => 'Qualcomm Snapdragon 7s Gen 2'],
                    'Camera' => ['Main' => '50MP Sony IMX890 OIS + 64MP 3X Periscope + 8MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5000 mAh, 67W SUPERVOOC'],
                ]
            ],
            [
                'name' => 'Realme C67',
                'brand' => 'realme',
                'category' => 'smartphones',
                'sku' => 'RC67',
                'base_price' => 159.00,
                'sale_price' => 139.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/realme-c67.jpg',
                'desc' => '108MP 3X In-sensor zoom camera, Snapdragon 685 6nm chipset, 33W SUPERVOOC charging, dual stereo speakers, and mini capsule 2.0.',
                'variants' => [
                    ['name' => '128GB / Sunny Oasis', 'sku' => 'C67-128-GRN', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Sunny Oasis', 'color_hex' => '#86efac', 'price' => 159.00, 'sale_price' => 139.00, 'stock' => 20],
                    ['name' => '256GB / Black Rock', 'sku' => 'C67-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Black Rock', 'color_hex' => '#1e293b', 'price' => 179.00, 'sale_price' => null, 'stock' => 15],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.72" 90Hz FHD+ display (950 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 685 (6nm)'],
                    'Battery' => ['Capacity' => '5000 mAh, 33W SUPERVOOC'],
                ]
            ],

            // ==================== HONOR ====================
            [
                'name' => 'Honor Magic V3',
                'brand' => 'honor',
                'category' => 'smartphones',
                'sku' => 'HMV3',
                'base_price' => 1599.00,
                'sale_price' => 1499.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/honor-magic-v3.jpg',
                'desc' => 'The world\'s thinnest inward foldable smartphone at just 9.2mm folded. Features Snapdragon 8 Gen 3, Silicon-Carbon 5150mAh battery, and IPX8.',
                'variants' => [
                    ['name' => '512GB / Reddish Brown', 'sku' => 'MV3-512-BRN', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Reddish Brown (Aerospace Leather)', 'color_hex' => '#78350f', 'price' => 1599.00, 'sale_price' => 1499.00, 'stock' => 4],
                    ['name' => '512GB / Velvet Black', 'sku' => 'MV3-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Velvet Black', 'color_hex' => '#09090b', 'price' => 1599.00, 'sale_price' => null, 'stock' => 4],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '7.92" 120Hz LTPO Foldable & 6.43" 120Hz Cover (5000 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 3 (4nm)'],
                    'Camera' => ['Main' => '50MP Falcon OIS + 50MP Periscope Telephoto + 40MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5150 mAh 3rd Gen Silicon-Carbon, 66W Wired, 50W Wireless'],
                ]
            ],
            [
                'name' => 'Honor 200 Pro',
                'brand' => 'honor',
                'category' => 'smartphones',
                'sku' => 'H200P',
                'base_price' => 649.00,
                'sale_price' => 599.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/honor-200-pro.jpg',
                'desc' => 'Studio Harcourt portrait master with 50MP H9000 sensor, 50MP telephoto portrait, Snapdragon 8s Gen 3, 100W wired and 66W wireless SuperCharge.',
                'variants' => [
                    ['name' => '512GB / Ocean Cyan', 'sku' => 'H200P-512-CYN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Ocean Cyan', 'color_hex' => '#06b6d4', 'price' => 649.00, 'sale_price' => 599.00, 'stock' => 10],
                    ['name' => '512GB / Moonlight White', 'sku' => 'H200P-512-WHT', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Moonlight White', 'color_hex' => '#f8fafc', 'price' => 649.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K 120Hz Quad-curved OLED (3840Hz PWM)'],
                    'Performance' => ['Processor' => 'Snapdragon 8s Gen 3 (4nm)'],
                    'Battery' => ['Capacity' => '5200 mAh Silicon-Carbon, 100W Wired, 66W Wireless'],
                ]
            ],
            [
                'name' => 'Honor 200',
                'brand' => 'honor',
                'category' => 'smartphones',
                'sku' => 'H200',
                'base_price' => 469.00,
                'sale_price' => 429.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/honor-200.jpg',
                'desc' => 'Studio Harcourt Paris AI Portrait system with 50MP Sony IMX906 OIS, 50MP telephoto, Snapdragon 7 Gen 3, and 5200mAh Silicon-Carbon battery.',
                'variants' => [
                    ['name' => '256GB / Moonlight White', 'sku' => 'H200-256-WHT', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Moonlight White', 'color_hex' => '#f8fafc', 'price' => 469.00, 'sale_price' => 429.00, 'stock' => 12],
                    ['name' => '512GB / Emerald Green', 'sku' => 'H200-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Emerald Green', 'color_hex' => '#047857', 'price' => 509.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" 120Hz Quad-Curved Eye-Comfort OLED'],
                    'Performance' => ['Processor' => 'Snapdragon 7 Gen 3'],
                    'Battery' => ['Capacity' => '5200 mAh, 100W SuperCharge'],
                ]
            ],
            [
                'name' => 'Honor X9b 5G',
                'brand' => 'honor',
                'category' => 'smartphones',
                'sku' => 'HX9B',
                'base_price' => 299.00,
                'sale_price' => 269.00,
                'is_featured' => false,
                'is_bestseller' => true,
                'image' => '/images/products/honor-x9b-5g.jpg',
                'desc' => 'Ultra-Bounce Anti-Drop 360° display with Swiss SGS 5-star whole-device drop resistance, 108MP camera, and massive 5800mAh 3-day battery.',
                'variants' => [
                    ['name' => '256GB / Sunrise Orange', 'sku' => 'X9B-256-ORG', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Sunrise Orange (Vegan Leather)', 'color_hex' => '#f97316', 'price' => 299.00, 'sale_price' => 269.00, 'stock' => 18],
                    ['name' => '256GB / Midnight Black', 'sku' => 'X9B-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Midnight Black', 'color_hex' => '#111827', 'price' => 299.00, 'sale_price' => null, 'stock' => 14],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 1.5K 120Hz Curved AMOLED with Ultra-Bounce Protection'],
                    'Camera' => ['Main' => '108MP 3X Lossless Zoom + 5MP Ultra-wide + 2MP Macro'],
                    'Battery' => ['Capacity' => '5800 mAh, 35W SuperCharge (DXOMARK Gold Battery)'],
                ]
            ],

            // ==================== SONY ====================
            [
                'name' => 'Sony Xperia 5 V',
                'brand' => 'sony',
                'category' => 'smartphones',
                'sku' => 'SX5V',
                'base_price' => 799.00,
                'sale_price' => 749.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/sony-xperia-5-v.jpg',
                'desc' => 'Compact flagship featuring next-generation Exmor T for mobile sensor, 4K 120fps recording on all lenses, 3.5mm headphone jack, and full stereo sound.',
                'variants' => [
                    ['name' => '128GB / Platinum Silver', 'sku' => 'X5V-128-SLV', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Platinum Silver', 'color_hex' => '#cbd5e1', 'price' => 799.00, 'sale_price' => 749.00, 'stock' => 8],
                    ['name' => '256GB / Black', 'sku' => 'X5V-256-BLK', 'storage' => '256GB', 'ram' => '8GB', 'color' => 'Black', 'color_hex' => '#18181b', 'price' => 869.00, 'sale_price' => null, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" 21:9 FHD+ HDR OLED 120Hz (No Notch)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2'],
                    'Audio' => ['Features' => '3.5mm audio jack, Hi-Res Audio Wireless, LDAC'],
                    'Battery' => ['Capacity' => '5000 mAh, 30W USB-PD, Wireless Charging'],
                ]
            ],
            [
                'name' => 'Sony Xperia 10 VI',
                'brand' => 'sony',
                'category' => 'smartphones',
                'sku' => 'SX10VI',
                'base_price' => 399.00,
                'sale_price' => 369.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/sony-xperia-10-vi.jpg',
                'desc' => 'Ultralight 164g body with 2-day battery life, front-facing stereo speakers, 21:9 Wide OLED display, IP68 water resistance, and 3.5mm audio jack.',
                'variants' => [
                    ['name' => '128GB / Blue', 'sku' => 'X10VI-128-BLU', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Blue', 'color_hex' => '#60a5fa', 'price' => 399.00, 'sale_price' => 369.00, 'stock' => 12],
                    ['name' => '128GB / Black', 'sku' => 'X10VI-128-BLK', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Black', 'color_hex' => '#1e293b', 'price' => 399.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.1" 21:9 Wide FHD+ OLED with Triluminos display'],
                    'Performance' => ['Processor' => 'Snapdragon 6 Gen 1 (4nm)'],
                    'Battery' => ['Capacity' => '5000 mAh, 2-Day Battery Life, IP65/68'],
                ]
            ],

            // ==================== ASUS ====================
            [
                'name' => 'ASUS ROG Phone 7 Ultimate',
                'brand' => 'asus',
                'category' => 'gaming-phones',
                'sku' => 'ROG7U',
                'base_price' => 899.00,
                'sale_price' => 849.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/asus-rog-phone-7-ultimate.jpg',
                'desc' => 'Gamer powerhouse featuring revolutionary AeroActive Portal motorized cooling air duct, ROG Vision rear color matrix display, and 6000mAh monster battery.',
                'variants' => [
                    ['name' => '512GB / Storm White', 'sku' => 'ROG7U-512-WHT', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Storm White', 'color_hex' => '#f8fafc', 'price' => 899.00, 'sale_price' => 849.00, 'stock' => 6],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" Samsung AMOLED (165Hz, 720Hz touch sampling)'],
                    'Performance' => ['Processor' => 'Snapdragon 8 Gen 2 with GameCool 7'],
                    'Cooling' => ['Features' => 'AeroActive Portal motorized vent + AeroActive Cooler 7'],
                    'Battery' => ['Capacity' => '6000 mAh (dual 3000mAh), 65W HyperCharge'],
                ]
            ],
            [
                'name' => 'ASUS Zenfone 11 Ultra',
                'brand' => 'asus',
                'category' => 'smartphones',
                'sku' => 'AZ11U',
                'base_price' => 849.00,
                'sale_price' => 799.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/asus-zenfone-11-ultra.jpg',
                'desc' => '6.78" LTPO 144Hz AMOLED with Snapdragon 8 Gen 3, 6-Axis Hybrid Gimbal Stabilizer 3.0, AI Noise Cancellation, and 5500mAh HyperCharge battery.',
                'variants' => [
                    ['name' => '256GB / Skyline Blue', 'sku' => 'ZF11-256-BLU', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Skyline Blue', 'color_hex' => '#38bdf8', 'price' => 849.00, 'sale_price' => 799.00, 'stock' => 8],
                    ['name' => '512GB / Eternal Black', 'sku' => 'ZF11-512-BLK', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Eternal Black', 'color_hex' => '#18181b', 'price' => 929.00, 'sale_price' => null, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" FHD+ Samsung Flexible LTPO AMOLED (1-144Hz, 2500 nits)'],
                    'Camera' => ['Main' => '50MP Sony IMX890 Gimbal OIS + 32MP 3X Telephoto + 13MP Ultra-wide'],
                    'Battery' => ['Capacity' => '5500 mAh, 65W HyperCharge, 15W Wireless'],
                ]
            ],

            // ==================== NOTHING ====================
            [
                'name' => 'Nothing Phone (2)',
                'brand' => 'nothing',
                'category' => 'smartphones',
                'sku' => 'NP2',
                'base_price' => 599.00,
                'sale_price' => 549.00,
                'is_featured' => true,
                'is_bestseller' => true,
                'image' => '/images/products/nothing-phone-2.jpg',
                'desc' => 'Iconic Glyph Interface with 33 addressable LED zones, transparent back design, Snapdragon 8+ Gen 1, dual 50MP Sony cameras, and custom Nothing OS.',
                'variants' => [
                    ['name' => '256GB / Dark Gray', 'sku' => 'NP2-256-GRY', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Dark Gray', 'color_hex' => '#334155', 'price' => 599.00, 'sale_price' => 549.00, 'stock' => 12],
                    ['name' => '512GB / White', 'sku' => 'NP2-512-WHT', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'White', 'color_hex' => '#f8fafc', 'price' => 669.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" LTPO OLED (1-120Hz, 1600 nits)'],
                    'Performance' => ['Processor' => 'Snapdragon 8+ Gen 1 (4nm)'],
                    'Glyph' => ['Features' => 'Essential Notifications, Glyph Timer, Volume Indicator'],
                    'Battery' => ['Capacity' => '4700 mAh, 45W Wired, 15W Qi Wireless, 5W Reverse'],
                ]
            ],
            [
                'name' => 'Nothing Phone (2a) Plus',
                'brand' => 'nothing',
                'category' => 'smartphones',
                'sku' => 'NP2AP',
                'base_price' => 399.00,
                'sale_price' => 369.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/nothing-phone-2a-plus.jpg',
                'desc' => 'Metallic glow finish with custom MediaTek Dimensity 7350 Pro 5G, triple 50MP camera setup including 50MP selfie, and iconic Glyph light system.',
                'variants' => [
                    ['name' => '256GB / Metallic Gray', 'sku' => 'NP2AP-256-GRY', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Metallic Gray', 'color_hex' => '#64748b', 'price' => 399.00, 'sale_price' => 369.00, 'stock' => 10],
                    ['name' => '256GB / Black', 'sku' => 'NP2AP-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Black', 'color_hex' => '#0f172a', 'price' => 399.00, 'sale_price' => null, 'stock' => 8],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Flexible 120Hz AMOLED (1300 nits)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 7350 Pro 5G (4nm)'],
                    'Battery' => ['Capacity' => '5000 mAh, 50W Fast Charging'],
                ]
            ],
            [
                'name' => 'Nothing Phone (2a)',
                'brand' => 'nothing',
                'category' => 'smartphones',
                'sku' => 'NP2A',
                'base_price' => 319.00,
                'sale_price' => 289.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/nothing-phone-2a.jpg',
                'desc' => 'Subtly transparent design showcasing internal components, Dimensity 7200 Pro, 50MP dual OIS cameras, and 120Hz AMOLED display.',
                'variants' => [
                    ['name' => '128GB / Black', 'sku' => 'NP2A-128-BLK', 'storage' => '128GB', 'ram' => '8GB', 'color' => 'Black', 'color_hex' => '#0f172a', 'price' => 319.00, 'sale_price' => 289.00, 'stock' => 14],
                    ['name' => '256GB / Milk', 'sku' => 'NP2A-256-MLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Milk White', 'color_hex' => '#f1f5f9', 'price' => 359.00, 'sale_price' => null, 'stock' => 11],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Flexible AMOLED (30-120Hz)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 7200 Pro'],
                    'Battery' => ['Capacity' => '5000 mAh, 45W Fast Charging'],
                ]
            ],

            // ==================== INFINIX ====================
            [
                'name' => 'Infinix GT 20 Pro 5G',
                'brand' => 'infinix',
                'category' => 'gaming-phones',
                'sku' => 'IGT20P',
                'base_price' => 299.00,
                'sale_price' => 269.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/infinix-gt-20-pro-5g.jpg',
                'desc' => 'Official mobile esports gaming device with Cyber Mecha design, interactive Mecha Loop RGB mini-LEDs, Dimensity 8200 Ultimate, and dedicated gaming display chip.',
                'variants' => [
                    ['name' => '256GB / Mecha Blue', 'sku' => 'GT20P-256-BLU', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Mecha Blue', 'color_hex' => '#2563eb', 'price' => 299.00, 'sale_price' => 269.00, 'stock' => 15],
                    ['name' => '256GB / Mecha Silver', 'sku' => 'GT20P-256-SLV', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Mecha Silver', 'color_hex' => '#cbd5e1', 'price' => 299.00, 'sale_price' => null, 'stock' => 10],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" FHD+ 144Hz Bezel-less AMOLED (360Hz touch)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 8200 Ultimate 4nm with Pixelworks X5 Turbo chip'],
                    'Audio' => ['Speakers' => 'Dual Speakers sound by JBL with Hi-Res Audio'],
                    'Battery' => ['Capacity' => '5000 mAh, 45W Hyper Charge, Bypass Charging support'],
                ]
            ],
            [
                'name' => 'Infinix Note 40 Pro+ 5G',
                'brand' => 'infinix',
                'category' => 'smartphones',
                'sku' => 'IN40PP',
                'base_price' => 269.00,
                'sale_price' => 249.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/infinix-note-40-pro-plus-5g.jpg',
                'desc' => 'Revolutionary 100W All-Round FastCharge with 20W Wireless MagCharge, Cheetah X1 power chip, 108MP OIS super-zoom camera, and 120Hz 3D curved AMOLED.',
                'variants' => [
                    ['name' => '256GB / Vintage Green', 'sku' => 'N40P-256-GRN', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Vintage Green (Vegan Leather)', 'color_hex' => '#15803d', 'price' => 269.00, 'sale_price' => 249.00, 'stock' => 14],
                    ['name' => '256GB / Obsidian Black', 'sku' => 'N40P-256-BLK', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Obsidian Black', 'color_hex' => '#0f172a', 'price' => 269.00, 'sale_price' => null, 'stock' => 11],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 120Hz 3D Curved AMOLED (Corning Gorilla Glass)'],
                    'Camera' => ['Main' => '108MP OIS 3X Lossless Super-Zoom + 2MP + 2MP'],
                    'Battery' => ['Capacity' => '4600 mAh, 100W Wired Multi-Speed + 20W Wireless MagCharge'],
                ]
            ],
            [
                'name' => 'Infinix Zero 30 5G',
                'brand' => 'infinix',
                'category' => 'smartphones',
                'sku' => 'IZ30',
                'base_price' => 249.00,
                'sale_price' => 229.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/infinix-zero-30-5g.jpg',
                'desc' => 'Vlog Master with 50MP 4K 60fps front camera, 108MP OIS rear camera, 144Hz 3D curved AMOLED display, and MediaTek Dimensity 8020 5G.',
                'variants' => [
                    ['name' => '256GB / Golden Hour', 'sku' => 'Z30-256-GLD', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Golden Hour', 'color_hex' => '#fef08a', 'price' => 249.00, 'sale_price' => 229.00, 'stock' => 12],
                    ['name' => '256GB / Rome Green', 'sku' => 'Z30-256-GRN', 'storage' => '256GB', 'ram' => '12GB', 'color' => 'Rome Green (Vegan Leather)', 'color_hex' => '#166534', 'price' => 249.00, 'sale_price' => null, 'stock' => 9],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.78" 144Hz 3D Curved AMOLED (950 nits peak)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 8020 (6nm)'],
                    'Camera' => ['Main' => '108MP OIS + 13MP Ultra-wide, 50MP 4K60 Front Vlogging Camera'],
                    'Battery' => ['Capacity' => '5000 mAh, 68W Super Charge'],
                ]
            ],

            // ==================== TECNO ====================
            [
                'name' => 'Tecno Phantom V Fold2 5G',
                'brand' => 'tecno',
                'category' => 'smartphones',
                'sku' => 'TPVF2',
                'base_price' => 999.00,
                'sale_price' => 949.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/tecno-phantom-v-fold2-5g.jpg',
                'desc' => 'Second-generation flagship foldable with 7.85" 120Hz inner display, aerospace-grade titanium hinge, Ella AI assistant, and massive 5750mAh battery.',
                'variants' => [
                    ['name' => '512GB / Karst Green', 'sku' => 'PVF2-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Karst Green', 'color_hex' => '#064e3b', 'price' => 999.00, 'sale_price' => 949.00, 'stock' => 5],
                    ['name' => '512GB / Rippling Blue', 'sku' => 'PVF2-512-BLU', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Rippling Blue', 'color_hex' => '#1e40af', 'price' => 999.00, 'sale_price' => null, 'stock' => 4],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '7.85" 120Hz 2K+ Foldable AMOLED & 6.42" FHD+ Cover'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 9000+ (4nm)'],
                    'Battery' => ['Capacity' => '5750 mAh, 70W Ultra Charge, 15W Wireless'],
                ]
            ],
            [
                'name' => 'Tecno Camon 30 Premier 5G',
                'brand' => 'tecno',
                'category' => 'smartphones',
                'sku' => 'TC30P',
                'base_price' => 399.00,
                'sale_price' => 369.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/tecno-camon-30-premier-5g.jpg',
                'desc' => 'Pro photography with Sony PolarAce Imaging Chip, 50MP Sony LYT-808 main with OIS, 50MP 3X periscope, and classic rangefinder camera body aesthetics.',
                'variants' => [
                    ['name' => '512GB / Alps Snowy Silver', 'sku' => 'C30P-512-SLV', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Alps Snowy Silver', 'color_hex' => '#cbd5e1', 'price' => 399.00, 'sale_price' => 369.00, 'stock' => 10],
                    ['name' => '512GB / Hawaii Lava Black', 'sku' => 'C30P-512-BLK', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Hawaii Lava Black', 'color_hex' => '#18181b', 'price' => 399.00, 'sale_price' => null, 'stock' => 7],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.77" 1.5K 120Hz LTPO AMOLED (Corning Gorilla Glass 5)'],
                    'Performance' => ['Processor' => 'MediaTek Dimensity 8200 Ultimate with Sony PolarAce Chip'],
                    'Battery' => ['Capacity' => '5000 mAh, 70W Ultra Charge'],
                ]
            ],

            // ==================== MOTOROLA ====================
            [
                'name' => 'Motorola Razr 50 Ultra',
                'brand' => 'motorola',
                'category' => 'smartphones',
                'sku' => 'MR50U',
                'base_price' => 999.00,
                'sale_price' => 899.00,
                'is_featured' => true,
                'is_bestseller' => false,
                'image' => '/images/products/motorola-razr-50-ultra.jpg',
                'desc' => 'The ultimate flip phone with the largest 4.0-inch external pOLED display, Snapdragon 8s Gen 3, IPX8 underwater protection, and Moto AI photo tools.',
                'variants' => [
                    ['name' => '512GB / Midnight Blue', 'sku' => 'R50U-512-BLU', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Midnight Blue (Vegan Leather)', 'color_hex' => '#1e3a8a', 'price' => 999.00, 'sale_price' => 899.00, 'stock' => 6],
                    ['name' => '512GB / Spring Green', 'sku' => 'R50U-512-GRN', 'storage' => '512GB', 'ram' => '12GB', 'color' => 'Spring Green', 'color_hex' => '#86efac', 'price' => 999.00, 'sale_price' => null, 'stock' => 4],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.9" 165Hz Foldable LTPO pOLED & 4.0" 165Hz Cover pOLED'],
                    'Performance' => ['Processor' => 'Snapdragon 8s Gen 3 with Moto AI'],
                    'Camera' => ['Main' => '50MP OIS Main + 50MP 2X Telephoto portrait camera'],
                    'Battery' => ['Capacity' => '4000 mAh, 45W TurboPower, 15W Wireless'],
                ]
            ],
            [
                'name' => 'Motorola Edge 50 Ultra',
                'brand' => 'motorola',
                'category' => 'smartphones',
                'sku' => 'ME50U',
                'base_price' => 899.00,
                'sale_price' => 829.00,
                'is_featured' => false,
                'is_bestseller' => false,
                'image' => '/images/products/motorola-edge-50-ultra.jpg',
                'desc' => 'Artisanal real wood and vegan leather finishes, Pantone Validated 144Hz pOLED display, 50MP triple camera with 3X periscope zoom, and 125W TurboPower.',
                'variants' => [
                    ['name' => '512GB / Nordic Wood', 'sku' => 'E50U-512-WOD', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Nordic Wood (Real Wood Finish)', 'color_hex' => '#d97706', 'price' => 899.00, 'sale_price' => 829.00, 'stock' => 7],
                    ['name' => '512GB / Peach Fuzz', 'sku' => 'E50U-512-PCH', 'storage' => '512GB', 'ram' => '16GB', 'color' => 'Peach Fuzz (Pantone Color of the Year)', 'color_hex' => '#fdba74', 'price' => 899.00, 'sale_price' => null, 'stock' => 5],
                ],
                'specs' => [
                    'Display' => ['Screen Size' => '6.7" Super HD 144Hz pOLED (2500 nits, Pantone Validated)'],
                    'Performance' => ['Processor' => 'Snapdragon 8s Gen 3'],
                    'Battery' => ['Capacity' => '4500 mAh, 125W TurboPower, 50W Wireless'],
                ]
            ],
        ];
    }
}
