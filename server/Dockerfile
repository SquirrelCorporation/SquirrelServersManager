FROM node:24.0.1-alpine AS base

# 1. Build shared library first
FROM base AS shared-lib-builder
WORKDIR /opt/squirrelserversmanager/shared-lib
COPY --from=shared-lib /. ./
RUN npm ci --legacy-peer-deps --no-audit
RUN npm run build

FROM base AS container-os
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Server"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"
WORKDIR /opt/squirrelserversmanager/server
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip expect gcompat libcurl curl
RUN apk add docker docker-cli-compose
RUN rm -f /usr/lib/python3.12/EXTERNALLY-MANAGED || true
RUN pip install ansible-runner ansible-runner-http
RUN npm install -g npm@latest
RUN npm i -g @nestjs/cli
# Copy built shared-lib from the shared-lib-builder stage
RUN mkdir -p /opt/squirrelserversmanager/shared-lib
COPY --from=shared-lib-builder /opt/squirrelserversmanager/shared-lib /opt/squirrelserversmanager/shared-lib
WORKDIR /opt/squirrelserversmanager/server

# 2. Install server dependencies
FROM container-os AS deps
WORKDIR /opt/squirrelserversmanager/server
RUN npm install -g typescript
COPY ./package*.json ./
COPY ./tsconfig.json ./
# Instead of using a relative path for shared-lib, install it globally
RUN cd /opt/squirrelserversmanager/shared-lib && npm link
RUN npm link ssm-shared-lib
RUN npm ci --legacy-peer-deps --no-audit

# 3. Build server app
FROM container-os AS builder
WORKDIR /opt/squirrelserversmanager/server
COPY --from=deps /opt/squirrelserversmanager/server/node_modules ./node_modules
# Ensure shared-lib is linked
RUN cd /opt/squirrelserversmanager/shared-lib && npm link && cd /opt/squirrelserversmanager/server && npm link ssm-shared-lib
COPY . .
RUN npm run build

# 4. Production image
FROM container-os AS production
WORKDIR /opt/squirrelserversmanager/server
ENV NODE_ENV=production
COPY --from=deps /opt/squirrelserversmanager/server/node_modules ./node_modules
# Ensure shared-lib is linked
RUN cd /opt/squirrelserversmanager/shared-lib && npm link && cd /opt/squirrelserversmanager/server && npm link ssm-shared-lib
COPY --from=builder /opt/squirrelserversmanager/server/dist ./dist
EXPOSE 3000
CMD ["node", "./dist/src/main.js"]

# 5. (Optional) Dev image for local development
FROM container-os AS dev
WORKDIR /opt/squirrelserversmanager/server
COPY . .
RUN npm install -g nodemon && npm ci --legacy-peer-deps --no-audit
# Ensure shared-lib is linked
RUN cd /opt/squirrelserversmanager/shared-lib && npm link && cd /opt/squirrelserversmanager/server && npm link ssm-shared-lib
CMD ["npm", "run", "dev"]
