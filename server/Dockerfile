FROM node:23.1.0-alpine AS base
LABEL org.opencontainers.image.source=https://github.com/SquirrelCorporation/SquirrelServersManager
LABEL org.opencontainers.image.description="SSM Server"
LABEL org.opencontainers.image.licenses="GNU AFFERO GENERAL PUBLIC LICENSE"

WORKDIR /server
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip expect gcompat libcurl
RUN apk add docker docker-cli-compose
RUN npm install -g npm@latest
RUN rm -f /usr/lib/python3.12/EXTERNALLY-MANAGED
RUN pip install ansible-runner \
    ansible-runner-http
RUN npm install -g typescript
COPY ./package*.json .
COPY ./tsconfig.json .
RUN mkdir /shared-lib
WORKDIR /shared-lib
COPY --from=shared-lib ./ ./
RUN npm run build
WORKDIR /client
EXPOSE 3000

FROM base AS production
ENV NODE_ENV=production
WORKDIR /server
RUN npm ci --verbose --no-audit
COPY . .
RUN npm run build
CMD ["node", "./dist/src/index.js"]

FROM base AS dev
ENV NODE_ENV=development
WORKDIR /server
COPY ./nodemon.json .
RUN npm install -g nodemon && npm ci --verbose --no-audit
CMD ["npm", "run", "dev"]
