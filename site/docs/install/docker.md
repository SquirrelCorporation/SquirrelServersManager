# Docker Installation

Both the [installation script](/docs/quickstart) and the [Docker Compose](/docs/quickstart) method perform the same actions: spinning up 5 containers (client/server/db/cache/proxy) necessary to run SSM.

**We recommend using the installation script.** You can find the source code [here](https://github.com/SquirrelCorporation/SquirrelServersManager/blob/master/getSSM.sh).

Both methods use the same `docker-compose.yml` file.

Let's deep dive into it:

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
      - ./.data.prod/playbooks:/playbooks
      - ./.data.prod/config:/ansible-config
  client:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-client:latest"
    restart: unless-stopped
    depends_on:
      - server
```

- A local volume will be created under the directory `./.data.prod`, which will store:
  - The MongoDB data files under `./.data.prod/db`
  - The Redis cache files under `./.data.prod/cache`
  - Your personal playbooks under `./.data.prod/playbooks`
  - Your customized Ansible config under `./.data.prod/config`
- You will need an `.env` file in the same location as your `docker-compose.yml` to run the project. This file contains the secrets needed to encrypt the data fields, among other things. See [here](/docs/quickstart#env-file) for how to set up this file.

:::info Troubleshoot
In some cases, you may need to delete the directory `./.data.prod` to completely reset SSM and start with a clean, blank install.
:::

- Once started, SSM will listen on port `8000` of your machine, where you can access the UI.