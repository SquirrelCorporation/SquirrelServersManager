---
layout: FeatureGuideLayout
title: "Environment Variables"
icon: "🔧" # Wrench/settings icon
time: "5 min read"
signetColor: '#23233e'
credits: true
---

:::tip In a Nutshell (🌰)
- Environment variables configure SSM server behavior
- Security-related variables control encryption and authentication
- Database connection variables configure MongoDB and Redis
- System paths and telemetry can be configured as needed
- Most variables have sensible defaults but should be customized for production
:::

## Overview

Squirrel Servers Manager (SSM) uses environment variables to configure various aspects of the system. These variables can be set in your `.env` file or provided directly to the containers through Docker Compose or other deployment methods.

## Core Environment Variables

These variables control fundamental aspects of SSM:

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `NODE_ENV` | | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | | `3000` | Port the SSM server will listen on |

## Security Variables

These variables control security-related settings:

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `SECRET` | ✓ | Dev mode: `WLZBQ9UozypQJ8p8LLHIMZ0ZuSyY6uTY` | Secret key used for JWT signing and encryption |
| `VAULT_PWD` | ✓ | ` ` (empty string) | Password for Ansible vault encryption |
| `SESSION_DURATION` | | `86400000` | Session duration in milliseconds (24 hours) |

:::warning
Never use the default values in production! Always set strong, unique values for `SECRET` and `VAULT_PWD`.
:::

## Database Connection Variables

These variables configure database connections:

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `DB_HOST` | | `mongo` | MongoDB hostname |
| `DB_PORT` | | `27017` | MongoDB port |
| `DB_NAME` | | `ssm` | MongoDB database name |
| `DB_USER` | | ` ` (empty string) | MongoDB username (if authentication is enabled) |
| `DB_USER_PWD` | | ` ` (empty string) | MongoDB password (if authentication is enabled) |
| `DB_MIN_POOL_SIZE` | | `5` | Minimum MongoDB connection pool size |
| `DB_MAX_POOL_SIZE` | | `10` | Maximum MongoDB connection pool size |
| `REDIS_HOST` | | ` ` (empty string) | Redis hostname |
| `REDIS_PORT` | | `6379` | Redis port |

Example configuration:

```ini
# MongoDB Configuration
DB_HOST=mongo
DB_NAME=ssm
DB_PORT=27017

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
```

## System Paths

These variables define where SSM stores its data:

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `SSM_INSTALL_PATH` | | `/opt/squirrelserversmanager` | Installation path for SSM |
| `SSM_DATA_PATH` | | `/data` | Data storage path for SSM |

## Prometheus Configuration

These variables configure Prometheus metrics integration:

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `PROMETHEUS_HOST` | | `http://prometheus:9090` | Prometheus server URL |
| `PROMETHEUS_BASE_URL` | | `/api/v1` | Prometheus API base path |
| `PROMETHEUS_USERNAME` | | `user` | Prometheus basic auth username |
| `PROMETHEUS_PASSWORD` | | `pass` | Prometheus basic auth password |

## Feature Flags

These variables enable or disable specific features:

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `TELEMETRY_ENABLED` | | `false` | Enable/disable anonymous telemetry |

## Example Configuration

A typical production `.env` file might look like this:

```ini
# Environment
NODE_ENV=production
PORT=3000

# Security
SECRET=your-very-long-and-secure-random-string
VAULT_PWD=your-secure-vault-password
SESSION_DURATION=86400000

# Database
DB_HOST=mongo
DB_NAME=ssm
DB_PORT=27017
REDIS_HOST=redis
REDIS_PORT=6379

# System Paths
SSM_INSTALL_PATH=/opt/squirrelserversmanager
SSM_DATA_PATH=/data

# Features
TELEMETRY_ENABLED=false
```

## Setting Environment Variables

### Docker Compose

In a Docker Compose deployment, set environment variables in your `docker-compose.yml` file:

```yaml
services:
  server:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-server:latest"
    environment:
      NODE_ENV: production
      SECRET: your-very-long-and-secure-random-string
      VAULT_PWD: your-secure-vault-password
      DB_HOST: mongo
      DB_NAME: ssm
      REDIS_HOST: redis
    # ...
```

Or use an env file:

```yaml
services:
  server:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-server:latest"
    env_file: .env
    # ...
```

### Manual Deployment

For manual deployments, you can set environment variables in your shell:

```bash
# Linux/macOS
export SECRET=your-very-long-and-secure-random-string
export VAULT_PWD=your-secure-vault-password

# Windows (CMD)
set SECRET=your-very-long-and-secure-random-string
set VAULT_PWD=your-secure-vault-password

# Windows (PowerShell)
$env:SECRET="your-very-long-and-secure-random-string"
$env:VAULT_PWD="your-secure-vault-password"
```
