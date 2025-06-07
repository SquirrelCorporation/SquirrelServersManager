---
layout: FeatureGuideLayout
title: "Development Mode"
icon: 💻 # Using a laptop icon
time: 8 min read # Estimated time
signetColor: '#e74c3c' # Red for Advanced Guides
nextStep:
  icon: "🏷️"
  title: "Manual Installation"
  description: "Learn how to manually install SMM"
  link: "/docs/reference/installation/manual-ssm-from-source"
credits: true
---


:::warning ⚠️ Development Mode
Development mode is for development purposes only and **must not** be used in production. Logs may leak credentials, passwords, and other sensitive information. If you are not comfortable with React, TypeScript, or have security concerns, do not use this mode.
:::

## Prerequisites
- Familiarity with Docker and Docker Compose
- Node.js and npm installed (for advanced development)
- Git installed

## 1. Clone the Repository
```bash
git clone https://github.com/SquirrelCorporation/SquirrelServersManager
```

## 2. Configure Environment Variables
Edit the `.env.dev` file in the project root:

```ini
SECRET=REPLACE_ME
SALT=1234567890123456
VAULT_PWD=REPLACE_ME
```
- `SECRET`: A long, random string for JWT signing
- `SALT`: **Must be exactly 16 alphanumeric characters**
- `VAULT_PWD`: A strong password for Ansible vault encryption

## 3. Start Development Environment
You can use either Docker Compose V1 or V2:

```bash
docker-compose --verbose -f docker-compose.dev.yml up
```
_or_
```bash
docker compose --verbose -f docker-compose.dev.yml up
```

## Ports
- SSM UI/API: **:8000**
- MongoDB: **:27017**

## Volumes
- Docker Compose will create a `.data.dev` directory for persistent data storage
- It will mount `./client/src/` and `./server/src/` for live code reloads using Nodemon

## Security Warning
:::danger
Never use development mode in production. Sensitive data may be exposed in logs and the environment is not hardened.
:::
