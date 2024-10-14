#!/bin/bash

cat << "EOF"
  ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     `"=\_  )_"`
          ``'"`
SquirrelServersManager Installer
EOF

# URL of the docker-compose file to download
DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/docker-compose.yml"

# Filename to save the downloaded docker-compose file
DOCKER_COMPOSE_FILE="docker-compose.yml"
# Check for curl or wget and download the docker-compose file
if command -v curl > /dev/null; then
    curl -o "$DOCKER_COMPOSE_FILE" "$DOCKER_COMPOSE_URL"
elif command -v wget > /dev/null; then
    wget -O "$DOCKER_COMPOSE_FILE" "$DOCKER_COMPOSE_URL"
else
    echo "❌ Error: Neither curl nor wget is installed."
    exit 1
fi

# Check if Docker is installed and validate Docker version
if ! command -v docker > /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Consult: https://squirrelserversmanager.io/docs/requirements"
    exit 1
fi

DOCKER_VERSION=$(docker --version | awk -F '[ ,]+' '{print $3}')
REQUIRED_VERSION="2.17.0"

if [ "$(printf '%s\n' "$DOCKER_VERSION" "$REQUIRED_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Error: Docker version must be at least $REQUIRED_VERSION."
    echo "Consult: https://squirrelserversmanager.io/docs/requirements"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Error: Docker Compose is not installed."
    echo "Consult: https://squirrelserversmanager.io/docs/requirements"
    exit 1
fi

# Generate a random string
generate_random_string() {
    local LENGTH=$1
    LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c $LENGTH
}

# Generate the .env file with necessary environment variables
cat <<EOF > .env
# SECRETS
SECRET=$(generate_random_string 32)
SALT=$(generate_random_string 16)
VAULT_PWD=$(generate_random_string 32)
# MONGO
DB_HOST=mongo
DB_NAME=ssm
DB_PORT=27017
# REDIS
REDIS_HOST=redis
REDIS_PORT=6379
EOF

echo "✅ .env file has been generated with random secrets."

# Check if port 8000 is open
PORT=8000
if command -v nc > /dev/null; then
    if nc -zv 127.0.0.1 $PORT 2>&1 | grep -q succeeded; then
        echo "✅ Port $PORT is open."
    fi
elif command -v lsof > /dev/null; then
    if lsof -i :$PORT > /dev/null 2>&1; then
        echo "✅ Port $PORT is open."
    fi
else
    echo "Note: Neither 'nc' nor 'lsof' is available to check port $PORT."
fi

# Run docker-compose up -d
if command -v docker compose > /dev/null 2>&1; then
    docker compose up -d
elif command -v docker-compose > /dev/null 2>&1; then
    docker-compose up -d
else
    echo "❌ Error: Docker Compose command not found."
    echo "Consult: https://squirrelserversmanager.io/requirements/"
    exit 1
fi

echo " ✅ Docker containers have been started in detached mode."
echo "Consult: https://squirrelserversmanager.io/docs/"