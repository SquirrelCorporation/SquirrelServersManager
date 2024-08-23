![Squirrel](./client/public/logo.svg)
# SQUIRREL SERVERS MANAGER
https://squirrelserversmanager.io

[![Publish Containers to Ghcr.io](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/docker-publish.yml)
[![Tests](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/node.js.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/node.js.yml)

NOTE:
This is a Alpha version, It may not work on your system. I am currently looking for testers and contributors.
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

## Main features:

|                                            | Features                               | Description                                                                                                                            |
|:------------------------------------------:|:---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| <img src="https://squirrelserversmanager.io/home/statistics.svg" alt="statistics" width="100" height="100">        | **Metrics & Statistics**               | :white_circle: Monitor the main metrics of your servers (CPU, RAM, etc.) and detect anomalies                                          |
| <img src="https://squirrelserversmanager.io/home/playback-speed-bold.svg" alt="playbooks" width="100" height="100">| **Playbooks management and execution** | :white_circle: Manage your playbooks, both locally and remotely, and run them on your devices                                          |
| <img src="https://squirrelserversmanager.io/home/container.svg" alt="container" width="100" height="100">)          | **Container Management**               | :white_circle: View all running containers, monitor their statistics, and receive alerts when updates are available                    |
| <img src="https://squirrelserversmanager.io/home/ibm-event-automation.svg" alt="automation" width="100" height="100">| **Automations**                        | :white_circle: Run actions on triggers like playbook execution or container actions                                                    |
| <img src="https://squirrelserversmanager.io/home/security.svg" alt="security" width="100" height="100">            | **Security**                           | :white_circle: We do our best to ensure your secrets and authentication info are secure using Ansible Vault and Bcrypt                 |
| <img src="https://squirrelserversmanager.io/home/advanced-settings.svg" alt="advancedsettings" width="100" height="100">| **Advanced configuration**             | :white_circle: SSM is user-friendly and easy to use, but it allows you to set up advanced options to fit your specific needs           |
| <img src="https://squirrelserversmanager.io/home/integration-general.svg" alt="integration" width="100" height="100">| **Integrations** (Coming soon)         | :white_circle: Trigger automations from other tools and call other services                                                            |
| <img src="https://squirrelserversmanager.io/home/library-filled.svg" alt="library" width="100" height="100">     | **Collections**                        | :white_circle: Install open source services on your devices with one click                                                             |


## Screenshots
![dashboard](./site/public/home/dashboard.png)
![devices](./site/public/home/devices.png)
![services](./site/public/home/services.png)
![store](./site/public/home/store.png)
![playbook](./site/public/home/playbook.png)
![deviceinfo](./site/public/home/device-info.png)
![new-device](./site/public/home/new-device.png)
