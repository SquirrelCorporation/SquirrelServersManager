FROM node:21-alpine as base

WORKDIR /server
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip
RUN npm install -g npm@latest
RUN rm /usr/lib/python3.11/EXTERNALLY-MANAGED
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

FROM base as production
ENV NODE_ENV=production
WORKDIR /server
COPY . .
RUN npm install  --verbose
RUN npm run build
CMD ["node", "./dist/src/index.js"]

FROM base as dev
ENV NODE_ENV=development
WORKDIR /server
COPY ./nodemon.json .
RUN npm install -g nodemon && npm install --verbose
CMD ["npm", "run", "dev"]
