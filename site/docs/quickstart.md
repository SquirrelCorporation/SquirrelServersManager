# Quick Start

:::warning ⚠️ Please check the requirements before installing SSM
See [Requirements](/docs/requirements)
:::

## Use pre-build images

SSM has published version of the client and server image according to release tag [here](https://github.com/orgs/SquirrelCorporation/packages?repo_name=SquirrelServersManager).
The `docker-compose.yml` file use those pre-build image. To use them, you can set up the following Docker Compose file:
### Docker-compose file
```dockerfile
version: '3.8'
services:
  proxy:
    restart: unless-stopped
    build:
      context: ./proxy
    ports:
      - "8000:8000"
    depends_on:
      - client
      - mongo
      - server
      - redis
  mongo:
    container_name: mongo-ssm
    image: mongo
    restart: unless-stopped
    volumes:
      - ./.data.prod/db:/data/db
    command: --quiet
  redis:
    container_name: cache-ssm
    image: redis
    restart: unless-stopped
    volumes:
      - ./.data.prod/cache:/data
    command: --save 60 1
  server:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-server:latest"
    restart: unless-stopped
    external_links:
      - mongo
      - redis
    depends_on:
      - mongo
      - redis
    env_file: .env
    environment:
      NODE_ENV: production
  client:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-client:latest"
    restart: unless-stopped
    depends_on:
      - server
`
```

### .env file
```
#SECRETS
SECRET=REPLACE_ME
SALT=1234567890123456
VAULT_PWD=REPLACE_ME
#MONGO
DB_HOST=mongo
DB_NAME=ssm
DB_PORT=27017
#REDIS
REDIS_HOST=redis
REDIS_PORT=6379
```
Replace the value of "SECRET", "SALT", "VAULT_PWD"

⚠ **SALT value MUST be alphanumerical string of exactly 16 chars**

Open a browser and open:
[http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)

### To update SSM, simply
```shell
docker-compose pull
docker-compose up
```
or
```shell
docker compose pull
docker compose up
```
## Build the project by yourself

### 1. Clone the main repo
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager
```
### 2. CD to the directory:
```shell
cd ./SquirrelServersManager
```
### 3. Open with your favorite editor
```shell
vim .env
```
### 4. Replace the value of "SECRET", "SALT", "VAULT_PWD"
```
SECRET=REPLACE_ME
```
and
```
SALT=1234567890123456
```
⚠ **SALT value MUST be alphanumerical string of exactly 16 chars**

and
```
VAULT_PWD=REPLACE_ME
```

### 5. Open a terminal and execute:
```shell
docker compose -f docker-compose.prod.yml up
```
or
```shell
docker-compose -f docker-compose.prod.yml  up
```
depending of your docker version (see [Requirements](/docs/requirements))

Docker will create a volume directory *.data.prod* in the directory for persistent data saves

### 6. Open a browser and open:

[http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)

### Updating SSM

In SSM cloned directory:

```shell
playbooks-repository pull
```

```shell
docker-compose up
```

or

```shell
docker compose up --build
```
