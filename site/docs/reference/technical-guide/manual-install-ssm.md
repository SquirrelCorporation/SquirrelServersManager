# Manual SSM Installation Guide

<div class="quick-start-header">
  <div class="quick-start-icon">🛠️</div>
  <div class="quick-start-time">⏱️ Estimated time: 15-20 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- Build SSM from source for complete customization and control
- Choose between production and development environments
- Configure security settings with custom secrets
- Run with Docker Compose for easy deployment
- Access advanced configuration options
:::

## Overview

This guide covers the manual installation process for Squirrel Servers Manager (SSM), allowing you to build the project from source. This approach gives you complete control over the installation and configuration process, making it ideal for advanced users, developers, and custom deployment scenarios.

### Installation Process Flowchart

<div class="installation-flowchart">
  <div class="flowchart-step">
    <div class="flowchart-number">1</div>
    <div class="flowchart-content">
      <h4>Clone Repository</h4>
      <p>Get the source code from GitHub</p>
    </div>
  </div>
  <div class="flowchart-arrow">↓</div>
  
  <div class="flowchart-step">
    <div class="flowchart-number">2</div>
    <div class="flowchart-content">
      <h4>Configure Environment</h4>
      <p>Set up security and connection settings</p>
    </div>
  </div>
  <div class="flowchart-arrow">↓</div>
  
  <div class="flowchart-step">
    <div class="flowchart-number">3</div>
    <div class="flowchart-content">
      <h4>Start Services</h4>
      <p>Launch with Docker Compose</p>
    </div>
  </div>
  <div class="flowchart-arrow">↓</div>
  
  <div class="flowchart-step">
    <div class="flowchart-number">4</div>
    <div class="flowchart-content">
      <h4>Verify Installation</h4>
      <p>Confirm services are running properly</p>
    </div>
  </div>
  <div class="flowchart-arrow">↓</div>
  
  <div class="flowchart-step">
    <div class="flowchart-number">5</div>
    <div class="flowchart-content">
      <h4>Initial Setup</h4>
      <p>Create admin account and configure settings</p>
    </div>
  </div>
</div>

### SSM Architecture Overview

<div class="architecture-diagram">
  <img src="/images/ssm-architecture.png" alt="SSM Architecture Diagram" class="full-width-image" />
  <div class="diagram-caption">Figure 1: SSM Architecture Components</div>
</div>

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

### Quick Verification

After installation, verify that all components are running correctly:

<div class="verification-steps">
  <div class="verification-step">
    <div class="verification-icon">✅</div>
    <div class="verification-content">
      <h4>Check Running Containers</h4>
      <div class="code-with-copy">
        <pre><code>docker compose ps</code></pre>
        <button class="copy-button" onclick="navigator.clipboard.writeText('docker compose ps')">Copy</button>
      </div>
      <p>All containers should show <code>Up</code> status</p>
    </div>
  </div>
  
  <div class="verification-step">
    <div class="verification-icon">✅</div>
    <div class="verification-content">
      <h4>Verify Web Interface</h4>
      <p>Open <a href="http://localhost:8000" target="_blank">http://localhost:8000</a> in your browser</p>
      <p>You should see the SSM login screen:</p>
      <div class="screenshot-container">
        <img src="/images/ssm-login-screen.png" alt="SSM Login Screen" class="screenshot" />
      </div>
    </div>
  </div>
  
  <div class="verification-step">
    <div class="verification-icon">✅</div>
    <div class="verification-content">
      <h4>Check API Health</h4>
      <div class="code-with-copy">
        <pre><code>curl http://localhost:8000/api/health</code></pre>
        <button class="copy-button" onclick="navigator.clipboard.writeText('curl http://localhost:8000/api/health')">Copy</button>
      </div>
      <p>Should return <code>{"status":"ok"}</code></p>
    </div>
  </div>
  
  <div class="verification-step">
    <div class="verification-icon">✅</div>
    <div class="verification-content">
      <h4>Check MongoDB Connection</h4>
      <div class="code-with-copy">
        <pre><code>docker compose logs server | grep "Connected to MongoDB"</code></pre>
        <button class="copy-button" onclick="navigator.clipboard.writeText('docker compose logs server | grep \"Connected to MongoDB\"')">Copy</button>
      </div>
      <p>Should show a successful connection message</p>
    </div>
  </div>
</div>

### Method 2: Development Installation

This method is recommended for developers who want to contribute to SSM or customize its functionality.

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

Update the security-related variables as described in the Production installation method.

#### Step 4: Start the Development Environment

```bash
# For Docker Compose V2
docker compose -f docker-compose.dev.yml up

# For Docker Compose V1
docker-compose -f docker-compose.dev.yml up
```

Note: We don't use the `-d` flag here so you can see the logs in real-time, which is useful for development.

#### Step 5: Access the Development Interface

Open your browser and navigate to:
- [http://localhost:8000](http://localhost:8000) or 
- [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Advanced Configuration

### Environment Variables

The `.env` file contains various configuration options. Here are the most important ones:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET` | JWT signing secret | None | Yes |
| `SALT` | Encryption salt (16 chars) | None | Yes |
| `VAULT_PWD` | Ansible vault password | None | Yes |
| `DB_HOST` | MongoDB hostname | `mongo` | No |
| `DB_NAME` | MongoDB database name | `ssm` | No |
| `DB_PORT` | MongoDB port | `27017` | No |
| `REDIS_HOST` | Redis hostname | `redis` | No |
| `REDIS_PORT` | Redis port | `6379` | No |
| `TELEMETRY_ENABLED` | Enable anonymous telemetry | `true` | No |

### Custom Port Configuration

To change the default port (8000), modify the `docker-compose.yml` file:

```yaml
proxy:
  ports:
    - "8080:8000"  # Change 8000 to your desired port (e.g., 8080)
```

### Persistent Data

SSM stores persistent data in the `.data.prod` directory (for production) or `.data.dev` directory (for development). These directories contain:

- MongoDB data
- Redis data
- Prometheus metrics
- Uploaded files
- Configuration files

To back up your data, simply copy these directories.

### Performance Tuning Recommendations

For optimal performance in production environments, consider the following tuning options:

<div class="performance-tuning">
  <div class="tuning-section">
    <h4>MongoDB Performance</h4>
    <div class="tuning-item">
      <div class="tuning-icon">🔄</div>
      <div class="tuning-content">
        <h5>Increase MongoDB Cache Size</h5>
        <p>Modify the <code>docker-compose.yml</code> file to allocate more memory to MongoDB:</p>
        <div class="code-with-copy">
          <pre><code>mongo:
  environment:
    - MONGO_WIREDTIGER_CACHE_SIZE_GB=1</code></pre>
          <button class="copy-button" onclick="navigator.clipboard.writeText('mongo:\n  environment:\n    - MONGO_WIREDTIGER_CACHE_SIZE_GB=1')">Copy</button>
        </div>
        <p>Adjust the value based on your available memory. For systems with 8GB+ RAM, set to 2GB or higher.</p>
      </div>
    </div>
    
    <div class="tuning-item">
      <div class="tuning-icon">📊</div>
      <div class="tuning-content">
        <h5>Enable MongoDB Monitoring</h5>
        <p>Add MongoDB monitoring to track performance:</p>
        <div class="code-with-copy">
          <pre><code>mongo:
  command: --wiredTigerCacheSizeGB 1 --setParameter diagnosticDataCollectionEnabled=true</code></pre>
          <button class="copy-button" onclick="navigator.clipboard.writeText('mongo:\n  command: --wiredTigerCacheSizeGB 1 --setParameter diagnosticDataCollectionEnabled=true')">Copy</button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="tuning-section">
    <h4>Node.js Server Performance</h4>
    <div class="tuning-item">
      <div class="tuning-icon">🧵</div>
      <div class="tuning-content">
        <h5>Adjust Node.js Memory Limits</h5>
        <p>Modify the <code>docker-compose.yml</code> file to increase Node.js memory limits:</p>
        <div class="code-with-copy">
          <pre><code>server:
  environment:
    - NODE_OPTIONS=--max-old-space-size=2048</code></pre>
          <button class="copy-button" onclick="navigator.clipboard.writeText('server:\n  environment:\n    - NODE_OPTIONS=--max-old-space-size=2048')">Copy</button>
        </div>
        <p>This increases the heap size to 2GB. Adjust based on your system's available memory.</p>
      </div>
    </div>
    
    <div class="tuning-item">
      <div class="tuning-icon">⚡</div>
      <div class="tuning-content">
        <h5>Enable Compression</h5>
        <p>Add compression settings to the server environment:</p>
        <div class="code-with-copy">
          <pre><code>server:
  environment:
    - COMPRESSION_ENABLED=true
    - COMPRESSION_LEVEL=6</code></pre>
          <button class="copy-button" onclick="navigator.clipboard.writeText('server:\n  environment:\n    - COMPRESSION_ENABLED=true\n    - COMPRESSION_LEVEL=6')">Copy</button>
        </div>
        <p>This reduces network traffic at the cost of some CPU usage. Level ranges from 1 (fastest) to 9 (most compression).</p>
      </div>
    </div>
  </div>
  
  <div class="tuning-section">
    <h4>Redis Performance</h4>
    <div class="tuning-item">
      <div class="tuning-icon">💾</div>
      <div class="tuning-content">
        <h5>Optimize Redis Memory Usage</h5>
        <p>Add memory optimization settings to Redis:</p>
        <div class="code-with-copy">
          <pre><code>redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru</code></pre>
          <button class="copy-button" onclick="navigator.clipboard.writeText('redis:\n  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru')">Copy</button>
        </div>
        <p>This limits Redis memory usage and sets an eviction policy to remove least recently used keys when memory is full.</p>
      </div>
    </div>
  </div>
  
  <div class="tuning-section">
    <h4>System-Level Optimizations</h4>
    <div class="tuning-item">
      <div class="tuning-icon">🖥️</div>
      <div class="tuning-content">
        <h5>Host System Tuning</h5>
        <p>For Linux hosts, consider these system-level optimizations:</p>
        <div class="code-with-copy">
          <pre><code># Increase file descriptor limits
echo "fs.file-max = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Optimize network settings
echo "net.core.somaxconn = 4096" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 4096" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p</code></pre>
          <button class="copy-button" onclick="navigator.clipboard.writeText('# Increase file descriptor limits\necho \"fs.file-max = 65536\" | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p\n\n# Optimize network settings\necho \"net.core.somaxconn = 4096\" | sudo tee -a /etc/sysctl.conf\necho \"net.ipv4.tcp_max_syn_backlog = 4096\" | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p')">Copy</button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.performance-tuning {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.tuning-section {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1rem;
}

.tuning-section h4 {
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
}

.tuning-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tuning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tuning-content {
  flex: 1;
}

.tuning-content h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.code-with-copy {
  position: relative;
  margin: 0.5rem 0;
}

.code-with-copy pre {
  margin: 0;
  padding: 1rem;
  background-color: var(--vp-c-bg);
  border-radius: 4px;
  overflow-x: auto;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.copy-button:hover {
  opacity: 1;
}

.verification-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.verification-step {
  display: flex;
  gap: 1rem;
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
}

.verification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.verification-content {
  flex: 1;
}

.verification-content h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.screenshot-container {
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}

.screenshot {
  max-width: 100%;
  display: block;
}

.installation-flowchart {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.5rem 0;
  align-items: center;
}

.flowchart-step {
  display: flex;
  gap: 1rem;
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.flowchart-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: var(--vp-c-brand);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.flowchart-content {
  flex: 1;
}

.flowchart-content h4 {
  margin-top: 0;
  margin-bottom: 0.25rem;
}

.flowchart-content p {
  margin: 0;
}

.flowchart-arrow {
  font-size: 1.5rem;
  color: var(--vp-c-brand);
}

.architecture-diagram {
  margin: 1.5rem 0;
}

.full-width-image {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.diagram-caption {
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .tuning-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .verification-step {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

## Building from Source Without Docker

For advanced users who want to build and run SSM without Docker:

<details>
<summary>Building SSM Components Manually</summary>

### Prerequisites
- Node.js 18 or newer
- MongoDB 5.0 or newer
- Redis 6.0 or newer
- Prometheus (optional, for metrics)

### Building the Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Build the server
npm run build

# Start the server
npm run start:prod
```

### Building the Client
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build the client
npm run build

# Serve the client (optional)
npm run serve
```

### Running Without Proxy
You'll need to configure your own web server (like Nginx) to serve the client and proxy API requests to the server.

</details>

## Troubleshooting

### Common Issues

<details>
<summary>Docker Compose Command Not Found</summary>

**Problem**: `docker-compose` command not found

**Solution**: 
1. For Docker Compose V2, use `docker compose` (with a space)
2. For Docker Compose V1, ensure it's installed:
   ```bash
   sudo apt-get install docker-compose
   ```
   or
   ```bash
   pip install docker-compose
   ```
</details>

<details>
<summary>Port Conflicts</summary>

**Problem**: Error message about port 8000 already in use

**Solution**: 
1. Find the process using port 8000:
   ```bash
   sudo lsof -i :8000
   ```
   or
   ```bash
   netstat -tuln | grep 8000
   ```
2. Stop the process or change SSM's port in docker-compose.yml:
   ```yaml
   proxy:
     ports:
       - "8080:8000"  # Use port 8080 instead
   ```
</details>

<details>
<summary>MongoDB Connection Issues</summary>

**Problem**: Server container fails with MongoDB connection errors

**Solution**: 
1. Check if MongoDB container is running:
   ```bash
   docker ps | grep mongo
   ```
2. Verify MongoDB data directory permissions:
   ```bash
   sudo chown -R 1000:1000 ./.data.prod/db
   ```
3. Check MongoDB logs:
   ```bash
   docker logs mongo-ssm
   ```
</details>

<details>
<summary>Environment Variable Issues</summary>

**Problem**: Application fails to start with environment variable errors

**Solution**: 
1. Ensure `.env` file exists in the project root
2. Verify all required variables are set
3. Check for syntax errors in the `.env` file
4. Restart containers after changing environment variables:
   ```bash
   docker compose down
   docker compose up -d
   ```
</details>

### Viewing Logs

To view logs for troubleshooting:

```bash
# View logs for all containers
docker compose logs

# View logs for a specific container
docker compose logs server

# Follow logs in real-time
docker compose logs -f

# Show last 100 lines of logs
docker compose logs --tail=100
```

## Updating SSM

To update your manually installed SSM to the latest version:

```bash
# Navigate to your SSM directory
cd SquirrelServersManager

# Pull the latest code
git pull

# Rebuild and restart containers
docker compose down
docker compose up -d
```

For development environments:
```bash
git pull
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up
```

## Next Steps

After completing the manual installation, you'll want to set up your administrator account and configure your first device:

<a href="/docs/getting-started/first-steps" class="next-step-card">
  <div class="next-step-icon">👉</div>
  <h2>First Time Setup</h2>
  <div class="next-step-separator"></div>
  <p>Create your admin account and get started with SSM</p>
</a>

## Related Documentation

- [System Requirements](/docs/requirements) - Detailed system requirements
- [Docker Installation](/docs/install/docker) - Simplified Docker installation
- [Proxmox Installation](/docs/install/proxmox) - Installation on Proxmox
- [Dockerless Installation](/docs/install/dockerless) - Running without Docker
- [Proxy-Free Installation](/docs/install/proxy-free) - Installation without the proxy component

<style>
.quick-start-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
}

.quick-start-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.quick-start-time {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.next-step-card {
  display: block;
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--vp-c-divider);
  margin-top: 2rem;
}

.next-step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.next-step-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.next-step-separator {
  height: 1px;
  background-color: var(--vp-c-divider);
  margin: 0.5rem 0 1rem 0;
}
</style>
