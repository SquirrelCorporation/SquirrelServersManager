---
layout: FeatureGuideLayout
title: "Updating SSM"
icon: 🔄
time: 2 min read
signetColor: '#3a5ccc'
credits: true
---

<img src="/images/install-update.png" alt="dashboard" style="border-radius: 10px; border: 2px solid #000; margin-top: 15px; margin-bottom: 55px;" />

Updating your installation depends on the method you used for the installation:

## Updating - Docker (getSsm Script or Pre-built Images)

Locate the SSM's `docker-compose.yml` file and update the file with:

```shell
curl -o docker-compose.yml https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/docker-compose.yml
```

then:

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

:::warning ⚠️ Update the container memory
It is highly recommended that you temporary set the container memory to 4096MB for the duration of the update
::: 

From the shell of the **LXC instance**:

```shell
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```
or
```shell
bash -c "$(wget -qO - https://getssm.io/proxmox)"
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