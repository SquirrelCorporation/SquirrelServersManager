FROM node:21-alpine as base

WORKDIR /server
COPY ./package*.json .
COPY ./tsconfig.json .
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip
RUN npm install -g npm@latest
RUN rm /usr/lib/python3.11/EXTERNALLY-MANAGED
RUN pip install ansible-runner \
    ansible-runner-http
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
WORKDIR /server
COPY . .
RUN npm install -g typescript
RUN npm install
RUN npm run build
CMD ["node", "./dist/src/index.js"]

FROM base as dev
ENV NODE_ENV=development
WORKDIR /server
COPY ./nodemon.json .
RUN npm install -g nodemon && npm install
CMD ["npm", "run", "dev"]
