# Install dependencies separately so this layer is cached until the lockfile changes.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the app. Next.js emits a standalone bundle that includes only the
# production dependencies it actually traced.
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Final image carries the standalone bundle instead of the full node_modules tree.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Bind to all interfaces so the container is reachable from the host.
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user rather than root.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/.next/standalone ./
# Static assets are not part of the standalone bundle and are copied separately.
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
