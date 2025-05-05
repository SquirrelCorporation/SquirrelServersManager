<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
</script>

# Installation Guide

<div class="quick-start-header">
  <div class="quick-start-icon">🚀</div>
  <div class="quick-start-time">⏱️ Setup time: 15-30 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- SSM can be installed using Docker (recommended) or directly on a host
- Minimum requirements: 1GB RAM, 2 CPU cores, 10GB storage
- Default installation includes MongoDB for data storage and Redis for queue management
- Choose between standard, minimal, or custom deployments based on your needs
:::

## Installation Methods

SSM offers several installation methods to fit different environments and requirements:

<div class="installation-methods">
  <div class="installation-method">
    <h3>🐳 Docker Installation</h3>
    <p><strong>Recommended for:</strong> Most users, production environments</p>
    <p><strong>Benefits:</strong> Easy setup, isolated components, simple updates</p>
    <a href="/docs/install/docker" class="method-link">Docker Installation Guide</a>
  </div>
  
  <div class="installation-method">
    <h3>🖥️ Direct Installation</h3>
    <p><strong>Recommended for:</strong> Experienced users, custom environments</p>
    <p><strong>Benefits:</strong> Full control, no Docker dependency, custom configurations</p>
    <a href="/docs/install/dockerless" class="method-link">Direct Installation Guide</a>
  </div>
  
  <div class="installation-method">
    <h3>🔄 Proxmox Installation</h3>
    <p><strong>Recommended for:</strong> Proxmox users looking for tight integration</p>
    <p><strong>Benefits:</strong> LXC container optimization, Proxmox API integration</p>
    <a href="/docs/install/proxmox" class="method-link">Proxmox Installation Guide</a>
  </div>
</div>

## System Requirements

Ensure your system meets these minimum requirements before installation:

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU       | 2 cores | 4+ cores    |
| RAM       | 1GB     | 2GB+        |
| Storage   | 10GB    | 20GB+       |
| OS        | Linux (any modern distribution) | Ubuntu 20.04+, Debian 11+ |
| Docker    | 20.10+ (if using Docker installation) | Latest stable |
| Node.js   | 16.x+ (if using direct installation) | 18.x+ |

## Deployment Types

Choose the deployment type that best fits your needs:

### Standard Deployment

The recommended configuration includes:
- SSM Server for backend processing
- SSM Client for web interface
- MongoDB for data storage
- Redis for queue management and settings

```bash
# Standard deployment with Docker Compose
curl -sSL https://install.squirrelserversmanager.io | bash
```

### Minimal Deployment

A lighter configuration for resource-constrained environments:
- Combined SSM Server and Client
- MongoDB for data storage
- No Redis (reduced queue management capabilities)

```bash
# Minimal deployment with Docker Compose
curl -sSL https://install.squirrelserversmanager.io/minimal | bash
```

### Custom Deployment

For advanced users who need specific configurations:
- Custom component selection
- External database integration
- Advanced networking options
- Enhanced security settings

```bash
# Download the template configuration
curl -sSL https://install.squirrelserversmanager.io/template > ssm-custom.yml

# Edit the configuration file
nano ssm-custom.yml

# Deploy with your custom configuration
docker-compose -f ssm-custom.yml up -d
```

## Post-Installation

After installing SSM, you should:
1. Complete the first-time setup wizard
2. Create your first device connections
3. Set up container registries (if using container features)
4. Configure backup settings for your data

## Troubleshooting

If you encounter issues during installation:

- Check the [Troubleshooting Guide](/docs/troubleshoot/troubleshoot) for common problems
- Verify system requirements are met
- Check container logs with `docker-compose logs`
- Ensure required ports are not blocked by firewalls

## Next Steps

Once you've completed the installation, proceed to the First Steps guide:

<NextStepCard 
  icon="👣" 
  title="First Steps" 
  description="Set up your first user account and connect your first device" 
  link="/docs/getting-started/first-steps" 
/>
