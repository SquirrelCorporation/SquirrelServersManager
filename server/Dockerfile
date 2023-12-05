FROM node:21-alpine as base

WORKDIR /src
COPY package*.json /
COPY tsconfig.json /
RUN apk update && apk add ansible nmap sudo openssh sshpass py3-pip
RUN npm install -g npm@latest
RUN pip install ansible-runner \
    ansible-runner-http
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["node", "bin/www"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /
CMD ["nodemon", "bin/www"]
