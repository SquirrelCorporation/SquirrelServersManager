# Manually Installing the Agent

If you have difficulties installing the agent from the UI, you can install it manually on the device.

:::info ℹ️ Requirements
[Please read the stack requirements before installing the agent](/docs/requirements)
:::

## NodeJS Vanilla Agent

### Environment
It is possible to customize the behavior of the agent by setting environment variables in the `.env` file:

| Env                             | Required |         Example         | Description                                                | 
|---------------------------------|:--------:|:-----------------------:|------------------------------------------------------------|
| `URL_MASTER`                    |   YES    | http://192.168.0.3:8000 | URL of the SSM API                                         |
| `OVERRIDE_IP_DETECTION`         |    NO    |       192.168.0.1       | Disable the auto-detection of the IP and set a fixed value |
| `AGENT_HEALTH_CRON_EXPRESSION`  |    NO    |     '*/30 * * * * *'    | Frequency of agent self-check                              |
| `STATISTICS_CRON_EXPRESSION`    |    NO    |     '*/30 * * * * *'    | Frequency of stats push                                    |

### Method 1: Installing the Agent with the Provided Shell Script
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd ./SquirrelServersManager-Agent
```

Replace `MASTER_NODE_URL` below with the URL to your SSM installation:
```shell
./install.sh -a -u MASTER_NODE_URL
```

Please note that this method will **create** a device in SSM.
If the device has already been added or a device with the same IP already exists, the agent will fail to start.
If the device already exists in SSM, use:
```shell
./install.sh -a -u MASTER_NODE_URL -s DEVICE_ID
```
and replace `DEVICE_ID` with the UUID of the device in SSM (In Inventory, click on the IP and copy the UUID shown in the right drawer).

### Method 2: Building & Installing the Agent Manually
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd ./SquirrelServersManager-Agent
```

```shell
vim .env
```

Edit the **API_URL_MASTER** value with the URL of SSM.

```shell
npm install
npm build
```

Please note that this method will **create** a device in SSM.
If the device has already been added or a device with the same IP already exists, the agent will fail to start.
If the device already exists in SSM, create a `hostid.txt` file containing the UUID of the device in SSM.

You can now start the agent manually:
```shell
node ./build/agent.js
```

However, you will need some kind of service scheduler so the agent is monitored and starts at startup.
We recommend using [PM2](https://pm2.keymetrics.io/):
```shell
pm2 start -f ./build/agent.js
pm2 startup
pm2 save
```

## Dockerized Agent

### Environment
It is possible to customize the behavior of the agent by setting environment variables in the `.env` file:

| Env                             | Required |         Example         | Description                                                | 
|---------------------------------|:--------:|:-----------------------:|------------------------------------------------------------|
| `URL_MASTER`                    |   YES    | http://192.168.0.3:8000 | URL of the SSM API                                         |
| `OVERRIDE_IP_DETECTION`         |    NO    |       192.168.0.1       | Disable the auto-detection of the IP and set a fixed value |
| `AGENT_HEALTH_CRON_EXPRESSION`  |    NO    |     '*/30 * * * * *'    | Frequency of agent self-check                              |
| `STATISTICS_CRON_EXPRESSION`    |    NO    |     '*/30 * * * * *'    | Frequency of stats push                                    |
| `HOST_ID_PATH` |    NO    |      `/data/`     | Path where is stored the registered HostID                                    |
| `LOGS_PATH` |    NO    |      `/data/logs`     | Path where are store the logs                                    |
| `HOST_ID` |    NO    |     xxx-xxx-xxx-xxx    | UUID of the registered Device in SSM                                  |

Docker compose:
```yaml
services:
  ssm_agent:
    image: ghcr.io/squirrelcorporation/squirrelserversmanager-agent:docker
    network_mode: host
    privileged: true
    env_file:
      - .env
    pid: host
    restart: unless-stopped
    volumes:
      - /proc:/proc
      - /var/run/docker.sock:/var/run/docker.sock
      - ssm-agent-data:/data

volumes:
  ssm-agent-data:
```
or
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
git checkout docker
docker-compose up -d
```
or
```shell
docker pull ghcr.io/squirrelcorporation/squirrelserversmanager-agent:docker
docker volume create ssm-agent-data
docker run --network host \
  --privileged \
  --pid=host \
  -v /proc:/proc \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ssm-agent-data:/data \
  --restart unless-stopped \
  ghcr.io/squirrelcorporation/squirrelserversmanager-agent:docker
```