# Squirrel Servers Manager
[Website](https://squirrelserversmanager.io) - [Documentation](https://squirrelserversmanager.io/docs) - [Demo](https://demo.squirrelserversmanager.io) 
<img src="./client/public/logo.svg" align="right"
     alt="SSM by Emmanuel Costa" width="120" height="178">

Squirrel Servers Manager is an all-in-one configuration and container management tool, powered by Ansible, Docker & Prometheus, with a focus on UI/UX.
It is designed to provide a user-friendly alternative to well-known established tools, while being totally open-source and free.

[![Publish Containers](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/docker-publish.yml)
[![Tests - Client](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/test-client.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/test-client.yml)
[![Tests - Server](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/test-server.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/test-server.yml)
[![Tests - Playbooks](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/test-playbooks.yml/badge.svg)](https://github.com/SquirrelCorporation/SquirrelServersManager/actions/workflows/test-playbooks.yml)

<p align="center">
	<img src="./site/public/images/home-dashboard.png" width="60%">
</p>

---

## 🔥 Main Features:

|                                                                                                | Features                                | Description                                                                                                   |
|:----------------------------------------------------------------------------------------------:|:---------------------------------------|:-------------------------------------------------------------------------------------------------------------|
|          ![Statistics](https://squirrelserversmanager.io/images/home-statistics.svg)           | **Metrics & Statistics**               | :white_circle: Monitor the main metrics of your servers (CPU, RAM, etc.) and detect anomalies                 |
|      ![Playbooks](https://squirrelserversmanager.io/images/home-playback-speed-bold.svg)       | **Playbooks Management & Execution** | :white_circle: Manage your playbooks, both locally and remotely, and run them on your devices                 |
|      ![Container Management](https://squirrelserversmanager.io/images/home-container.svg)      | **Container Management**               | :white_circle: View all running containers, monitor their statistics, and receive alerts when updates are available |
|     ![Automations](https://squirrelserversmanager.io/images/home-ibm-event-automation.svg)     | **Automations**                        | :white_circle: Run actions on triggers like playbook execution or container actions                           |
|            ![Security](https://squirrelserversmanager.io/images/home-security.svg)             | **Security**                           | :white_circle: We ensure your secrets and authentication info are secure using Ansible Vault and Bcrypt       |
| ![Advanced Configuration](https://squirrelserversmanager.io/images/home-advanced-settings.svg) | **Advanced Configuration**             | :white_circle: User-friendly with advanced options to fit your specific needs                                 |
|        ![Integrations](https://squirrelserversmanager.io/images/home-integration-general.svg)         | **Integrations** (Coming soon)         | :white_circle: Trigger automations from other tools and call other services                                   |
|           ![Collections](https://squirrelserversmanager.io/images/home-library-filled.svg)            | **Collections**                        | :white_circle: Install open source services on your devices with one click                                    |

---

## 🏎️ QuickStart
```shell
curl https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/getSSM.sh | bash
```
See [QuickStart](https://squirrelserversmanager.io/docs/getting-started)


For the others methods, **[Edit the `.env` file before anything](https://squirrelserversmanager.io/docs/getting-started/installation#step-2-create-env-file).**

---

## 🛳️ Manual Install: Production
Clone the project, [edit the `.env`](https://squirrelserversmanager.io/docs/getting-started/installation#step-2-create-env-file) file and run:
```shell
docker compose up
```

## 🏗️ Manual Install: Development
Clone the project, [edit the `.env`](https://squirrelserversmanager.io/docs/getting-started/installation#step-2-create-env-file) file and run:
```shell
docker compose -f docker-compose.dev.yml up
```

## 🚧 Troubleshoot
See [Troubleshoot](https://squirrelserversmanager.io/docs/troubleshoot/troubleshoot)

---

## 💌 Screenshots

![Dashboard](./site/public/home/dashboard.png)
![Devices](./site/public/home/devices.png)
![Services](./site/public/home/services.png)
![Store](./site/public/home/store.png)
![Playbook](./site/public/home/playbook.png)
![Device Info](./site/public/home/device-info.png)
![New Device](./site/public/home/new-device.png)

---
## Disabling Anonymized Telemetry

By default, SSM automatically reports anonymized basic usage statistics. This helps us understand how SSM is used and track its overall usage and growth. This data does not include any sensitive information. To disable anonymized telemetry, follow these steps:

Set `TELEMETRY_ENABLED` to `false` in your `.env` file.

---

**Note:**
This is an Alpha version. It may not work on your system. We are looking for testers and contributors.
Absolutely no warranties.

# Git Hooks

This project uses Husky to run pre-commit checks. Before each commit:
- The project will be built
- All tests will be run

This ensures that no broken code is committed to the repository.

## Setup

The hooks will be installed automatically when you run:
```bash
npm install
```

## Skipping Hooks

In rare cases where you need to skip the pre-commit checks (not recommended), you can use:
```bash
git commit --no-verify
```
Or uncheck "Run Git hooks" in WebStorm's commit dialog.
