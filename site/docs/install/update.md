# Update SSM

<img src="/install/update.png" alt="dashboard" style="border-radius: 10px; border: 2px solid #000; margin-top: 15px; margin-bottom: 55px;" />

Updating your installation depends on the method you used for the installation:

## Updating - Docker (getSsm Script or Pre-built Images)

Locate the SSM's `docker-compose.yml` file and execute:

```shell
docker-compose stop
docker-compose pull
docker-compose up
```

or

```shell
docker compose stop
docker compose pull
docker compose up
```

## Updating - Proxmox

From the shell of the **LXC instance**:

```shell
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```

## Updating - Manual Install

Locate the SSM cloned directory:

```shell
git pull
```

Then:

```shell
docker-compose up --build
```

or

```shell
docker compose up --build
```