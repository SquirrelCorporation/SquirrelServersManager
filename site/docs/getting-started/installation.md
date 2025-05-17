---
layout: FeatureGuideLayout
title: "Installation"
icon: "📥" # Download/installation icon
time: "5 min read"
signetColor: '#f1c40f'
nextStep:
  icon: "👉"
  title: "First Time Setup"
  description: "Create your admin account and get started with SSM"
  link: "/docs/getting-started/first-steps"
credits: true
feedbackSupport: true
--- 

<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
import FeatureGrid from '/components/FeatureGrid.vue';
import FeatureCard from '/components/FeatureCard.vue';
import FeedbackSupportSection from '/components/FeedbackSupportSection.vue';
</script>


:::tip In a Nutshell (🌰)
- Install SSM using one-line scripts for Docker or Proxmox
- Set up required environment variables for security
- Access the web interface on port 8000
:::


:::warning ⚠️ System Requirements
Before proceeding, ensure your system meets all [requirements](/docs/getting-started/requirements)
:::

## Installation Methods

### One-Line Installation Scripts

Choose the installation method that matches your environment:

::: code-group
```bash [Docker]
# Quick Docker installation
curl -sL https://getssm.io | bash
```

```bash [Proxmox]
# Quick Proxmox installation
bash -c "$(wget -qLO - https://getssm.io/proxmox)"
```
:::

### Alternatives:
<FeatureGrid>
  <FeatureCard
    icon="🐳"
    title="Docker Installation"
    description="Step-by-step guide for installing SSM using Docker."
    link="/docs/getting-started/installation/docker"
  />
  <FeatureCard
    icon="🖥️"
    title="Proxmox Installation"
    description="Detailed instructions for installing SSM on Proxmox."
    link="/docs/getting-started/installation/proxmox"
  />
</FeatureGrid>

## Manual Installation with Docker Compose

SSM publishes pre-built images for all components on [GitHub Packages](https://github.com/orgs/SquirrelCorporation/packages?repo_name=SquirrelServersManager).

### Step 1: Create docker-compose.yml

Create a `docker-compose.yml` file with the following content:

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
      - prometheus
    labels:
      wud.display.name: "SSM - Proxy"
      wud.watch.digest: false
  prometheus:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-prometheus:latest"
    container_name: prometheus-ssm
    restart: unless-stopped
    volumes:
      - ./.data.prod/prometheus:/prometheus
    labels:
      wud.display.name: "SSM - Prometheus"
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
      - prometheus
    depends_on:
      - mongo
      - redis
      - prometheus
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

### Step 2: Create .env file

Create a `.env` file with the following configuration:

```ini
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
#TELEMETRY
TELEMETRY_ENABLED=true
```

:::danger 🔐 Security Warning
Replace `SECRET`, `SALT`, and `VAULT_PWD` with secure values:
- `SECRET`: A long, random string for JWT signing
- `SALT`: **Must be exactly 16 alphanumeric characters**
- `VAULT_PWD`: A strong password for Ansible vault encryption

Never use the default values in production!
:::

### Step 3: Launch SSM

Start the application with Docker Compose:

```bash
# For Docker Compose V2
docker compose up -d

# For Docker Compose V1
docker-compose up -d
```

### Step 4: Access the interface

Open your browser and navigate to:
- [http://localhost:8000](http://localhost:8000) or 
- [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Updating SSM

To update SSM to the latest version:

```bash
# Pull the latest images
docker compose pull

# Restart the services with the new images
docker compose up -d
```

## Configuration Options

### Disabling Telemetry

By default, SSM collects anonymized usage statistics. This helps us improve the application and doesn't include sensitive information.

To disable telemetry:

1. Edit your `.env` file
2. Set `TELEMETRY_ENABLED=false`
3. Restart SSM

<details>
<summary>What data does telemetry collect?</summary>

The **anonymized** telemetry includes:
- SSM version
- Number of devices connected
- Number of containers managed
- Operating system type
- General usage patterns

**No personal information, credentials, or identifying data is collected.**
</details>

## Other Alternative Installation Methods (Advanced)

<FeatureGrid>
  <FeatureCard
    icon="🔧"
    title="Manual Build"
    description="Build SSM from source code for complete customization."
    link="/docs/reference/installation/manual-ssm-from-source"
  />
  
  <FeatureCard
    icon="🛡️"
    title="Dockerless Setup"
    description="Install SSM without Docker for specialized environments."
    link="/docs/getting-started/installation/dockerless"
  />
  
  <FeatureCard
    icon="📡"
    title="Proxy-Free Setup"
    description="Install SSM without the proxy component."
    link="/docs/getting-started/installation/proxy-free"
  />
</FeatureGrid>

## Troubleshooting

<details>
<summary>Docker port conflict errors</summary>

**Problem**: Error message about port 8000 already in use.

**Solution**: Change the port mapping in docker-compose.yml:
```yaml
proxy:
  ports:
    - "8001:8000"  # Change 8000 to another port
```
</details>

<details>
<summary>MongoDB connection issues</summary>

**Problem**: Server container fails to start with MongoDB connection errors.

**Solution**: Ensure MongoDB is running and check your .env configuration:
```ini
DB_HOST=mongo
DB_NAME=ssm
DB_PORT=27017
```
</details>

<details>
<summary>Permission errors on volumes</summary>

**Problem**: Permission denied errors when accessing volume data.

**Solution**: Fix permissions on host directories:
```bash
sudo chown -R 1000:1000 ./.data.prod
```
</details>
