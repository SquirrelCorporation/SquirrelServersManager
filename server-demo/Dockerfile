FROM node:22.6.0-alpine AS base
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Server"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"

WORKDIR /server-demo
RUN apk update
RUN npm install -g npm@latest
RUN npm install -g typescript
COPY ./package*.json .
COPY ./tsconfig.json .
EXPOSE 3000

FROM base AS production
ENV NODE_ENV=production
WORKDIR /server-demo
RUN npm ci --verbose --no-audit
COPY . .
RUN npm run build
CMD ["node", "./dist/index.js"]

FROM base AS dev
ENV NODE_ENV=development
WORKDIR /server-demo
COPY ./nodemon.json .
RUN npm install -g nodemon && npm ci --verbose --no-audit
CMD ["npm", "run", "dev"]
