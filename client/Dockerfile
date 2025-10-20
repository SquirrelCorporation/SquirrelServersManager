FROM node:25.0.0-alpine AS base
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Client"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"

WORKDIR /opt/squirrelserversmanager/client
RUN npm install -g npm@11.3.0
RUN npm install -g typescript
COPY ./package*.json .
COPY ./tsconfig.json .
RUN mkdir /opt/squirrelserversmanager/shared-lib
WORKDIR /opt/squirrelserversmanager/shared-lib
COPY --from=shared-lib ./ ./
RUN npm run build
WORKDIR /opt/squirrelserversmanager/client
EXPOSE 8000

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --verbose --no-audit --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "serve"]

FROM base AS dev
RUN npm ci --verbose --no-audit
COPY . .
CMD ["npm", "run", "start:pre"]