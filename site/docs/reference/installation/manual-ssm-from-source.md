---
layout: FeatureGuideLayout
title: "Manual Installation from Source"
icon: "🛠️"
time: "5 min read"
signetColor: '#23233e'
nextStep:
  icon: "🚀"
  title: "Getting Started with SSM"
  description: "Learn the basics of adding devices and managing your servers."
  link: "/docs/getting-started/first-steps"
credits: true
---
This guide covers the manual installation process for Squirrel Servers Manager (SSM), allowing you to build the project from source. This approach gives you complete control over the installation and configuration process, making it ideal for advanced users, developers, and custom deployment scenarios.

:::tip In a Nutshell (🌰)
- Build SSM from source for complete customization and control
- Choose between production and development environments
- Configure security settings with custom secrets
- Run with Docker Compose for easy deployment
- Access advanced configuration options
:::



### Installation Process Flowchart

<ProcessSteps :steps="[
  { title: 'Clone Repository', description: 'Get the source code from GitHub' },
  { title: 'Configure Environment', description: 'Set up security and connection settings' },
  { title: 'Start Services', description: 'Launch with Docker Compose' },
  { title: 'Verify Installation', description: 'Confirm services are running properly' },
  { title: 'Initial Setup', description: 'Create admin account and configure settings' }
]" />

### SSM Architecture Overview

The SSM architecture consists of several key components:

- **Client**: Vue.js-based frontend interface
- **Server**: Node.js backend API and business logic
- **MongoDB**: Database for storing configuration and state
- **Redis**: Cache and message broker
- **Proxy**: Nginx reverse proxy for routing requests
- **Prometheus**: Optional metrics collection (for monitoring)

## Prerequisites

Before proceeding with manual installation, ensure you have:

- Git installed on your system
- Docker and Docker Compose installed
  - Docker Engine 20.10.0 or newer
  - Docker Compose V1 or V2
- 2GB RAM minimum (4GB recommended)
- 10GB free disk space
- Basic knowledge of command-line operations
- A text editor for configuration files

### Installing Prerequisites

::: code-group
```bash [Ubuntu/Debian]
# Update package lists
sudo apt update

# Install Git
sudo apt install -y git

# Install Docker
sudo apt install -y docker.io

# Install Docker Compose
sudo apt install -y docker-compose

# Add your user to the docker group (to run Docker without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker
```

```bash [CentOS/RHEL]
# Install Git
sudo yum install -y git

# Install Docker
sudo yum install -y docker

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker
```

```bash [macOS]
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git

# Install Docker Desktop for Mac
brew install --cask docker

# Start Docker Desktop
open -a Docker
```

```powershell [Windows]
# Install Git for Windows
winget install --id Git.Git -e --source winget

# Install Docker Desktop for Windows
winget install -e --id Docker.DockerDesktop

# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```
:::

## Installation Methods

SSM offers two main manual installation methods: Production and Development. Choose the one that best fits your needs.

### Method 1: Production Installation

This method is recommended for stable deployments in production environments.

#### Step 1: Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/SquirrelCorporation/SquirrelServersManager
```

#### Step 2: Navigate to Project Directory

```bash
# Change to the project directory
cd SquirrelServersManager
```

#### Step 3: Configure Environment Variables

```bash
# Copy the example environment file (if it doesn't exist)
cp .env.example .env

# Edit the environment file with your preferred editor
nano .env
```

Update the following security-related variables in the `.env` file:

```ini
# SECURITY SETTINGS - CHANGE THESE VALUES!
SECRET=REPLACE_WITH_LONG_RANDOM_STRING
SALT=1234567890123456
VAULT_PWD=REPLACE_WITH_STRONG_PASSWORD
```

:::danger 🔐 Security Warning
- `SECRET`: Used for JWT token signing - use a long, random string
- `SALT`: **Must be exactly 16 alphanumeric characters** - used for encryption
- `VAULT_PWD`: Used for Ansible vault encryption - use a strong password

Never use the default values in production environments!
:::

#### Step 4: Start the Application

For Docker Compose V2:
```bash
docker compose up -d
```

For Docker Compose V1:
```bash
docker-compose up -d
```

The `-d` flag runs containers in the background (detached mode).

#### Step 5: Access the Interface

Open your browser and navigate to:
- [http://localhost:8000](http://localhost:8000) or 
- [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Troubleshooting

Common issues and their solutions during manual installation.

<details>
<summary>Docker Compose Errors</summary>

- **Symptom**: `docker compose up` fails with errors like "service ... failed to build" or network issues.
- **Solution**: 
  - Ensure Docker and Docker Compose are correctly installed and on the system PATH.
  - Check for port conflicts on your host machine (e.g., if port 8000 is already in use).
  - Verify you have sufficient disk space and memory.
  - Try pruning unused Docker images and volumes: `docker system prune -a`
</details>

<details>
<summary>Environment Variable Issues</summary>

- **Symptom**: Application fails to start, or features don't work as expected, possibly due to incorrect `.env` settings.
- **Solution**:
  - Double-check that `SECRET`, `SALT`, and `VAULT_PWD` are correctly set and meet requirements (e.g., SALT length).
  - Ensure the `.env` file is in the project root and readable by the Docker daemon/user.
  - If you modified other variables, ensure they are correct.
</details>

<details>
<summary>Database Connection Problems</summary>

- **Symptom**: Errors related to MongoDB connection.
- **Solution**:
  - Check Docker logs for the MongoDB container: `docker logs <mongodb_container_name>`
  - Ensure the MongoDB service is running correctly within Docker.
  - Verify network connectivity between the SSM server container and the MongoDB container if they are on custom Docker networks.
</details>

