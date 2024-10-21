FROM node:23.0.0-alpine AS base
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Client"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"

WORKDIR /client
RUN npm install -g npm@latest
RUN npm install -g @umijs/max
RUN npm install -g typescript
COPY ./package*.json .
COPY ./tsconfig.json .
RUN mkdir /shared-lib
WORKDIR /shared-lib
COPY --from=shared-lib ./ ./
RUN npm run build
WORKDIR /client
EXPOSE 8000

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --verbose --no-audit
COPY . .
RUN npm run build
CMD ["npm", "run", "serve"]

FROM base AS dev
RUN npm ci --verbose --no-audit
COPY . .
CMD ["npm", "run", "start:pre"]
