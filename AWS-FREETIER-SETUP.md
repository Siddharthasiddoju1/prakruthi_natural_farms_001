# 🚀 AWS Free Tier Deployment Guide - Prakruthi Natural Farms
# Complete Step-by-Step Guide to Fix Production Issues

## ⚠️ AWS Free Tier Limitations
- **EC2**: 750 hours/month of t2.micro (1 vCPU, 1GB RAM)
- **RDS**: 750 hours/month of db.t2.micro (1GB RAM, 20GB storage)
- **Data Transfer**: 100GB/month outbound (first year)
- **ECR**: Private repositories free, pay per data scanned
- **ECS**: FREE (use instead of EKS - EKS has minimum charges)

---

## 📋 Architecture for Free Tier (IMPORTANT!)

```
┌─────────────────────────────────────────┐
│         AWS Free Tier Setup             │
├─────────────────────────────────────────┤
│  ❌ EKS (€0.73/hour = PAID)             │
│  ✅ ECS Fargate (750 hours FREE)        │
│  ✅ RDS PostgreSQL (750 hours FREE)     │
│  ✅ EC2 t2.micro (750 hours FREE)       │
└─────────────────────────────────────────┘
```

**We will use ECS Fargate, NOT Kubernetes!** Free tier doesn't include EKS.

---

## 🎯 Solution Overview

Fix all 7 issues with these files:

| Issue | File to Create/Fix | Status |
|-------|-------------------|--------|
| 1. Database provider mismatch | Create `.env.production` | 🔴 |
| 2. Missing env variables | Create `docker-compose.prod.yml` | 🔴 |
| 3. Frontend API URL | Fix `apps/web/` config | 🔴 |
| 4. Docker build | Update Dockerfile | 🔴 |
| 5. CORS configuration | Update `server.ts` | 🔴 |
| 6. OTP Provider | Create `.env.production` | 🔴 |
| 7. Database migrations | Add migration script | 🔴 |

---

## 📝 STEP 1: Create Environment Files

### File: `.env.development` (Local development)
```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Server
NODE_ENV=development
PORT=4000
CORS_ORIGIN="http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176"

# Authentication
JWT_SECRET="dev-secret-key-change-in-production"

# OTP Configuration
OTP_PROVIDER=mock

# Frontend URLs
VITE_API_BASE_URL="http://localhost:4000/api"
```

### File: `.env.production` (AWS Production)
```bash
# Database (Will be replaced by RDS endpoint)
DATABASE_URL="postgresql://prakruthi:CHANGE_THIS_PASSWORD@prakruthi-db.xxxxx.rds.amazonaws.com:5432/prakruthi_db"

# Server
NODE_ENV=production
PORT=4000
CORS_ORIGIN="https://yourdomain.com,https://admin.yourdomain.com"
LOG_LEVEL=info

# Authentication
JWT_SECRET="generate-strong-random-key-with-openssl-rand-base64-32"

# OTP Configuration (Using mock for free tier, upgrade to Twilio later)
OTP_PROVIDER=mock
OTP_API_KEY="twilio-key-if-upgrading"

# Frontend API URL
VITE_API_BASE_URL="https://api.yourdomain.com/api"
```

### File: `.env.staging` (For testing before production)
```bash
DATABASE_URL="postgresql://prakruthi:CHANGE_THIS_PASSWORD@prakruthi-db-staging.xxxxx.rds.amazonaws.com:5432/prakruthi_db_staging"
NODE_ENV=production
PORT=4000
CORS_ORIGIN="https://staging.yourdomain.com"
JWT_SECRET="staging-secret-change-before-production"
OTP_PROVIDER=mock
VITE_API_BASE_URL="https://staging-api.yourdomain.com/api"
```

---

## 🗄️ STEP 2: Fix Database Provider (Environment-Aware Prisma)

### File: `services/api/prisma/schema.prisma` (UPDATE)

**Replace the entire datasource block:**

```prisma
generator client {
  provider   = "prisma-client-js"
  engineType = "binary"
}

datasource db {
  // Auto-detect provider based on DATABASE_URL
  provider = env("DATABASE_PROVIDER")
  url      = env("DATABASE_URL")
}

// Rest of schema remains the same...
model Customer {
  id          String         @id @default(uuid())
  mobile      String         @unique
  name        String
  email       String?
  isVerified  Boolean        @default(true)
  createdAt   DateTime       @default(now())
  addresses   Address[]
  orders      Order[]
  carts       Cart[]
  subscriptions Subscription[]
}

model Address {
  id         String   @id @default(uuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  line1      String
  line2      String?
  landmark   String?
  area       String
  city       String
  pincode    String
  isDefault  Boolean  @default(false)
  orders     Order[]
}

model Product {
  id           String    @id @default(uuid())
  name         String
  category     String
  description  String?
  price        Decimal   @db.Decimal(10,2)
  unit         String
  stockQty     Int
  organicTag   String?
  createdAt    DateTime  @default(now())
  carts        Cart[]
  subscriptions Subscription[]
  orders       OrderItem[]
}

model Cart {
  id        String   @id @default(uuid())
  customerId String
  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime @default(now())
}

model CartItem {
  id        String @id @default(uuid())
  cartId    String
  cart      Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  itemType  String @default("ONE_TIME")
}

model Order {
  id           String   @id @default(uuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id])
  addressId    String
  address      Address  @relation(fields: [addressId], references: [id])
  subtotal     Decimal  @db.Decimal(10,2)
  deliveryFee  Decimal  @db.Decimal(10,2)
  total        Decimal  @db.Decimal(10,2)
  paymentMethod String
  status       String   @default("PLACED")
  items        OrderItem[]
  createdAt    DateTime @default(now())
}

model OrderItem {
  id        String @id @default(uuid())
  orderId   String
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10,2)
}

model Subscription {
  id           String   @id @default(uuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  quantityLiters Decimal @db.Decimal(10,2)
  scheduleType String
  morningDelivery Boolean @default(true)
  status       String   @default("ACTIVE")
  createdAt    DateTime @default(now())
}
```

### File: `services/api/prisma/.env.local` (for development - uses SQLite)
```
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

### File: `services/api/.env.development` (local dev)
```
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=development
PORT=4000
CORS_ORIGIN="http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176"
JWT_SECRET="dev-secret-change-in-production"
OTP_PROVIDER=mock
```

### File: `services/api/.env.production` (AWS production)
```
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://prakruthi:YOUR_PASSWORD@prakruthi-db.xxxxx.rds.amazonaws.com:5432/prakruthi_db"
NODE_ENV=production
PORT=4000
CORS_ORIGIN="https://yourdomain.com,https://admin.yourdomain.com"
JWT_SECRET="GENERATE_WITH: openssl rand -base64 32"
OTP_PROVIDER=mock
```

---

## 🔒 STEP 3: Fix Server Configuration (CORS + Environment)

### File: `services/api/src/server.ts` (REPLACE)

```typescript
import cors from "cors";
import express from "express";
import { addressesRouter } from "./routes/addresses";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { cartsRouter } from "./routes/carts";
import { productsRouter } from "./routes/products";
import { subscriptionsRouter } from "./routes/subscriptions";
import { ordersRouter } from "./routes/orders";

const app = express();

// ✅ CORS Configuration (Environment-aware)
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || "http://localhost:4000").split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "prakruthi-api",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/orders", ordersRouter);

// ✅ Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message 
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ API running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 CORS Origins: ${process.env.CORS_ORIGIN}`);
});
```

---

## 🌐 STEP 4: Fix Frontend Configuration

### File: `apps/web/.env.production` (CREATE)

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### File: `apps/web/.env.development` (CREATE)

```
VITE_API_BASE_URL=http://localhost:4000/api
```

### File: `apps/admin/.env.production` (CREATE)

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### File: `apps/admin/.env.development` (CREATE)

```
VITE_API_BASE_URL=http://localhost:4000/api
```

### File: `apps/web/src/lib/api.ts` (UPDATE)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export type PaymentMethod = "UPI" | "CARD" | "COD";

// ✅ Add proper error handling for API calls
export async function fetchWithErrorHandling(
  endpoint: string,
  options?: RequestInit
) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
}

// Rest of interfaces...
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | string;
  unit: string;
  stockQty: number;
  organicTag?: string | null;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  itemType: "ONE_TIME" | "SUBSCRIPTION";
  product: Product;
}

export interface Subscription {
  id: string;
  productId: string;
  quantityLiters: number | string;
  scheduleType: "DAILY" | "ALTERNATE_DAYS";
  morningDelivery: boolean;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  product: Product;
}

export interface Order {
  id: string;
  subtotal: number | string;
  deliveryFee: number | string;
  total: number | string;
  paymentMethod: PaymentMethod;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number | string;
}

export interface Customer {
  id: string;
  mobile: string;
  name: string;
  email?: string;
  isVerified: boolean;
}
```

---

## 🐳 STEP 5: Update Docker Files

### File: `services/api/Dockerfile` (REPLACE - Critical Fix)

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/api/package.json ./services/api/

# Install dependencies
RUN npm install --workspace=services/api --include-workspace-root

# Copy API source
COPY services/api/ ./services/api/

# Generate Prisma client and build
WORKDIR /app/services/api
RUN npx prisma generate
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy built artifacts
COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/services/api/prisma ./prisma
COPY --from=builder /app/services/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# ✅ Copy migration and seed scripts
COPY --from=builder /app/services/api/src/scripts ./scripts
COPY --from=builder /app/services/api/src/lib ./lib

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# ✅ Create migration initialization script
RUN cat > /app/init.sh << 'EOF'
#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy --skip-generate

echo "✅ Migrations completed!"
echo "🚀 Starting API server..."
exec node dist/server.js
EOF

RUN chmod +x /app/init.sh

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Switch to non-root user
USER appuser

# ✅ Run migrations on startup
CMD ["/app/init.sh"]
```

### File: `apps/web/Dockerfile` (REPLACE)

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root and app files
COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install --workspace=apps/web --include-workspace-root

# Copy source
COPY apps/web/ ./apps/web/

# Build with environment
WORKDIR /app/apps/web
RUN npm run build

# ============================================
# Stage 2: Nginx
# ============================================
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### File: `apps/admin/Dockerfile` (REPLACE)

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root and app files
COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY apps/admin/package.json ./apps/admin/

# Install dependencies
RUN npm install --workspace=apps/admin --include-workspace-root

# Copy source
COPY apps/admin/ ./apps/admin/

# Build
WORKDIR /app/apps/admin
RUN npm run build

# ============================================
# Stage 2: Nginx
# ============================================
FROM nginx:alpine

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## 🗄️ STEP 6: Database Migration Setup

### File: `services/api/prisma/migrations/.gitkeep` (ENSURE IT EXISTS)

This ensures migrations folder is tracked in git.

### File: `services/api/scripts/init-db.ts` (CREATE)

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Initializing database...");
  
  try {
    // Test database connection
    await prisma.$executeRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    
    // Seed sample data if empty
    const productCount = await prisma.product.count();
    
    if (productCount === 0) {
      console.log("📦 Seeding sample products...");
      await prisma.product.createMany({
        data: [
          {
            name: "A2 Cow Milk",
            category: "Milk",
            price: 78,
            unit: "1 Liter",
            stockQty: 100,
            organicTag: "100% Organic",
          },
          {
            name: "Fresh Curd",
            category: "Dairy",
            price: 65,
            unit: "500g",
            stockQty: 50,
            organicTag: "Fresh Daily",
          },
          {
            name: "Desi Ghee",
            category: "Ghee",
            price: 620,
            unit: "500ml",
            stockQty: 30,
            organicTag: "Pure Desi",
          },
          {
            name: "Organic Veg Basket",
            category: "Vegetables",
            price: 199,
            unit: "Per Basket",
            stockQty: 75,
            organicTag: "Fresh Farm",
          },
          {
            name: "Farm Fresh Eggs",
            category: "Eggs",
            price: 120,
            unit: "12 Eggs",
            stockQty: 60,
            organicTag: "Free Range",
          },
        ],
      });
      console.log("✅ Products seeded successfully");
    } else {
      console.log(`📦 Database already has ${productCount} products`);
    }
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### File: `services/api/package.json` (UPDATE scripts section)

```json
{
  "name": "@prakruthi/api",
  "private": true,
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "set OTP_PROVIDER=mock&& set DATABASE_PROVIDER=sqlite&& tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "seed": "tsx src/scripts/seed.ts",
    "init-db": "tsx scripts/init-db.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.10",
    "prisma": "^5.22.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3"
  }
}
```

---

## 🚀 STEP 7: Docker Compose for Local Testing

### File: `docker-compose.prod.yml` (CREATE - Tests production setup locally)

```yaml
version: '3.8'

services:
  # ============================================
  # PostgreSQL Database (matching RDS)
  # ============================================
  db:
    image: postgres:15-alpine
    container_name: prakruthi-db-prod
    environment:
      POSTGRES_USER: prakruthi
      POSTGRES_PASSWORD: YourStrongPassword123
      POSTGRES_DB: prakruthi_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prakruthi -d prakruthi_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - prakruthi-network

  # ============================================
  # API Service
  # ============================================
  api:
    build:
      context: .
      dockerfile: services/api/Dockerfile
    container_name: prakruthi-api-prod
    environment:
      DATABASE_PROVIDER: postgresql
      DATABASE_URL: postgresql://prakruthi:YourStrongPassword123@db:5432/prakruthi_db
      JWT_SECRET: test-jwt-secret-change-in-production
      PORT: 4000
      NODE_ENV: production
      OTP_PROVIDER: mock
      CORS_ORIGIN: "http://localhost:3000,http://localhost:3001"
    ports:
      - "4000:4000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - prakruthi-network
    restart: unless-stopped

  # ============================================
  # Web Frontend
  # ============================================
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: prakruthi-web-prod
    ports:
      - "3000:80"
    environment:
      VITE_API_BASE_URL: http://localhost:4000/api
    depends_on:
      - api
    networks:
      - prakruthi-network
    restart: unless-stopped

  # ============================================
  # Admin Dashboard
  # ============================================
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    container_name: prakruthi-admin-prod
    ports:
      - "3001:80"
    environment:
      VITE_API_BASE_URL: http://localhost:4000/api
    depends_on:
      - api
    networks:
      - prakruthi-network
    restart: unless-stopped

volumes:
  pgdata:

networks:
  prakruthi-network:
    driver: bridge
```

---

## 🌍 STEP 8: AWS Free Tier Deployment (Using ECS + RDS)

### File: `AWS-FREETIER-DEPLOY-STEPS.md` (CREATE)

```markdown
# AWS Free Tier Deployment - Complete Steps

## 🎯 Phase 1: Prerequisites (30 minutes)

### 1.1 AWS Account Setup
1. Create AWS Account: https://aws.amazon.com/free
2. Create IAM User with programmatic access
3. Attach policies:
   - AmazonEC2ContainerServiceFullAccess
   - AmazonRDSFullAccess
   - AmazonEC2FullAccess
   - AmazonVPCFullAccess
   - AmazonElasticContainerRegistryFullAccess

### 1.2 Install AWS CLI
\`\`\`bash
# Install AWS CLI v2
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region: ap-south-1, Output: json
\`\`\`

### 1.3 Install Docker
- Download Docker Desktop: https://www.docker.com/products/docker-desktop
- Start Docker Desktop before deployment

---

## 🎯 Phase 2: Create RDS Database (15 minutes)

### 2.1 Create RDS Security Group
\`\`\`bash
# Create VPC Security Group for RDS
aws ec2 create-security-group \\
  --group-name prakruthi-rds-sg \\
  --description "Security group for Prakruthi RDS" \\
  --vpc-id vpc-xxxxx  # Your VPC ID

# Allow PostgreSQL access from anywhere (open for development)
aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxx \\
  --protocol tcp \\
  --port 5432 \\
  --cidr 0.0.0.0/0
\`\`\`

### 2.2 Create RDS Instance (FREE TIER - db.t2.micro)
\`\`\`bash
aws rds create-db-instance \\
  --db-instance-identifier prakruthi-db \\
  --db-instance-class db.t2.micro \\
  --engine postgres \\
  --engine-version 15.3 \\
  --master-username prakruthi \\
  --master-user-password YourStrongPassword123! \\
  --allocated-storage 20 \\
  --vpc-security-group-ids sg-xxxxx \\
  --publicly-accessible \\
  --no-multi-az \\
  --storage-type gp2 \\
  --enable-iam-database-authentication \\
  --backup-retention-period 7 \\
  --region ap-south-1

# Wait for RDS to be available (5-10 minutes)
aws rds describe-db-instances --db-instance-identifier prakruthi-db --region ap-south-1
\`\`\`

### 2.3 Get RDS Endpoint
\`\`\`bash
aws rds describe-db-instances \\
  --db-instance-identifier prakruthi-db \\
  --query 'DBInstances[0].Endpoint.Address' \\
  --region ap-south-1
# Copy this endpoint and update .env.production
\`\`\`

### 2.4 Create Database
\`\`\`bash
# Install PostgreSQL client
# Windows: https://www.postgresql.org/download/windows/
# Or use: choco install postgresql

# Connect to RDS and create database
psql -h prakruthi-db.xxxxx.rds.amazonaws.com -U prakruthi -d postgres -c "CREATE DATABASE prakruthi_db;"

# Verify
psql -h prakruthi-db.xxxxx.rds.amazonaws.com -U prakruthi -d prakruthi_db -c "\\dt"
\`\`\`

---

## 🎯 Phase 3: ECR (Elastic Container Registry) Setup (10 minutes)

### 3.1 Create ECR Repositories
\`\`\`bash
# Create repositories for each service
aws ecr create-repository --repository-name prakruthi/api --region ap-south-1
aws ecr create-repository --repository-name prakruthi/web --region ap-south-1
aws ecr create-repository --repository-name prakruthi/admin --region ap-south-1
\`\`\`

### 3.2 Build and Push Docker Images
\`\`\`bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 266579819838.dkr.ecr.ap-south-1.amazonaws.com

# Build API image
docker build -t prakruthi/api -f services/api/Dockerfile .
docker tag prakruthi/api:latest 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api:latest
docker push 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api:latest

# Build Web image
docker build -t prakruthi/web -f apps/web/Dockerfile .
docker tag prakruthi/web:latest 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/web:latest
docker push 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/web:latest

# Build Admin image
docker build -t prakruthi/admin -f apps/admin/Dockerfile .
docker tag prakruthi/admin:latest 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/admin:latest
docker push 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/admin:latest
\`\`\`

---

## 🎯 Phase 4: Run on EC2 t2.micro (FREE TIER)

### 4.1 Launch EC2 Instance
\`\`\`bash
# Create Security Group for EC2
aws ec2 create-security-group \\
  --group-name prakruthi-ec2-sg \\
  --description "Security group for Prakruthi EC2"

# Allow SSH (22), HTTP (80), HTTPS (443)
aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxx \\
  --protocol tcp \\
  --port 22 \\
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxx \\
  --protocol tcp \\
  --port 80 \\
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \\
  --group-id sg-xxxxx \\
  --protocol tcp \\
  --port 443 \\
  --cidr 0.0.0.0/0

# Launch t2.micro (FREE!)
aws ec2 run-instances \\
  --image-id ami-0fc7d26b77ee11b52 \\
  --instance-type t2.micro \\
  --key-name my-key-pair \\
  --security-group-ids sg-xxxxx \\
  --region ap-south-1
\`\`\`

### 4.2 Setup EC2 with Docker
\`\`\`bash
# SSH into EC2
ssh -i my-key-pair.pem ec2-user@your-ec2-ip

# Install Docker
sudo amazon-linux-extras install docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone https://github.com/YOUR_USERNAME/prakruthi-natural-farms.git
cd prakruthi-natural-farms
\`\`\`

### 4.3 Deploy with Docker Compose
\`\`\`bash
# Create .env.production on EC2
cat > .env.production << 'EOF'
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://prakruthi:YourPassword@prakruthi-db.xxxxx.rds.amazonaws.com:5432/prakruthi_db
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
OTP_PROVIDER=mock
VITE_API_BASE_URL=https://api.yourdomain.com
EOF

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api
\`\`\`

---

## 🎯 Phase 5: Setup Domain & SSL (Route53 + CloudFront)

### 5.1 Register Domain
\`\`\`bash
# Get hosted zone ID for your domain
aws route53 list-hosted-zones-by-name --dns-name yourdomain.com
\`\`\`

### 5.2 Create A Record pointing to EC2
\`\`\`bash
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z123456789ABC \\
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_EC2_ELASTIC_IP"}]
      }
    }]
  }'
\`\`\`

### 5.3 Setup HTTPS with Let's Encrypt (on EC2)
\`\`\`bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --standalone -d api.yourdomain.com -d yourdomain.com

# Store certificate location and use in nginx config
\`\`\`

---

## 📊 FREE TIER COSTS

| Service | Free Tier Limit | Your Usage | Cost |
|---------|-----------------|-----------|------|
| EC2 t2.micro | 750 hours/month | ~730 (24/7) | $0 |
| RDS db.t2.micro | 750 hours/month | ~730 (24/7) | $0 |
| Data Transfer Out | 100GB/month | ~5GB | $0 |
| ECR Storage | 500MB | ~200MB | $0 |
| **TOTAL** | | | **$0** |

**After 12 months**: ~$20-30/month for on-demand EC2 + RDS

---

## ✅ Validation Checklist

- [ ] RDS database is running and accessible
- [ ] Docker images are pushed to ECR
- [ ] EC2 instance is running
- [ ] Docker containers are running on EC2
- [ ] API is accessible at https://api.yourdomain.com/health
- [ ] Web app loads at https://yourdomain.com
- [ ] Admin panel loads at https://admin.yourdomain.com
- [ ] Database tables are created
- [ ] Sample products are visible
- [ ] Login flow works
- [ ] Orders can be created

---

## 🚨 Troubleshooting

### Issue: "Database connection refused"
\`\`\`bash
# Check RDS is publicly accessible
aws rds describe-db-instances \\
  --db-instance-identifier prakruthi-db \\
  --query 'DBInstances[0].PubliclyAccessible'

# If false, modify:
aws rds modify-db-instance \\
  --db-instance-identifier prakruthi-db \\
  --publicly-accessible \\
  --apply-immediately
\`\`\`

### Issue: "Container failing to start"
\`\`\`bash
# View container logs
docker-compose logs api

# Check database migrations ran
docker exec prakruthi-api npx prisma migrate status
\`\`\`

### Issue: "API not responding to requests"
\`\`\`bash
# Check CORS settings
# Verify CORS_ORIGIN environment variable is set correctly
env | grep CORS_ORIGIN

# Check network connectivity
curl http://localhost:4000/health
\`\`\`
```

---

## 📋 Final Checklist

After implementing all steps:

- [ ] All 7 environment files created (.env.development, .env.production, .env.staging)
- [ ] Prisma schema updated to use environment variable DATABASE_PROVIDER
- [ ] server.ts updated with CORS configuration
- [ ] Frontend API URLs configured
- [ ] Dockerfiles updated with migration scripts
- [ ] docker-compose.prod.yml created for local testing
- [ ] AWS deployment steps documented
- [ ] Database migrations working locally
- [ ] Testing with `docker-compose -f docker-compose.prod.yml up`
- [ ] RDS database created on AWS
- [ ] ECR images pushed
- [ ] EC2 deployment tested

---

## 🎓 Next Steps

1. **Test locally first**: `docker-compose -f docker-compose.prod.yml up`
2. **Fix any issues** before pushing to AWS
3. **Deploy to RDS** and test database connection
4. **Deploy images to ECR**
5. **Launch EC2** and test full stack
6. **Setup domain** and SSL certificate
7. **Monitor logs** and optimize

---

## 📞 Support Resources

- AWS Free Tier: https://aws.amazon.com/free/
- Docker Docs: https://docs.docker.com/
- Prisma Docs: https://www.prisma.io/docs/
- ECS Docs: https://docs.aws.amazon.com/ecs/

**Total setup time: ~2-3 hours on first run**
```

---

## 📝 Quick Reference: All Files to Create/Update

```bash
✅ Create:
  .env.development
  .env.production
  .env.staging
  apps/web/.env.production
  apps/web/.env.development
  apps/admin/.env.production
  apps/admin/.env.development
  services/api/.env.development
  services/api/.env.production
  services/api/scripts/init-db.ts
  docker-compose.prod.yml
  AWS-FREETIER-DEPLOY-STEPS.md

🔄 Update:
  services/api/prisma/schema.prisma
  services/api/src/server.ts
  services/api/Dockerfile
  apps/web/Dockerfile
  apps/admin/Dockerfile
  apps/web/src/lib/api.ts
  services/api/package.json
```

---

## 🧪 Test Locally Before AWS

```bash
# 1. Make sure all .env files are created
# 2. Set DATABASE_PROVIDER for local development
set DATABASE_PROVIDER=sqlite

# 3. Install dependencies
npm install

# 4. Generate Prisma client
cd services/api
npx prisma generate
npx prisma migrate dev --name init
npm run seed
cd ../..

# 5. Test with production Docker setup
docker-compose -f docker-compose.prod.yml up

# 6. Verify all services are working
curl http://localhost:4000/health
# Should return: {"ok":true,"service":"prakruthi-api","environment":"production"}

# 7. Test in browser
# Web: http://localhost:3000
# Admin: http://localhost:3001
```

---

## 💡 Key Takeaways

✅ **Local dev** = SQLite (no external dependencies)  
✅ **Production** = PostgreSQL (scalable & reliable)  
✅ **Docker** handles environment switching  
✅ **Free tier** = $0 for 12 months  
✅ **ECS** instead of EKS (no extra charges)  
✅ **Environment variables** prevent hardcoding secrets  

You're now ready to deploy on AWS Free Tier! 🚀
