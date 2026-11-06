# PhoneHub - Premium Smartphone Store & Admin Management Platform

## 1. Overview
PhoneHub is a full-stack, enterprise-grade e-commerce application designed specifically for high-end smartphones, tablets, and mobile accessories. 

The backend is built with **Laravel 11+**, providing a fully authenticated RESTful API with Sanctum bearer tokens, role-based access control (RBAC), multi-gateway checkout processing, and real-time inventory management.

The frontend is built with **React 19, TypeScript, Tailwind CSS v4, Zustand, and React Router v7**, delivering a clean, modern, Apple/minimalist flagship UI alongside an executive admin dashboard.

---

## 2. Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@example.com` | `password` |
| **Customer** | `customer@example.com` | `password` |

---

## 3. How to Run Locally

### Start Backend (Laravel)
```bash
cd backend
php artisan serve
# Running at http://127.0.0.1:8000
```
*Note: SQLite database is pre-configured and seeded with over 100 flagship smartphones, categories, brands, variants, coupons, and specifications.*

### Start Frontend (Vite + React)
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```
*Vite automatically proxies `/api` and `/storage` requests to `http://127.0.0.1:8000`.*

---

## 4. REST API Endpoints Specification

### 4.1 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Create account (`name`, `email`, `password`, `password_confirmation`, `phone`, `guest_session_id`)
- `POST /api/v1/auth/login` - Authenticate (`email`, `password`, `guest_session_id`)
- `POST /api/v1/auth/logout` - Revoke current token (`auth:sanctum`)
- `GET /api/v1/auth/user` - Fetch authenticated user profile (`auth:sanctum`)

### 4.2 Public Catalog & Orders
- `GET /api/v1/products` - Filtered & paginated smartphone catalog
  - *Query Params*: `page`, `per_page`, `search`, `brand`, `category`, `min_price`, `max_price`, `in_stock`, `on_sale`, `featured`, `sort` (`featured`, `best_selling`, `newest`, `price_asc`, `price_desc`, `highest_rated`)
- `GET /api/v1/products/suggestions?q={query}` - Instant search suggestions
- `GET /api/v1/products/{slug}` - Detailed product specifications, variants, reviews, and gallery
- `GET /api/v1/brands` - Brands list with product count
- `GET /api/v1/categories` - Categories taxonomy
- `GET /api/v1/orders/track/{orderNumber}` - Public order tracking status & items

### 4.3 Shopping Cart (`/api/v1/cart`)
*Supports guest sessions via `X-Guest-Session-Id` header and authenticated user carts.*
- `GET /api/v1/cart` - View current cart and calculated totals
- `POST /api/v1/cart/items` - Add item (`product_id`, `variant_id`, `quantity`)
- `PUT /api/v1/cart/items/{id}` - Update quantity (`quantity`)
- `DELETE /api/v1/cart/items/{id}` - Remove item
- `DELETE /api/v1/cart` - Clear entire cart
- `POST /api/v1/cart/coupon` - Apply coupon voucher (`code`)
- `DELETE /api/v1/cart/coupon` - Remove active coupon

### 4.4 Customer Protected (`auth:sanctum`)
- `POST /api/v1/checkout` - Create order (`shipping_address`, `payment_method`, `customer_notes`)
- `GET /api/v1/orders` - Customer's past orders
- `GET /api/v1/wishlist` - View saved phones
- `POST /api/v1/wishlist` - Add phone to wishlist (`product_id`)
- `DELETE /api/v1/wishlist/{productId}` - Remove phone from wishlist
- `POST /api/v1/reviews` - Submit product review (`product_id`, `rating`, `title`, `comment`)
- `PUT /api/v1/user/profile` - Update profile (`name`, `phone`)
- `PUT /api/v1/user/password` - Change password (`current_password`, `password`, `password_confirmation`)

### 4.5 Admin Protected (`auth:sanctum` + `role:admin,super_admin,manager`)
- `GET /api/v1/admin/dashboard/stats` - Total revenue, orders, customers, and recent orders
- `GET /api/v1/admin/products` - List all products (with pagination and search)
- `POST /api/v1/admin/products` - Create new smartphone
- `PUT /api/v1/admin/products/{id}` - Update smartphone specifications & pricing
- `DELETE /api/v1/admin/products/{id}` - Soft delete smartphone
- `GET /api/v1/admin/orders` - View all customer orders with filtering
- `PUT /api/v1/admin/orders/{id}/status` - Update order fulfillment status
- `GET /api/v1/admin/inventory/history` - Warehouse inventory audit transactions
- `POST /api/v1/admin/inventory/adjust` - Manual stock adjustment (`product_id`, `variant_id`, `quantity_change`, `notes`)
- `GET /api/v1/admin/customers` - Customer user accounts list
- `PUT /api/v1/admin/customers/{id}/toggle-status` - Activate or suspend customer account
- `GET /api/v1/admin/coupons` - List vouchers & discounts
- `POST /api/v1/admin/coupons` - Create new coupon code
- `DELETE /api/v1/admin/coupons/{id}` - Delete coupon
- `GET /api/v1/admin/reviews` - List submitted customer reviews
- `PUT /api/v1/admin/reviews/{id}/status` - Approve or reject user review
- `GET /api/v1/admin/audit-logs` - System security and action audit trails

