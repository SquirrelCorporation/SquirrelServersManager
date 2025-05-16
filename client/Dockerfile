# 1. Build shared-lib (TypeScript to JS)
FROM node:23.11.0-alpine AS shared-lib-builder
WORKDIR /opt/squirrelserversmanager/shared-lib
COPY --from=shared-lib /. ./
RUN npm ci --legacy-peer-deps --no-audit
RUN npm run build

# 2. Install client dependencies and build app
FROM node:23.11.0-alpine AS builder
WORKDIR /opt/squirrelserversmanager/client
COPY ./package*.json ./
COPY ./tsconfig.json ./
# Copy the shared-lib
COPY --from=shared-lib-builder /opt/squirrelserversmanager/shared-lib ../shared-lib
# Install all dependencies including dev dependencies for build
RUN npm ci --legacy-peer-deps --no-audit
# Copy source files
COPY . .
# Build the app
RUN npm run build

# 3. Production image: minimal with only what's needed to run
FROM node:23.11.0-alpine AS production
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Client"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"
WORKDIR /opt/squirrelserversmanager/client
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
COPY --from=shared-lib-builder /opt/squirrelserversmanager/shared-lib ../shared-lib
RUN npm ci --legacy-peer-deps --no-audit --only=production && \
    npm cache clean --force

# Copy just the build output and server file
COPY --from=builder /opt/squirrelserversmanager/client/dist ./dist
COPY ./production-server.js ./

EXPOSE 8000
CMD ["npm", "run", "serve"]

# 4. Development image - kept separate from production
FROM node:23.11.0-alpine AS dev
WORKDIR /opt/squirrelserversmanager/client
COPY . .
COPY --from=shared-lib-builder /opt/squirrelserversmanager/shared-lib ../shared-lib
RUN npm ci --legacy-peer-deps --no-audit
CMD ["npm", "run", "start:pre"]