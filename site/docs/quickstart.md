# Quick Start

:::warning ⚠️ Please check the requirements before installing SSM
See [Requirements](/docs/requirements)
:::

## 🔥 Use the Script

- **Docker**:
```shell
curl -sL https://getssm.io | bash 
```
<p style="text-align: right;"><a href="/docs/install/docker">Learn more about Docker install</a></p>

- **Proxmox**:
```shell
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```
<p style="text-align: right;"><a href="/docs/install/proxmox">Learn more about Proxmox install</a></p>

## Use pre-built Docker images

SSM has published versions of the client and server images according to release tags [here](https://github.com/orgs/SquirrelCorporation/packages?repo_name=SquirrelServersManager).
The `docker-compose.yml` file uses these pre-built images. To use them, you can set up the following Docker Compose file:

### Docker-compose file
```yaml
services:
  proxy:
    restart: unless-stopped
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-proxy:latest"
    ports:
      - "8000:8000"
    depends_on:
      - client
      - mongo
      - server
      - redis
    labels:
      wud.display.name: "SSM - Proxy"
      wud.watch.digest: false
  mongo:
    container_name: mongo-ssm
    image: mongo
    restart: unless-stopped
    volumes:
      - ./.data.prod/db:/data/db
    command: --quiet
    labels:
      wud.display.name: "SSM - MongoDB"
  redis:
    container_name: cache-ssm
    image: redis
    restart: unless-stopped
    volumes:
      - ./.data.prod/cache:/data
    command: --save 60 1
    labels:
      wud.display.name: "SSM - Redis"
  server:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-server:latest"
    restart: unless-stopped
    healthcheck:
      test: curl --fail http://localhost:3000/ping || exit 1
      interval: 40s
      timeout: 30s
      retries: 3
      start_period: 60s
    external_links:
      - mongo
      - redis
    depends_on:
      - mongo
      - redis
    env_file: .env
    environment:
      NODE_ENV: production
    volumes:
      - ./.data.prod:/data
    labels:
      wud.display.name: "SSM - Server"
      wud.watch.digest: false
  client:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-client:latest"
    restart: unless-stopped
    depends_on:
      - server
    labels:
      wud.display.name: "SSM - Client"
      wud.watch.digest: false
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
Replace the values of "SECRET", "SALT", and "VAULT_PWD"

⚠ **SALT value MUST be an alphanumeric string of exactly 16 characters**

Open a browser and navigate to:
[http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)

### To update SSM, simply run:
```shell
docker-compose pull
docker-compose up
```
or
```shell
docker compose pull
docker compose up
```

---

### Other install methods:
To manually build the project your self, see this [section](/docs/technical-guide/manual-install-ssm)