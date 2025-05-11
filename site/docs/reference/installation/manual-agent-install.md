---
layout: FeatureGuideLayout
title: "Agent Installation (Deprecated)"
icon: "🔩"
time: 10 min read
signetColor: '#23233e'
nextStep:
  icon: 🔧
  title: SSH Configuration
  description: Learn how to configure SSH connections for your devices
  link: /docs/reference/ssh-configuration
credits: true
---

:::warning ⚠️ Deprecation Notice
Agents are deprecated as of SSM version 0.1.28 and later. SSM now uses an agentless architecture by default.
:::

:::tip In a Nutshell (🌰)
- SSM is agentless by default; manual agent installation is only needed for rare edge cases
- Two installation methods: NodeJS agent (recommended) or Docker-based agent
- Installation requires SSM API URL and optionally a device UUID
- Use PM2 or Docker for persistent operation
- For most users, the built-in SSH connection is preferred over agents
:::

## Overview

While the Squirrel Servers Manager (SSM) platform is designed to be primarily agentless, there are some specialized scenarios where installing an agent on a remote device can be beneficial. This guide covers the manual installation process for both Node.js and Docker-based agents.

## Prerequisites

<RequirementsGrid :requirements="[
  {
    header: 'SSM API URL',
    items: ['You need the URL of your SSM server (e.g., http://192.168.0.3:8000)']
  },
  {
    header: 'Device UUID (Optional)',
    items: ['Required if the device already exists in SSM']
  },
  {
    header: 'Runtime Environment',
    items: ['Node.js 16+ or Docker 20.10+ depending on your chosen method']
  }
]" />

## When to Use Agents

Before proceeding with agent installation, consider if you really need an agent:

- **Use agents when**:
  - Your device is behind a NAT or firewall that prevents incoming SSH connections
  - You have specialized monitoring requirements
  - You're in a legacy environment that requires agent-based management

- **Use agentless mode (preferred) when**:
  - You have direct SSH access to the device
  - You want simpler deployment with fewer moving parts
  - You need stronger security and less attack surface

## Installation Methods

### Method 1: NodeJS Agent (Recommended)

This method installs the agent directly using Node.js and PM2 for process management.

#### Step 1: Prepare Environment Variables

Create a `.env` file with the following required variables:

```bash
# Required
URL_MASTER=http://your-ssm-server:8000

# Optional (customize as needed)
OVERRIDE_IP_DETECTION=192.168.0.1
AGENT_HEALTH_CRON_EXPRESSION='*/30 * * * * *'
STATISTICS_CRON_EXPRESSION='*/30 * * * * *'
```

| Environment Variable | Required | Description |
|---------------------|:--------:|-------------|
| `URL_MASTER` | Yes | URL of the SSM API server |
| `OVERRIDE_IP_DETECTION` | No | Fixed IP to use instead of auto-detection |
| `AGENT_HEALTH_CRON_EXPRESSION` | No | Cron expression for health check reporting |
| `STATISTICS_CRON_EXPRESSION` | No | Cron expression for statistics reporting |

#### Step 2: Install Node.js and PM2

Ensure Node.js (v16 or later) and PM2 are installed:

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

#### Step 3: Clone and Configure the Agent

```bash
# Clone the repository
git clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd SquirrelServersManager-Agent

# Install dependencies
npm install

# Build the agent
npm run build

# Configure environment
cp .env.example .env
# Edit .env with your API URL and other settings
```

#### Step 4: Start the Agent

For testing (foreground operation):

```bash
node ./build/agent.js
```

For production use with PM2 (background operation with persistence):

```bash
# Start the agent with PM2
pm2 start -f ./build/agent.js --name "ssm-agent"

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

#### Step 5: For Existing Devices

If you're installing the agent on a device that already exists in SSM:

```bash
# Create a hostid.txt file with your device UUID
echo "your-device-uuid-here" > hostid.txt

# Or pass the UUID directly at startup
pm2 start -f ./build/agent.js --name "ssm-agent" -- -s your-device-uuid-here
```

### Method 2: Docker-based Agent

This method uses Docker to run the agent in a container.

#### Step 1: Prepare Environment File

Create a `.env` file with the following variables:

```bash
# Required
URL_MASTER=http://your-ssm-server:8000

# Optional
OVERRIDE_IP_DETECTION=192.168.0.1
AGENT_HEALTH_CRON_EXPRESSION='*/30 * * * * *'
STATISTICS_CRON_EXPRESSION='*/30 * * * * *'
HOST_ID_PATH=/data/
LOGS_PATH=/data/logs
HOST_ID=your-device-uuid-here  # Only if the device already exists in SSM
```

#### Step 2: Create Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
services:
  ssm_agent:
    image: ghcr.io/squirrelcorporation/squirrelserversmanager-agent:docker
    network_mode: host
    privileged: true
    env_file:
      - .env
    pid: host
    restart: unless-stopped
    volumes:
      - /proc:/proc
      - /var/run/docker.sock:/var/run/docker.sock
      - ssm-agent-data:/data
volumes:
  ssm-agent-data:
```

#### Step 3: Deploy the Agent

```bash
# Pull the image and start the container
docker-compose up -d
```

#### Alternative: Docker CLI

If you prefer using the Docker CLI directly:

```bash
# Create a volume for agent data
docker volume create ssm-agent-data

# Run the agent container
docker run --network host \
  --privileged \
  --pid=host \
  -v /proc:/proc \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ssm-agent-data:/data \
  --env-file .env \
  --restart unless-stopped \
  --name ssm-agent \
  ghcr.io/squirrelcorporation/squirrelserversmanager-agent:docker
```

## Verifying Installation

### Check Agent Status

For NodeJS agent:
```bash
# Check PM2 status
pm2 status
pm2 logs ssm-agent
```

For Docker agent:
```bash
# Check Docker container status
docker ps -a | grep ssm-agent
docker logs ssm-agent
```

### Verify Agent Connection

1. Log in to your SSM server interface
2. Navigate to the Devices section
3. You should see the new device with "Agent" indicated as the connection method
4. The device status indicator should show as green (online)

## Security Considerations

- **Network Exposure**: Agents initiate outbound connections to the SSM server, which can be beneficial for devices behind NAT but requires the SSM server to be accessible.
- **Privileges**: Both agent types require significant privileges (root or Docker socket access) to gather information and manage containers. Understand the security implications.
- **Agentless Preferred**: The default agentless SSH method generally offers a smaller attack surface.

## Troubleshooting

| Issue | Symptoms | Solutions |
|-------|----------|-----------|
| Connection Issues | - Agent starts but doesn't appear in SSM<br>- Device shows as offline in SSM despite agent running | - Verify `URL_MASTER` in the `.env` file is correct and reachable from the agent host<br>- Check firewalls between the agent and the SSM server<br>- Ensure the SSM server is running and accessible<br>- Review agent logs for connection errors<br>- If using `HOST_ID`, ensure the UUID is correct |
| Permission Issues | - Agent logs show "Permission denied" errors<br>- Agent can't access required files or ports | - For Node agent: Ensure the user has permissions to access required files and ports<br>- For Docker agent: Verify the container is running with privileged mode<br>- Check that all required volume mounts are correctly configured<br>- For Docker agent: Ensure the Docker socket is properly mounted |

## Uninstalling the Agent

### NodeJS Agent Removal

```bash
# Stop and remove from PM2
pm2 delete ssm-agent
pm2 save

# Remove the agent directory
rm -rf ~/SquirrelServersManager-Agent
```

### Docker Agent Removal

```bash
# Using Docker Compose
docker-compose down

# Or using Docker CLI
docker stop ssm-agent
docker rm ssm-agent

# Remove the agent data volume
docker volume rm ssm-agent-data
```

## Related Documentation

<FeatureGrid>
  <FeatureCard
    icon="🛠️"
    title="Manual SSM Installation"
    description="Complete guide for manual SSM installation."
    link="/docs/reference/installation/manual-ssm-from-source"
  />
  <FeatureCard
    icon="🖥️"
    title="Device Management"
    description="Managing devices in SSM."
    link="/docs/user-guides/devices/management"
  />
  <FeatureCard
    icon="🚫"
    title="Agentless Architecture"
    description="Learn about SSM's primary agentless approach."
    link="/docs/concepts/agentless"
  />
</FeatureGrid> 