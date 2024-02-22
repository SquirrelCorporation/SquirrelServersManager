FROM node:21-alpine as base

WORKDIR /client
COPY ./package*.json .
COPY ./tsconfig.json .
RUN npm install -g npm@latest
RUN npm install -g @umijs/max
EXPOSE 8000

FROM base as production
ENV NODE_ENV=production
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "serve"]

FROM base as dev
COPY . .
RUN npm install
CMD ["npm", "run", "start:pre"]
