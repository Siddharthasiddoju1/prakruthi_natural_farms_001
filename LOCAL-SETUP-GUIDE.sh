# ╔══════════════════════════════════════════════════════════════════════════════════╗
# ║     PRAKRUTHI NATURAL FARMS - LOCAL SETUP GUIDE                                ║
# ║     Complete step-by-step to run the project on your Windows machine           ║
# ╚══════════════════════════════════════════════════════════════════════════════════╝

# ==================================================================================
# TABLE OF CONTENTS
# ==================================================================================
# PART 1  : Project Overview - What This App Is
# PART 2  : Prerequisites - What You Need Installed
# PART 3  : Clone / Open the Project
# PART 4  : Install Dependencies
# PART 5  : Database Setup (SQLite - Zero Config)
# PART 6  : Run the API Server
# PART 7  : Run the Web Frontend
# PART 8  : Run the Admin Panel
# PART 9  : Test the Full Application
# PART 10 : How Authentication Works (OTP Mock)
# PART 11 : Project Structure Explained
# PART 12 : Common Development Tasks
# PART 13 : Database Management (Prisma)
# PART 14 : Environment Variables Reference
# PART 15 : Troubleshooting Common Issues
# ==================================================================================


# ██████████████████████████████████████████████████████████████████████████████████
# PART 1: PROJECT OVERVIEW
# ██████████████████████████████████████████████████████████████████████████████████

# Prakruthi Natural Farms is a full-stack e-commerce application for organic
# farm products (milk, curd, ghee, vegetables, eggs).
#
# ┌─────────────────────────────────────────────────────────────────────┐
# │                       APPLICATION ARCHITECTURE                      │
# │                                                                     │
# │  ┌──────────────────┐   ┌──────────────────┐                       │
# │  │   Web App (User) │   │  Admin Panel     │                       │
# │  │   React + Vite   │   │  React + Vite    │                       │
# │  │   Port: 5173     │   │  Port: 5174      │                       │
# │  └────────┬─────────┘   └────────┬─────────┘                       │
# │           │                       │                                 │
# │           └───────────┬───────────┘                                 │
# │                       │ HTTP API Calls                              │
# │                       ▼                                             │
# │           ┌──────────────────────┐                                  │
# │           │   API Server         │                                  │
# │           │   Express + Node.js  │                                  │
# │           │   Port: 4000         │                                  │
# │           └──────────┬───────────┘                                  │
# │                      │                                              │
# │                      ▼                                              │
# │           ┌──────────────────────┐                                  │
# │           │   Database           │                                  │
# │           │   SQLite (local file)│                                  │
# │           │   services/api/      │                                  │
# │           │    prisma/dev.db     │                                  │
# │           └──────────────────────┘                                  │
# │                                                                     │
# │  Shared Package: packages/shared/ (UI components + types)          │
# └─────────────────────────────────────────────────────────────────────┘
#
# FEATURES:
#   - Customer:  Browse products, add to cart, place orders, subscriptions
#   - Admin:     Manage products, view orders, update stock, overview dashboard
#   - Auth:      OTP-based login (mock mode for local development)
#   - Database:  SQLite for local dev (no external DB needed)


# ██████████████████████████████████████████████████████████████████████████████████
# PART 2: PREREQUISITES
# ██████████████████████████████████████████████████████████████████████████████████

# ┌─────────────────┬──────────────────────────────────────────────────────────────┐
# │ Requirement     │ Details                                                      │
# ├─────────────────┼──────────────────────────────────────────────────────────────┤
# │ Node.js 18+     │ Already included in project: node-v18.18.0-win-x86/         │
# │ npm             │ Comes with Node.js                                           │
# │ VS Code         │ Already using it                                             │
# │ Web Browser     │ Chrome / Edge / Firefox                                      │
# │ Git (optional)  │ For version control                                          │
# └─────────────────┴──────────────────────────────────────────────────────────────┘
#
# ✅ NO Docker, AWS, PostgreSQL, or any external service needed for local setup!
# ✅ The project includes its own Node.js (node-v18.18.0-win-x86)
# ✅ Database is SQLite (just a file - zero installation)

# --- Check if Node.js is available ---

# OPTION A: If you have Node.js installed system-wide:
node --version
# Expected: v18.x.x or higher

# OPTION B: Use the bundled Node.js in the project:
# Open PowerShell and run:
$env:PATH = "C:\Stellantis_Folder\1.Myself\Natural\node-v18.18.0-win-x86;" + $env:PATH
node --version
# Expected: v18.18.0

# Verify npm:
npm --version
# Expected: 9.x.x or higher


# ██████████████████████████████████████████████████████████████████████████████████
# PART 3: CLONE / OPEN THE PROJECT
# ██████████████████████████████████████████████████████████████████████████████████

# --- Option A: Project already on your machine ---
cd C:\Stellantis_Folder\1.Myself\Natural

# --- Option B: Clone from GitHub (if pushed) ---
git clone https://github.com/YOUR_USERNAME/prakruthi-natural-farms.git
cd prakruthi-natural-farms

# --- Open in VS Code ---
code .
# OR: File → Open Folder → select the Natural folder


# ██████████████████████████████████████████████████████████████████████████████████
# PART 4: INSTALL DEPENDENCIES
# ██████████████████████████████████████████████████████████████████████████████████

# This is a monorepo with npm workspaces. One install command handles everything.

# --- Step 4.1: Navigate to project root ---
cd C:\Stellantis_Folder\1.Myself\Natural

# --- Step 4.2: Install ALL dependencies (root + all apps + services) ---
npm install

# This installs dependencies for:
#   ✅ Root (workspace manager)
#   ✅ apps/web         (React customer app)
#   ✅ apps/admin       (React admin panel)
#   ✅ services/api     (Express backend)
#   ✅ packages/shared  (Shared UI components)
#
# Expected output:
#   added XXX packages in XXs
#
# ⚠️ If you see errors, see PART 15: Troubleshooting

# --- Step 4.3: Generate Prisma Client ---
cd services/api
npx prisma generate
# Expected: "✔ Generated Prisma Client"

# Return to project root
cd ../..


# ██████████████████████████████████████████████████████████████████████████████████
# PART 5: DATABASE SETUP (SQLite - Zero Config)
# ██████████████████████████████████████████████████████████████████████████████████

# The project uses SQLite for local development.
# SQLite = a database stored as a single file. No installation needed!

# --- Step 5.1: Run database migrations (creates the database) ---
cd services/api
npx prisma migrate dev
# When prompted for migration name, type: init
# Expected:
#   "Your database is now in sync with your schema."
#   Creates file: services/api/prisma/dev.db

# --- Step 5.2: Seed the database with sample products ---
npm run seed
# Expected:
#   "Seed completed { created: 5 }"
#
# This creates 5 sample products:
#   1. A2 Cow Milk        - ₹78/liter
#   2. Fresh Curd          - ₹65/500g
#   3. Desi Ghee           - ₹620/500ml
#   4. Organic Veg Basket  - ₹199/basket
#   5. Farm Fresh Eggs     - ₹120/12 pcs

# --- Step 5.3: (Optional) View database in browser ---
npx prisma studio
# Opens a database GUI at http://localhost:5555
# You can browse and edit tables: Customer, Product, Order, Cart, etc.
# Press Ctrl+C to stop

# Return to project root
cd ../..


# ██████████████████████████████████████████████████████████████████████████████████
# PART 6: RUN THE API SERVER
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 6.1: Start the API (from project root) ---
npm run dev:api

# OR navigate directly:
cd services/api
npm run dev

# Expected output:
#   API running on port 4000
#
# The API runs on: http://localhost:4000
# OTP_PROVIDER is set to "mock" (OTP is returned in API response for testing)

# --- Step 6.2: Test API is working ---
# Open a NEW terminal (keep the API running) and run:
curl http://localhost:4000/health
# Expected: {"ok":true,"service":"prakruthi-api"}

# Test products endpoint:
curl http://localhost:4000/api/products
# Expected: JSON array of 5 products

# ⚠️ KEEP THIS TERMINAL RUNNING! Open new terminals for web/admin.


# ██████████████████████████████████████████████████████████████████████████████████
# PART 7: RUN THE WEB FRONTEND (Customer App)
# ██████████████████████████████████████████████████████████████████████████████████

# Open a SECOND terminal window/tab.

# --- Step 7.1: Start the web app (from project root) ---
npm run dev:web

# OR navigate directly:
cd apps/web
npm run dev

# Expected output:
#   VITE v5.x.x  ready in XXX ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: http://192.168.x.x:5173/

# --- Step 7.2: Open in browser ---
# Open: http://localhost:5173
#
# You should see the Prakruthi Natural Farms homepage with:
#   - Product listings (5 products)
#   - Login button
#   - Cart icon
#   - Navigation

# ⚠️ KEEP THIS TERMINAL RUNNING TOO!


# ██████████████████████████████████████████████████████████████████████████████████
# PART 8: RUN THE ADMIN PANEL
# ██████████████████████████████████████████████████████████████████████████████████

# Open a THIRD terminal window/tab.

# --- Step 8.1: Start the admin panel (from project root) ---
npm run dev:admin

# OR navigate directly:
cd apps/admin
npm run dev

# Expected output:
#   VITE v5.x.x  ready in XXX ms
#   ➜  Local:   http://localhost:5174/

# --- Step 8.2: Open in browser ---
# Open: http://localhost:5174
#
# You should see the Admin Dashboard with:
#   - Overview stats (products, orders, customers, subscriptions)
#   - Product management (add/edit/toggle active)
#   - Order management (view/update status)


# ██████████████████████████████████████████████████████████████████████████████████
# PART 9: TEST THE FULL APPLICATION
# ██████████████████████████████████████████████████████████████████████████████████

# ┌─────────────────────────────────────────────────────────────────────┐
# │                    ALL 3 SERVICES RUNNING                           │
# │                                                                     │
# │  Terminal 1 (API):     http://localhost:4000   ← Backend            │
# │  Terminal 2 (Web):     http://localhost:5173   ← Customer App       │
# │  Terminal 3 (Admin):   http://localhost:5174   ← Admin Panel        │
# └─────────────────────────────────────────────────────────────────────┘

# --- Step 9.1: Test Customer Flow ---
#
# 1. Open http://localhost:5173 (Web App)
# 2. Click "Login"
# 3. Enter any 10-digit mobile number: 9876543210
# 4. Click "Send OTP"
# 5. The OTP is shown in the response (mock mode) - enter it
#    OR check the API terminal for the OTP in logs
# 6. Enter your name when prompted → You are logged in!
# 7. Browse products → Add items to cart
# 8. Go to cart → Proceed to checkout
# 9. Add a delivery address
# 10. Place order → Order confirmed!

# --- Step 9.2: Test Admin Flow ---
#
# 1. Open http://localhost:5174 (Admin Panel)
# 2. Dashboard shows:
#    - Total products count
#    - Active subscriptions
#    - Today's orders
#    - Total customers
# 3. Go to Products → Edit stock, price, toggle active/inactive
# 4. Go to Orders → View orders, update status (Placed → Packed → Delivered)

# --- Step 9.3: Test API Directly (Optional) ---
# Open a new terminal and test with curl or Postman:

# Health check
curl http://localhost:4000/health

# Get all products
curl http://localhost:4000/api/products

# Request OTP
curl -X POST http://localhost:4000/api/auth/request-otp -H "Content-Type: application/json" -d "{\"mobile\":\"9876543210\"}"
# Response: {"message":"OTP sent","otp":"123456","expiresAt":...}
# ⚠️ Note the OTP value from the response!

# Verify OTP (use the OTP from above)
curl -X POST http://localhost:4000/api/auth/verify-otp -H "Content-Type: application/json" -d "{\"mobile\":\"9876543210\",\"otp\":\"123456\",\"name\":\"Test User\"}"
# Response: {"token":"eyJhbGci...","customer":{...}}
# ⚠️ Save the token for authenticated requests!

# Get admin dashboard (uses admin API key)
curl http://localhost:4000/api/admin/overview -H "x-admin-key: prakruthi-admin-dev"


# ██████████████████████████████████████████████████████████████████████████████████
# PART 10: HOW AUTHENTICATION WORKS (OTP MOCK MODE)
# ██████████████████████████████████████████████████████████████████████████████████

# ┌───────────────────────────────────────────────────────────────────────┐
# │                    AUTHENTICATION FLOW                                │
# │                                                                       │
# │  User enters mobile number (10 digits)                                │
# │       │                                                               │
# │       ▼                                                               │
# │  POST /api/auth/request-otp  { mobile: "9876543210" }                │
# │       │                                                               │
# │       ▼                                                               │
# │  Server generates 6-digit OTP, stores in memory (5-min expiry)       │
# │  ⚠️ In MOCK mode: OTP is returned in API response                    │
# │  In PRODUCTION: OTP would be sent via SMS (Twilio/MSG91)             │
# │       │                                                               │
# │       ▼                                                               │
# │  POST /api/auth/verify-otp  { mobile, otp, name }                   │
# │       │                                                               │
# │       ▼                                                               │
# │  Server verifies OTP → Creates customer (if new) → Returns JWT      │
# │       │                                                               │
# │       ▼                                                               │
# │  Frontend stores JWT in localStorage                                  │
# │  All subsequent API calls include: Authorization: Bearer <token>      │
# │       │                                                               │
# │       ▼                                                               │
# │  JWT contains: { id, mobile, role: "customer" }                      │
# │  Expires in 7 days                                                    │
# └───────────────────────────────────────────────────────────────────────┘
#
# ADMIN AUTH:
#   - Admin panel uses a static API key (no login needed for local dev)
#   - API key is sent in header: x-admin-key: prakruthi-admin-dev
#   - Default key: "prakruthi-admin-dev" (set in services/api/src/middleware/admin.ts)


# ██████████████████████████████████████████████████████████████████████████████████
# PART 11: PROJECT STRUCTURE EXPLAINED
# ██████████████████████████████████████████████████████████████████████████████████

# prakruthi-natural-farms/
# │
# ├── package.json                 ← Root workspace config (npm workspaces)
# │
# ├── apps/
# │   ├── web/                     ← CUSTOMER WEB APP (React + Vite)
# │   │   ├── package.json         ← Web app dependencies
# │   │   ├── index.html           ← HTML entry point
# │   │   ├── vite.config.ts       ← Vite build config (port 5173)
# │   │   ├── tsconfig.json        ← TypeScript config
# │   │   └── src/
# │   │       ├── main.tsx         ← React entry point
# │   │       ├── App.tsx          ← Main app with routes
# │   │       ├── styles.css       ← Global styles
# │   │       ├── context/
# │   │       │   └── AuthContext.tsx  ← Login state management
# │   │       ├── lib/
# │   │       │   └── api.ts       ← API client (fetch calls to backend)
# │   │       ├── pages/
# │   │       │   ├── HomePage.tsx        ← Product listing
# │   │       │   ├── LoginPage.tsx       ← OTP login
# │   │       │   ├── ProductsPage.tsx    ← Product details
# │   │       │   ├── CartPage.tsx        ← Shopping cart
# │   │       │   ├── OrdersPage.tsx      ← Order history
# │   │       │   ├── SubscriptionPage.tsx ← Manage subscriptions
# │   │       │   └── AccountPage.tsx     ← User profile
# │   │       └── components/            ← Reusable UI components
# │   │
# │   └── admin/                   ← ADMIN PANEL (React + Vite)
# │       ├── package.json         ← Admin dependencies
# │       ├── index.html           ← HTML entry point
# │       └── src/
# │           ├── main.tsx         ← React entry point
# │           ├── styles.css       ← Admin styles
# │           ├── lib/
# │           │   └── api.ts       ← Admin API client (uses x-admin-key)
# │           └── pages/
# │               └── AdminDashboard.tsx  ← Dashboard with products/orders
# │
# ├── services/
# │   └── api/                     ← BACKEND API SERVER (Express + Node.js)
# │       ├── package.json         ← API dependencies
# │       ├── tsconfig.json        ← TypeScript config
# │       ├── prisma/
# │       │   ├── schema.prisma    ← DATABASE SCHEMA (tables, relations)
# │       │   ├── dev.db           ← SQLite database file (created after migrate)
# │       │   └── migrations/      ← Database migration history
# │       └── src/
# │           ├── server.ts        ← Express app setup, routes, port 4000
# │           ├── lib/
# │           │   ├── prisma.ts    ← Prisma client instance
# │           │   └── seed.ts      ← Seed data (5 default products)
# │           ├── middleware/
# │           │   ├── auth.ts      ← JWT auth middleware (requireAuth)
# │           │   └── admin.ts     ← Admin API key middleware (requireAdmin)
# │           ├── routes/
# │           │   ├── auth.ts      ← POST /api/auth/request-otp, verify-otp
# │           │   ├── products.ts  ← GET /api/products
# │           │   ├── carts.ts     ← GET/POST /api/carts
# │           │   ├── orders.ts    ← GET/POST /api/orders
# │           │   ├── addresses.ts ← GET/POST /api/addresses
# │           │   ├── subscriptions.ts ← GET/POST /api/subscriptions
# │           │   └── admin.ts     ← GET/PUT /api/admin/* (admin endpoints)
# │           ├── store/
# │           │   ├── otp-store.ts ← In-memory OTP storage
# │           │   └── memory-store.ts ← Memory store utilities
# │           └── scripts/
# │               └── seed.ts      ← Seed script entry point
# │
# ├── packages/
# │   └── shared/                  ← SHARED PACKAGE
# │       ├── package.json
# │       └── src/
# │           ├── index.ts         ← Exports
# │           └── ui/
# │               └── toast.tsx    ← Toast notification component
# │
# └── node-v18.18.0-win-x86/      ← BUNDLED NODE.JS (Windows x86)


# ██████████████████████████████████████████████████████████████████████████████████
# PART 12: COMMON DEVELOPMENT TASKS
# ██████████████████████████████████████████████████████████████████████████████████

# ═══════════════════════════════════
# START ALL 3 SERVICES (Quick Start)
# ═══════════════════════════════════
# Open 3 separate terminals and run:

# Terminal 1 - API:
npm run dev:api

# Terminal 2 - Web:
npm run dev:web

# Terminal 3 - Admin:
npm run dev:admin

# ═══════════════════════════════════
# STOP A SERVICE
# ═══════════════════════════════════
# Press Ctrl+C in the terminal running the service

# ═══════════════════════════════════
# ADD A NEW PRODUCT (via Admin Panel)
# ═══════════════════════════════════
# 1. Open http://localhost:5174 (Admin)
# 2. Go to Products section
# 3. Fill product form → Submit

# OR via API:
curl -X POST http://localhost:4000/api/admin/products ^
  -H "Content-Type: application/json" ^
  -H "x-admin-key: prakruthi-admin-dev" ^
  -d "{\"name\":\"Buffalo Milk\",\"category\":\"Milk\",\"price\":60,\"unit\":\"liter\",\"stockQty\":100}"

# ═══════════════════════════════════
# ADD A NEW API ROUTE
# ═══════════════════════════════════
# 1. Create file: services/api/src/routes/my-route.ts
# 2. Define router:
#      import { Router } from "express";
#      export const myRouter = Router();
#      myRouter.get("/", (req, res) => res.json({ hello: "world" }));
# 3. Register in services/api/src/server.ts:
#      import { myRouter } from "./routes/my-route";
#      app.use("/api/my-route", myRouter);
# 4. API auto-restarts (tsx watch mode)

# ═══════════════════════════════════
# ADD A NEW PAGE (Web App)
# ═══════════════════════════════════
# 1. Create file: apps/web/src/pages/NewPage.tsx
# 2. Add route in apps/web/src/App.tsx
# 3. Page auto-refreshes in browser (Vite HMR)

# ═══════════════════════════════════
# MODIFY DATABASE SCHEMA
# ═══════════════════════════════════
# 1. Edit services/api/prisma/schema.prisma
# 2. Run migration:
cd services/api
npx prisma migrate dev --name describe-your-change
# 3. Prisma auto-generates updated client
# 4. API auto-restarts

# ═══════════════════════════════════
# RESET DATABASE (Start Fresh)
# ═══════════════════════════════════
cd services/api

# Delete database and recreate
npx prisma migrate reset
# This will:
#   1. Drop all data
#   2. Re-run all migrations
#   3. Re-run seed (if configured)

# OR manually:
# Delete services/api/prisma/dev.db
# Run: npx prisma migrate dev
# Run: npm run seed

# ═══════════════════════════════════
# BUILD FOR PRODUCTION
# ═══════════════════════════════════
# From project root:
npm run build
# Builds all 3 apps (API, Web, Admin)

# Or individually:
npm run build:api      # → services/api/dist/
npm run build:web      # → apps/web/dist/
npm run build:admin    # → apps/admin/dist/


# ██████████████████████████████████████████████████████████████████████████████████
# PART 13: DATABASE MANAGEMENT (PRISMA)
# ██████████████████████████████████████████████████████████████████████████████████

# ═══════════════════════════════════
# DATABASE TABLES (Models)
# ═══════════════════════════════════
#
# ┌────────────────┬──────────────────────────────────────────────────────┐
# │ Table          │ Description                                          │
# ├────────────────┼──────────────────────────────────────────────────────┤
# │ Customer       │ id, mobile, name, email, isVerified, createdAt       │
# │ Address        │ id, customerId, line1, line2, area, city, pincode    │
# │ Product        │ id, name, category, price, unit, stockQty, organicTag│
# │ Cart           │ id, customerId, createdAt, updatedAt                 │
# │ CartItem       │ id, cartId, productId, quantity, itemType            │
# │ Order          │ id, customerId, addressId, total, orderStatus, etc.  │
# │ OrderItem      │ id, orderId, productId, quantity, unitPrice          │
# │ Subscription   │ id, customerId, productId, scheduleType, status      │
# └────────────────┴──────────────────────────────────────────────────────┘

# ═══════════════════════════════════
# USEFUL PRISMA COMMANDS
# ═══════════════════════════════════
cd services/api

# Open visual DB editor
npx prisma studio
# Opens at http://localhost:5555

# Generate Prisma client after schema changes
npx prisma generate

# Create a migration
npx prisma migrate dev --name my-change

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View current migration status
npx prisma migrate status

# Format schema file
npx prisma format

# Validate schema
npx prisma validate


# ██████████████████████████████████████████████████████████████████████████████████
# PART 14: ENVIRONMENT VARIABLES REFERENCE
# ██████████████████████████████████████████████████████████████████████████████████

# ═══════════════════════════════════
# API SERVER (services/api)
# ═══════════════════════════════════
#
# ┌────────────────────────┬──────────────────────────┬─────────────────────────┐
# │ Variable               │ Default Value            │ Description              │
# ├────────────────────────┼──────────────────────────┼─────────────────────────┤
# │ PORT                   │ 4000                     │ API server port          │
# │ OTP_PROVIDER           │ mock                     │ "mock" returns OTP in    │
# │                        │                          │ response; "twilio" for   │
# │                        │                          │ real SMS in production   │
# │ JWT_SECRET             │ dev-secret-change-me     │ Secret key for JWT       │
# │ ADMIN_API_KEY          │ prakruthi-admin-dev      │ Admin panel auth key     │
# │ DATABASE_URL           │ file:./dev.db (SQLite)   │ Database connection      │
# └────────────────────────┴──────────────────────────┴─────────────────────────┘
#
# ✅ All have defaults - NO .env file needed for local development!
# The dev script sets: OTP_PROVIDER=mock automatically.

# ═══════════════════════════════════
# WEB APP (apps/web)
# ═══════════════════════════════════
#
# ┌────────────────────────┬──────────────────────────┬─────────────────────────┐
# │ Variable               │ Default Value            │ Description              │
# ├────────────────────────┼──────────────────────────┼─────────────────────────┤
# │ VITE_API_BASE_URL      │ http://localhost:4000/api│ Backend API URL          │
# └────────────────────────┴──────────────────────────┴─────────────────────────┘

# ═══════════════════════════════════
# ADMIN APP (apps/admin)
# ═══════════════════════════════════
#
# ┌────────────────────────┬──────────────────────────┬─────────────────────────┐
# │ Variable               │ Default Value            │ Description              │
# ├────────────────────────┼──────────────────────────┼─────────────────────────┤
# │ VITE_API_BASE_URL      │ http://localhost:4000/api│ Backend API URL          │
# │ VITE_ADMIN_API_KEY     │ prakruthi-admin-dev      │ Admin API key            │
# └────────────────────────┴──────────────────────────┴─────────────────────────┘


# ██████████████████████████████████████████████████████████████████████████████████
# PART 15: TROUBLESHOOTING COMMON ISSUES
# ██████████████████████████████████████████████████████████████████████████████████

# ─────────────────────────────────────────────────────────
# PROBLEM: "npm install" fails with errors
# ─────────────────────────────────────────────────────────
# Fix 1: Delete node_modules and retry
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Fix 2: Use the bundled Node.js
$env:PATH = "C:\Stellantis_Folder\1.Myself\Natural\node-v18.18.0-win-x86;" + $env:PATH
npm install

# Fix 3: Clear npm cache
npm cache clean --force
npm install

# ─────────────────────────────────────────────────────────
# PROBLEM: "prisma migrate dev" fails
# ─────────────────────────────────────────────────────────
# Fix: Make sure you're in the services/api directory
cd C:\Stellantis_Folder\1.Myself\Natural\services\api
npx prisma migrate dev

# If still fails, reset:
npx prisma migrate reset --force

# ─────────────────────────────────────────────────────────
# PROBLEM: "prisma generate" shows error about engine
# ─────────────────────────────────────────────────────────
# Fix: The schema uses engineType = "binary". Regenerate:
cd services/api
npx prisma generate

# ─────────────────────────────────────────────────────────
# PROBLEM: API starts but Web shows "Network Error"
# ─────────────────────────────────────────────────────────
# Cause: API is not running or CORS issue
# Fix 1: Make sure API is running on port 4000
curl http://localhost:4000/health
# Fix 2: Check if another process is using port 4000
netstat -ano | findstr :4000
# Fix 3: If port 4000 is used, kill the process:
# Find PID from netstat output, then:
taskkill /PID <pid_number> /F

# ─────────────────────────────────────────────────────────
# PROBLEM: Port already in use (4000, 5173, or 5174)
# ─────────────────────────────────────────────────────────
# Find what's using the port:
netstat -ano | findstr :4000
netstat -ano | findstr :5173
netstat -ano | findstr :5174
# Kill the process:
taskkill /PID <pid_number> /F

# ─────────────────────────────────────────────────────────
# PROBLEM: Web page loads but shows blank or errors
# ─────────────────────────────────────────────────────────
# Fix 1: Open browser DevTools (F12) → Console tab → check errors
# Fix 2: Clear browser cache (Ctrl+Shift+Delete)
# Fix 3: Hard refresh (Ctrl+Shift+R)

# ─────────────────────────────────────────────────────────
# PROBLEM: "Cannot find module" error when running API
# ─────────────────────────────────────────────────────────
# Fix: Regenerate Prisma client
cd services/api
npx prisma generate
npm run dev

# ─────────────────────────────────────────────────────────
# PROBLEM: OTP not working / can't login
# ─────────────────────────────────────────────────────────
# In mock mode, OTP is returned in the API response.
# Check the API terminal output - the OTP is logged there.
# Make sure OTP_PROVIDER=mock (set automatically by dev script)
#
# You can also test directly:
curl -X POST http://localhost:4000/api/auth/request-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"mobile\":\"9876543210\"}"
# The "otp" field in the response is your OTP

# ─────────────────────────────────────────────────────────
# PROBLEM: Admin panel shows unauthorized
# ─────────────────────────────────────────────────────────
# The admin panel uses API key: "prakruthi-admin-dev"
# Make sure the API is running and accessible
# Check: http://localhost:4000/api/admin/overview
# With header: x-admin-key: prakruthi-admin-dev

# ─────────────────────────────────────────────────────────
# PROBLEM: TypeScript errors in VS Code
# ─────────────────────────────────────────────────────────
# Fix 1: Restart TypeScript server
#   Ctrl+Shift+P → "TypeScript: Restart TS Server"
# Fix 2: Make sure Prisma client is generated
cd services/api
npx prisma generate
# Fix 3: Reload VS Code window
#   Ctrl+Shift+P → "Developer: Reload Window"


# ██████████████████████████████████████████████████████████████████████████████████
# QUICK START SUMMARY (TL;DR)
# ██████████████████████████████████████████████████████████████████████████████████

# Run these commands in order (one-time setup):
cd C:\Stellantis_Folder\1.Myself\Natural
npm install
cd services/api
npx prisma generate
npx prisma migrate dev
npm run seed
cd ../..

# Then every time you want to develop, open 3 terminals:
# Terminal 1:
npm run dev:api

# Terminal 2:
npm run dev:web

# Terminal 3:
npm run dev:admin

# Open in browser:
#   Customer App:  http://localhost:5173
#   Admin Panel:   http://localhost:5174
#   API Health:    http://localhost:4000/health
#   DB Viewer:     npx prisma studio (http://localhost:5555)

# ═══════════════════════════════════
# API ENDPOINTS REFERENCE
# ═══════════════════════════════════
#
# AUTH:
#   POST /api/auth/request-otp     { mobile }            → { otp, expiresAt }
#   POST /api/auth/verify-otp      { mobile, otp, name } → { token, customer }
#
# PRODUCTS:
#   GET  /api/products                                    → Product[]
#
# CART (requires auth token):
#   GET  /api/carts                                       → Cart with items
#   POST /api/carts/items          { productId, qty }     → CartItem
#
# ORDERS (requires auth token):
#   GET  /api/orders                                      → Order[]
#   POST /api/orders               { addressId, ... }     → Order
#
# ADDRESSES (requires auth token):
#   GET  /api/addresses                                   → Address[]
#   POST /api/addresses            { line1, area, ... }   → Address
#
# SUBSCRIPTIONS (requires auth token):
#   GET  /api/subscriptions                               → Subscription[]
#   POST /api/subscriptions        { productId, ... }     → Subscription
#
# ADMIN (requires x-admin-key header):
#   GET  /api/admin/overview                              → Stats
#   GET  /api/admin/products                              → Product[]
#   PUT  /api/admin/products/:id   { price, stockQty }    → Product
#   GET  /api/admin/orders                                → Order[]
#   PUT  /api/admin/orders/:id     { orderStatus }        → Order
