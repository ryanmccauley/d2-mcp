# Stage 1: Build TypeScript
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Download icons (separate stage so it caches independently)
FROM node:22-slim AS icons

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY scripts/download-icons.sh ./scripts/
RUN chmod +x ./scripts/download-icons.sh && ./scripts/download-icons.sh /app/icons

# Stage 3: Production
FROM node:22-slim

# Install curl for downloading D2 + fontconfig/fonts for sharp SVG rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Download and install D2 CLI binary
ARG D2_VERSION=0.7.1
RUN curl -fsSL "https://github.com/terrastruct/d2/releases/download/v${D2_VERSION}/d2-v${D2_VERSION}-linux-amd64.tar.gz" \
    | tar xz -C /tmp \
    && mv "/tmp/d2-v${D2_VERSION}/bin/d2" /usr/local/bin/d2 \
    && chmod +x /usr/local/bin/d2 \
    && rm -rf /tmp/d2-* \
    && d2 --version

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=icons /app/icons ./icons

ENV NODE_ENV=production
ENV PORT=3000
ENV ICONS_DIR=/app/icons

EXPOSE 3000

CMD ["node", "dist/index.js"]
