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

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Switch to non-root user
USER appuser

CMD ["node", "dist/server.js"]
