# Prakruthi Natural Farms - Web Application

Production-oriented monorepo scaffold for a premium ecommerce platform focused on natural farming products and milk subscriptions.

## Modules
- `apps/web`: Customer-facing ecommerce web app
- `apps/admin`: Admin dashboard web app
- `services/api`: Scalable backend API
- `packages/shared`: Shared types/contracts
- `docs`: Architecture, schema, user flows

## Core Features Covered
- OTP login/signup flow design
- Profile and address management
- Daily milk subscriptions (pause/resume, schedule, monthly summary)
- Product catalog with stock, tags, and pricing
- Cart and checkout (subscription + one-time products)
- Payment options (UPI, card, COD)
- Order tracking and history
- Push notification event model
- Admin management for products, subscriptions, orders, and customers
- Area-based morning delivery support

## Quick Start (After Node.js Install)
1. Install Node.js LTS (20+ recommended)
2. Run `npm install`
3. Run customer app: `npm run dev:web`
4. Run admin app: `npm run dev:admin`
5. Run backend API: `npm run dev:api`

## Notes
- This scaffold is intentionally modular and future-ready for wallet, offers, and coupon systems.
- See `docs/` for architecture and DB design.

## Implemented Backend APIs
- `POST /api/auth/request-otp` - request OTP for mobile login (mock mode returns OTP in response)
- `POST /api/auth/verify-otp` - verify OTP and receive JWT token
- `GET /api/auth/me` - get logged-in profile
- `PUT /api/auth/profile` - update profile
- `GET /api/addresses` - list customer addresses (auth required)
- `POST /api/addresses` - create customer address
- `PUT /api/addresses/:id` - update customer address
- `GET /api/products` - list active products from DB
- `GET /api/subscriptions` - list customer subscriptions
- `POST /api/subscriptions` - create milk subscription
- `POST /api/subscriptions/:id/pause` - pause a subscription
- `POST /api/subscriptions/:id/resume` - resume a subscription
- `GET /api/carts` - get customer cart
- `POST /api/carts/items` - add cart item (supports `ONE_TIME` and `SUBSCRIPTION`)
- `PATCH /api/carts/items/:id` - update cart item quantity
- `DELETE /api/carts/items/:id` - remove cart item
- `GET /api/orders` - list customer order history with tracking status
- `POST /api/orders/checkout` - create order (UPI/CARD/COD)

## Admin APIs (Header `x-admin-key` required)
- `POST /api/admin/bootstrap` - seed default products for first run (`force=true` to reset)
- `GET /api/admin/overview` - products, subscriptions, customers, today orders summary
- `GET /api/admin/orders` - list recent orders
- `PATCH /api/admin/orders/:id/status` - update order status
- `GET /api/admin/delivery-list/export` - download daily delivery list (`date=YYYY-MM-DD`, `format=csv|json`)
- `GET /api/admin/products` - list products
- `POST /api/admin/products` - create product
- `PATCH /api/admin/products/:id` - update product price/stock/active status
- `DELETE /api/admin/products/:id` - delete product (soft-delete if referenced)
- `GET /api/admin/subscriptions` - list subscriptions
- `GET /api/admin/customers` - list customers

## Prisma Database Setup (After Node.js Install)
1. Set `DATABASE_URL` in `.env`
2. Run `npm install`
3. Run `npm --workspace services/api run prisma:generate`
4. Run `npm --workspace services/api run prisma:migrate -- --name init`
5. Start API: `npm run dev:api`
6. Seed default products: `npm --workspace services/api run seed`

## Admin Frontend Environment
- Create `apps/admin/.env` from `apps/admin/.env.example`
- Set `VITE_API_BASE_URL` and `VITE_ADMIN_API_KEY`
