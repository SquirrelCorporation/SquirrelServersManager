FROM node:21-alpine as base

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
RUN npm install --verbose
RUN npm run build
CMD ["npm", "run", "serve"]

FROM base as dev
COPY . .
RUN npm install --verbose
CMD ["npm", "run", "start:pre"]
