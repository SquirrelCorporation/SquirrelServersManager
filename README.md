![Squirrel](./client/public/logo.svg)
# SQUIRREL SERVERS MANAGER
https://squirrelserversmanager.io

[![Publish Containers to Ghcr.io](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/docker-publish.yml)
[![Tests](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/node.js.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/node.js.yml)

NOTE:
This is a pre-alpha version, It may not work on your system. I am currently looking for testers and contributors.
Absolutely no warranties. 

See https://squirrelserversmanager.io/docs/quickstart
**Edit the .env file before anything**

## Production
```console
docker compose up
```

## Developement
```console
docker compose up -f docker-compose.dev.yml up 
```

## Screenshots
![dashboard](./site/public/dashboard.png)
![devices](./site/public/devices.png)
![inventory](./site/public/inventory.png)
![services](./site/public/services.png)
