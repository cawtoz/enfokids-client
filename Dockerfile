# Build stage
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Runtime stage
FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

CMD ["bun", "./dist/server/entry.mjs"]
