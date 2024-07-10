FROM node:22-alpine as base
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

FROM base as production
ENV NODE_ENV=production
COPY . .
RUN npm install --verbose --no-audit
RUN npm run build
CMD ["npm", "run", "serve"]

FROM base as dev
COPY . .
CMD ["npm", "run", "start:pre"]
