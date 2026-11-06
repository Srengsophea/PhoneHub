export type Role = 'super_admin' | 'admin' | 'manager' | 'staff' | 'customer';

/** Laravel decimal casts arrive as strings, so money fields are typed loosely. */
export type Money = number | string;

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatar?: string | null;
  is_active?: boolean;
  email_verified_at?: string | null;
  created_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  products_count?: number;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  display_order?: number;
  children?: Category[];
  products_count?: number;
}

export interface Specification {
  id?: number;
  group_name: string;
  name: string;
  value: string;
  display_order?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  color?: string | null;
  color_hex?: string | null;
  storage?: string | null;
  ram?: string | null;
  price: Money;
  sale_price?: Money | null;
  stock: number;
  barcode?: string | null;
  weight?: string | null;
  is_active?: boolean;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  variant_id?: number | null;
  image_path: string;
  is_primary: boolean;
  display_order?: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  user?: { id: number; name: string; avatar?: string | null; email?: string };
  product?: Pick<Product, 'id' | 'name' | 'slug'>;
  images?: { id: number; image_path: string }[];
  created_at: string;
}

export interface Product {
  id: number;
  brand_id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description?: string | null;
  description?: string | null;
  base_price: Money;
  sale_price?: Money | null;
  has_variants: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  warranty_info?: string | null;
  rating_cache?: Money;
  reviews_count?: number;
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  primary_image?: ProductImage | null;
  specifications?: Specification[];
  reviews?: Review[];
  created_at?: string;
  updated_at?: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  value: Money;
  min_spend?: Money | null;
  max_discount?: Money | null;
  usage_limit?: number | null;
  used_count?: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface CartItem {
  id: number;
  cart_id?: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  unit_price: Money;
  product: Product;
  variant?: ProductVariant | null;
}

export interface Cart {
  id?: number;
  items: CartItem[];
  subtotal: Money;
  discount_amount: Money;
  shipping_fee: Money;
  tax_amount: Money;
  total_amount: Money;
  coupon?: Coupon | null;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

export interface Address {
  id: number;
  user_id?: number;
  label?: string | null;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  village?: string | null;
  commune?: string | null;
  district?: string | null;
  province?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country: string;
  delivery_notes?: string | null;
  is_default: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'stripe' | string;

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  variant_name?: string | null;
  sku: string;
  unit_price: Money;
  quantity: number;
  subtotal: Money;
  product?: Product;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user?: User;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_method?: string;
  subtotal: Money;
  discount_amount: Money;
  coupon_code?: string | null;
  shipping_fee: Money;
  tax_amount: Money;
  total_amount: Money;
  shipping_address_snapshot?: Partial<Address> | null;
  customer_notes?: string | null;
  admin_notes?: string | null;
  items?: OrderItem[];
  items_count?: number;
  status_histories?: OrderStatusHistory[];
  payments?: unknown[];
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface InventoryTransaction {
  id: number;
  product_id: number;
  variant_id?: number | null;
  type: string;
  quantity_change: number;
  balance_after: number;
  notes?: string | null;
  product?: Pick<Product, 'id' | 'name' | 'slug'>;
  variant?: Pick<ProductVariant, 'id' | 'name' | 'sku'> | null;
  user?: Pick<User, 'id' | 'name'> | null;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Paginated<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

