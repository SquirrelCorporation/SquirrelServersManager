# 1. Build shared-lib (TypeScript to JS)
FROM node:24.0.1-alpine AS shared-lib-builder
WORKDIR /opt/squirrelserversmanager/shared-lib
COPY --from=shared-lib /package*.json ./
COPY --from=shared-lib /tsconfig.json ./
COPY --from=shared-lib /src ./src
RUN npm ci --legacy-peer-deps --no-audit
RUN npm run build

# 2. Install server dependencies (including built shared-lib)
FROM node:24.0.1-alpine AS deps
WORKDIR /opt/squirrelserversmanager/server

RUN npm install -g npm@latest


RUN npm install -g typescript
RUN npm i -g @nestjs/cli
COPY ./package*.json ./
COPY ./tsconfig.json ./
# Copy the entire built shared-lib for local file: dependency resolution
COPY --from=shared-lib-builder /opt/squirrelserversmanager/shared-lib ../shared-lib
RUN npm ci --legacy-peer-deps --no-audit

# 3. Build server app
FROM node:24.0.1-alpine AS builder
WORKDIR /opt/squirrelserversmanager/server
COPY --from=deps /opt/squirrelserversmanager/server/node_modules ./node_modules
COPY --from=deps /opt/squirrelserversmanager/shared-lib ../shared-lib
COPY . .
RUN npm run build

# 4. Production image: only built output, prod deps, and LABELs
FROM node:24.0.1-alpine AS production
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Server"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip expect gcompat libcurl curl
RUN apk add docker docker-cli-compose
RUN rm -f /usr/lib/python3.12/EXTERNALLY-MANAGED || true
RUN pip install ansible-runner ansible-runner-http
WORKDIR /opt/squirrelserversmanager/server
ENV NODE_ENV=production
COPY --from=deps /opt/squirrelserversmanager/server/node_modules ./node_modules
COPY --from=deps /opt/squirrelserversmanager/shared-lib ../shared-lib
COPY --from=builder /opt/squirrelserversmanager/server/dist ./dist
# Flatten the shared-lib dependency for runtime
RUN rm -rf ./node_modules/ssm-shared-lib && \
    mkdir -p ./node_modules/ssm-shared-lib && \
    cp -a ../shared-lib/. ./node_modules/ssm-shared-lib/
EXPOSE 3000
CMD ["node", "./dist/src/main.js"]

# 5. (Optional) Dev image for local development
FROM node:24.0.1-alpine AS dev
WORKDIR /opt/squirrelserversmanager/server
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip expect gcompat libcurl curl
RUN apk add docker docker-cli-compose
RUN rm -f /usr/lib/python3.12/EXTERNALLY-MANAGED || true
RUN pip install ansible-runner ansible-runner-http
COPY . .
COPY --from=shared-lib-builder /opt/squirrelserversmanager/shared-lib ../shared-lib
RUN npm install -g nodemon && npm ci --legacy-peer-deps --no-audit
CMD ["npm", "run", "dev"]
