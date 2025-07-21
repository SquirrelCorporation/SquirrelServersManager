---
layout: FeatureGuideLayout
title: "Dockerless"
icon: "🏗️" # Construction/building icon
time: "5 min read"
signetColor: '#f1c40f'
nextStep:
  icon: "➡️"
  title: "Next Topic"
  description: "Continue to the next relevant section."
  link: "#"
credits: true
---

# Dockerless Install

:::warning 
SSM is developed with Docker as a host in mind. This guide is purely informational. 
:::

Follow these steps to install and set up the Squirrel Servers Manager on Alpine Linux.

## Prerequisites

- Alpine Linux (>= 3.19)
- Ensure you have `sudo` privileges to perform the system operations.

## Step 1: Install Required Packages

Run the following commands to install the necessary packages:

```sh
apk add git
apk add nodejs
apk add npm
apk add ansible
apk add nmap
apk add sudo
apk add openssh
apk add sshpass
apk add py3-pip
apk add expect
apk add libcurl
apk add gcompat
apk add curl
apk add newt
$STD apk add docker
$STD apk add docker-cli-compose
```

Verify the installations:

```sh
git --version
node --version
npm --version
```

## Step 2: Install Redis

```sh
apk add redis
```

## Step 3: Install Nginx

```sh
apk add nginx
```

Replace the default Nginx configuration:

```sh
rm -rf /etc/nginx/http.d/default.conf
cat <<'EOF'> /etc/nginx/http.d/default.conf
server {
  listen 80;
  server_name localhost;
  access_log off;
  error_log off;

  location /api/socket.io/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;
      proxy_pass http://127.0.0.1:3000/socket.io/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    proxy_pass http://127.0.0.1:8000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    error_page 501 502 503 404 /custom.html;
    location = /custom.html {
            root /usr/share/nginx/html;
    }
  }
}
EOF
```

## Step 4: Install MongoDB

```sh
DB_NAME=ssm
DB_PORT=27017
echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories
echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories
apk update
apk add mongodb mongodb-tools
```

## Step 5: Start Services

Start and enable Redis and MongoDB services:

```sh
rc-service redis start
rc-update add redis default
rc-service mongodb start
rc-update add mongodb default
```

## Step 6: Set Up Squirrel Servers Manager

Clone the repository:

```sh
git clone https://github.com/SquirrelCorporation/SquirrelServersManager.git /opt/squirrelserversmanager
```

Install deps:
```sh
rm -f /usr/lib/python3.12/EXTERNALLY-MANAGED
pip install ansible-runner ansible-runner-http
```

Generate secrets and create the environment file:

```sh
SECRET=$(generate_random_string 32)
SALT=$(generate_random_string 16)
VAULT_PWD=$(generate_random_string 32)
cat <<EOF > /opt/squirrelserversmanager/.env
# SECRETS
SECRET=$SECRET
SALT=$SALT
VAULT_PWD=$VAULT_PWD
# MONGO
DB_HOST=127.0.0.1
DB_NAME=ssm
DB_PORT=27017
# REDIS
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# SSM CONFIG
SSM_INSTALL_PATH=/opt/squirrelserversmanager
SSM_DATA_PATH=/opt/squirrelserversmanager/data
# TELEMETRY
TELEMETRY_ENABLED=true
EOF
```

Set environment variables:

```sh
export NODE_ENV=production
export $(grep -v '^#' /opt/squirrelserversmanager/.env | xargs)
```

Install global npm packages:

```sh
npm install -g npm@latest
npm install -g @umijs/max
npm install -g typescript
npm install pm2 -g
```

## Step 7: Build Squirrel Servers Manager Library

Navigate to the shared library directory and build it:

```sh
cd /opt/squirrelserversmanager/shared-lib
npm ci
npm run build
```

## Step 8: Build and Run Squirrel Servers Manager Client

Navigate to the client directory, build the client, and start it using `pm2`:

```sh
cd /opt/squirrelserversmanager/client
npm ci
npm run build
pm2 start --name="squirrelserversmanager-frontend" npm -- run serve
```

## Step 9: Build and Run Squirrel Servers Manager Server

Navigate to the server directory, build the server, and start it using `pm2`:

```sh
cd /opt/squirrelserversmanager/server
npm ci
npm run build
pm2 start --name="squirrelserversmanager-backend" node -- ./dist/src/index.js
```

## Step 10: Start Squirrel Servers Manager

Set up `pm2` to start on boot:

```sh
pm2 startup
pm2 save
```

Prepare Nginx and start the service:

```sh
mkdir -p /usr/share/nginx/html/
cp /opt/squirrelserversmanager/proxy/www/index.html /usr/share/nginx/html/custom.html

rc-service nginx start
rc-update add nginx default
```

SSM should be available on the port `80`