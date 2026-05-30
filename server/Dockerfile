# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apexpos -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Remove dev/seed files to reduce image size
RUN rm -f seed.js seedGrocery.js seedProducts.js checkDb.js fixIndex.js

USER apexpos
EXPOSE 5000

# Lightweight health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "server.js"]