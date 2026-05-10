# Database Schema (PostgreSQL)

## Core Tables
- `customers` (id, mobile, name, email, is_verified, created_at)
- `addresses` (id, customer_id, line1, line2, landmark, area, city, pincode, is_default)
- `products` (id, name, category, description, price, unit, stock_qty, organic_tag, is_active)
- `subscriptions` (id, customer_id, product_id, quantity_liters, schedule_type, morning_delivery, status, start_date, paused_from, paused_to)
- `subscription_deliveries` (id, subscription_id, delivery_date, qty, status, billed)
- `carts` (id, customer_id, updated_at)
- `cart_items` (id, cart_id, product_id, quantity, item_type)
- `orders` (id, customer_id, address_id, subtotal, delivery_fee, total, payment_method, payment_status, order_status, delivery_slot, created_at)
- `order_items` (id, order_id, product_id, quantity, unit_price, item_type)
- `notifications` (id, customer_id, title, message, channel, sent_at, read_at)
- `delivery_areas` (id, area_name, pincode, is_active)
- `delivery_assignments` (id, order_id, subscription_delivery_id, area_id, rider_name, route_date)

## Indexing
- Index `customers.mobile`, `orders.customer_id`, `orders.order_status`, `subscriptions.customer_id`, `products.category`.
- Composite index for `delivery_assignments(area_id, route_date)`.

## Future Ready
- Add `wallets`, `wallet_transactions`, `offers`, `coupons`, `coupon_redemptions`.
