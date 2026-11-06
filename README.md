# PhoneHub — Enterprise Full-Stack Smartphone E-Commerce Platform

[![Laravel](https://img.shields.io/badge/Laravel-12%2F13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Sanctum](https://img.shields.io/badge/Auth-Sanctum_Tokens-red?style=for-the-badge)](https://laravel.com/docs/sanctum)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

PhoneHub is a high-performance, full-stack smartphone e-commerce ecosystem. It combines an authentic **Laravel 12+ REST API backend** (with pessimistic inventory locking, guest cart migration, and RBAC) and a brand-new, studio-light **React 19 + Tailwind CSS v4 customer storefront and executive admin portal**.

---

## 🏛️ System Architecture

```text
                                [ Customer & Admin Browser ]
                                             │
                                     Port 5173 (Vite Dev)
                                             │
                        ┌────────────────────┴────────────────────┐
                        │              Vite Proxy Gateway         │
                        │   (/api, /storage, /images/products)    │
                        └────────────────────┬────────────────────┘
                                             │
                                     Port 8000 (Laravel API)
                                             ▼
                 ┌────────────────────────────────────────────────────────┐
                 │                Laravel 12 REST Engine                  │
                 │   • Sanctum Token Auth      • RBAC Role Guards         │
                 │   • Cart & Checkout Service • Inventory Ledger         │
                 │   • Payment Gateways        • Audit Logging            │
                 └───────────────────────────┬────────────────────────────┘
                                             │
                     ┌───────────────────────┼───────────────────────┐
                     ▼                       ▼                       ▼
            ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
            │ SQLite/MySQL 8  │     │ Product Media   │     │ Stripe & KHQR   │
            │ Relational DB   │     │ (101 Studio PNG)│     │ Payment Drivers │
            └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## ✨ Key Features

### 🛍️ Public Customer Storefront
* **Clean Light Studio Aesthetics**: Modern Apple and Samsung keynote-inspired design language with zero dark sci-fi clutter.
* **Interactive Flagship Hero Showcase**: Smooth model switching between leading flagships (iPhone 16 Pro Max, Galaxy S25 Ultra, Pixel 9 Pro XL) with live specs, pricing, and ground contact shadows.
* **Authentic Manufacturer Branding**: Real SVG brand logos for all 15 official manufacturers (Apple, Samsung, Google, Xiaomi, OnePlus, OPPO, Vivo, Realme, Huawei, Sony, ASUS/ROG, Honor, Nothing, Motorola, Infinix, Tecno).
* **Seamless Product Cards**: Borderless, card-filling smartphone presentations with 100% transparent studio-isolated device cutouts.
* **Smart Shopping Cart Drawer**: Slide-out cart with instant quantity adjustments, free shipping progress bar, and coupon validation.
* **Guest-to-User Cart Migration**: Seamlessly preserves guest carts via `X-Guest-Session-Id` and merges items upon registration or login.
* **Device Comparison Engine (`/compare`)**: Side-by-side technical matrix comparing displays, chipsets, camera systems, and battery specs.
* **Instant Quick Search (`Ctrl + K`)**: Modal search with real-time filtering by keyword, brand, and category.
* **Order Tracking Timeline (`/track-order`)**: Public tracking showing real-time dispatch progress.

### 🛡️ Executive Admin Portal (`/admin`)
* **Role-Based Access Control**: Protected by `role:admin,super_admin,manager` middleware.
* **Dashboard Analytics**: Revenue cards, top-selling models, category breakdowns, and order volume charts.
* **Catalog Management**: Full CRUD operations for smartphone models, variants (RAM/Storage/Color), and hardware specs.
* **Inventory Control & Ledger**: Live stock monitoring, low-stock warnings, and concurrency-safe manual adjustments.
* **Order Progression**: Complete lifecycle state machine (`pending` → `confirmed` → `processing` → `shipped` → `delivered` → `cancelled`) with automatic stock replenishment on cancellation.
* **Coupons & Promotions**: Percentage and fixed-discount vouchers with minimum spend and expiration constraints.
* **Review Moderation**: Approve, reject, or flag customer reviews.
* **Security Audit Logs**: Immutable chronological record of administrative actions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5.7, Vite 6 |
| **Styling & Icons** | Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React |
| **State Management** | Zustand (Persistent Cart, Auth, Wishlist, Compare) |
| **Routing & Notifications** | React Router v7, React Hot Toast |
| **Backend Framework** | Laravel 12 / 13 (PHP 8.2+), Laravel Sanctum 4.x |
| **Database** | SQLite (Default for instant zero-config dev) / MySQL 8 |
| **Payment Gateways** | Stripe SDK (`stripe/stripe-php`), Cash on Delivery, ABA KHQR Bank Transfer |
| **Asset Pipeline** | Single source of truth in `backend/public/images/products/` with Vite reverse proxy |

---

## 🚀 Quick Start Guide

### Prerequisites
* **PHP**: `>= 8.2` with `pdo_sqlite`, `mbstring`, `openssl`, `curl` extensions.
* **Composer**: `^2.x`
* **Node.js**: `>= 20.x` with `npm`

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install PHP dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Run migrations and seed database (101 genuine smartphones, 15 brands, test accounts)
php artisan migrate:fresh --seed

# Create storage symlink
php artisan storage:link

# Start the Laravel REST API server (Port 8000)
php artisan serve
```

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the Vite development server (Port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@example.com` | `password` | Customer Storefront + Executive Admin (`/admin`) |
| **Customer** | `customer@example.com` | `password` | Customer Storefront, Cart, Wishlist, Profile |

---

## 🧪 Automated Testing

### Backend Feature Tests (PHPUnit)
Verifies authentication, RBAC authorization, catalog filtering, guest cart merge, pessimistic inventory concurrency, and order transactions:

```bash
cd backend
php artisan test
```
*Result: 18 passed tests, 68 assertions.*

### Frontend Production Build
Verifies TypeScript type safety, asset bundling, and CSS compilation:

```bash
cd frontend
npm run build
```
*Result: Clean compilation in ~400ms with zero errors.*

---

## 📡 API Reference Overview

All API endpoints are versioned under `/api/v1` and return standardized JSON responses. Full OpenAPI specifications are documented in [`backend/API.md`](backend/API.md).

### Public Storefront
* `GET /api/v1/products` — Paginated catalog with faceted filters (`brand`, `category`, `search`, `min_price`, `max_price`, `sort`).
* `GET /api/v1/products/{slug}` — Single phone specifications, gallery, variants, and reviews.
* `GET /api/v1/brands` — List of all 15 smartphone manufacturers with model counts.
* `GET /api/v1/categories` — Smartphone form-factor categories.
* `GET /api/v1/orders/track/{order_number}` — Public tracking status.

### Shopping Cart & Checkout
* `GET /api/v1/cart` — Retrieve active cart (Guest session or Sanctum token).
* `POST /api/v1/cart/items` — Add item variant with live stock validation.
* `PUT /api/v1/cart/items/{id}` — Update item quantity.
* `DELETE /api/v1/cart/items/{id}` — Remove item.
* `POST /api/v1/cart/coupon` — Apply discount voucher.
* `POST /api/v1/checkout` — Transactional checkout with `lockForUpdate` stock deduction.

### Customer Account (Sanctum Token Required)
* `GET /api/v1/orders` — Customer order history.
* `GET /api/v1/orders/{id}` — Detailed order receipt.
* `GET /api/v1/wishlist` — User's saved devices.
* `POST /api/v1/reviews` — Submit verified customer review.

### Admin Management (`role:admin,super_admin,manager`)
* `GET /api/v1/admin/dashboard/stats` — Revenue metrics, top models, order analytics.
* `apiResource /api/v1/admin/products` — Full phone catalog CRUD.
* `GET /api/v1/admin/inventory` — Stock levels and low-stock alerts.
* `POST /api/v1/admin/inventory/adjust` — Concurrency-safe stock adjustment with audit trail.
* `PUT /api/v1/admin/orders/{id}/status` — Status progression with automated restock on cancellation.
* `GET /api/v1/admin/audit-logs` — Immutable audit trail.

---

## 💡 Core Architecture Highlights

### 1. Concurrency-Safe Inventory Ledger
Inventory deductions occur inside database transactions using pessimistic row locking (`lockForUpdate`). When simultaneous orders exceed available stock, the secondary transaction aborts with HTTP 422, guaranteeing that inventory can **never drop below zero**. Every change is recorded in an `inventory_transactions` ledger for full auditability.

### 2. Single Source of Truth Media Pipeline
All product media lives in `backend/public/images/products/` as 100% transparent, studio-isolated PNG assets. The Vite frontend proxies `/images/products` directly to the Laravel backend. This eliminates file duplication between repositories while enabling instant image serving across both web and API clients.

### 3. Resilient Address Hierarchy
Checkout supports both international and regional address formats. During order placement, shipping addresses are completely snapshotted into `orders.shipping_address_snapshot`, ensuring historical order records remain immutable even if the customer later updates their profile address.

---

## 📄 License
This project is open-source software licensed under the [MIT license](LICENSE).

