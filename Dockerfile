# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS web-builder
WORKDIR /app
COPY . .
# NEXT_PUBLIC_* values must be present while Next compiles browser assets.
# The secret mount supplies .env.local without copying credentials into a layer.
RUN --mount=type=secret,id=app_env,target=/app/.env.local npm run build

FROM node:22-bookworm-slim AS web
WORKDIR /app
ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=web-builder --chown=nextjs:nodejs /app/public ./public
COPY --from=web-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=web-builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

FROM node:22-bookworm-slim AS print-bridge
WORKDIR /app
ENV NODE_ENV=production \
    PRINT_BRIDGE_HEALTH_PORT=3101
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs worker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force
COPY --chown=worker:nodejs scripts ./scripts
COPY --chown=worker:nodejs lib ./lib
USER worker
EXPOSE 3101
CMD ["node", "--experimental-strip-types", "scripts/print-bridge.ts"]
