FROM node:20-alpine AS builder
WORKDIR /app

# Optional Copy for manifests to avoid failure if lockfile missing
COPY package.jso[n] package-lock.jso[n] tsconfig.jso[n] ./

# Install all dependencies for build
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Build the TypeScript source
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary manifests for production install
COPY package.jso[n] package-lock.jso[n] ./

# Install only production dependencies
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]