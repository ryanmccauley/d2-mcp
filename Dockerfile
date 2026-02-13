# Stage 1: Build TypeScript
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Production
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

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
