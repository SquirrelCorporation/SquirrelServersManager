---
layout: FeatureGuideLayout
title: "System Requirements"
icon: 🖥️
time: 5 min read
signetColor: '#23233e'
nextStep:
  icon: 🛠️
  title: Installation Guide
  description: Install SSM using one of our supported methods
  link: /docs/getting-started/installation
credits: true
---

<script setup>
import PageHeader from '/components/PageHeader.vue';
import SectionHeader from '/components/SectionHeader.vue';
import MentalModelDiagram from '/components/MentalModelDiagram.vue';
import NextStepCard from '/components/NextStepCard.vue';
import RequirementsGrid from '/components/RequirementsGrid.vue';

const deviceRequirements = [
  {
    header: '🐳 Docker Devices',
    items: [
      'Docker Engine installed (any version)',
      'Docker API accessible to the SSH user',
      'Sufficient disk space for containers',
    ],
  },
  {
    header: '🔄 Proxmox Devices',
    items: [
      'Proxmox VE 6.0+',
      'API access configured',
      'User with appropriate permissions',
    ],
  },
  {
    header: '📚 Ansible-Managed Devices',
    items: [
      'Python 3.8+',
      'Standard Linux/Unix environment',
      'Appropriate permissions for playbook tasks',
    ],
  },
  {
    header: '🔍 Monitoring-Only Devices',
    items: [
      'Basic system utilities',
      'No special requirements beyond SSH access',
    ],
  },
];

const networkRequirements = [
  {
    header: '🌐 Web Interface',
    items: [
      'Port 8000 must be accessible to users who need to access the SSM web interface.',
    ],
  },
  {
    header: '🔑 SSH Connectivity',
    items: [
      'SSM host must have SSH access to all target devices (typically port 22).',
    ],
  },
  {
    header: '📦 Container Registries',
    items: [
      'Access to container registries (Docker Hub, GitHub Container Registry, etc.) for pulling images.',
    ],
  },
  {
    header: '🔄 Updates',
    items: [
      'Internet access for checking updates and downloading components (can be disabled for air-gapped environments).',
    ],
  },
];

</script>

# System Requirements

:::tip In a Nutshell (🌰)
- Host system needs Docker 20.10+ with Docker Compose V2, 2GB RAM, and 10GB disk space
- Target devices need SSH access and appropriate capabilities (Docker, Proxmox API, etc.)
- Network requirements include port 8000 open for the web interface
- Modern browsers required: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- MongoDB requires AVX CPU support by default (can be disabled)
:::

## Overview

Squirrel Servers Manager (SSM) is designed to run efficiently on a wide range of systems, leveraging Docker for easy deployment and an agentless architecture for managing remote devices. This page outlines the system requirements for both the host system running SSM and the target devices being managed.

<RequirementsGrid :requirements="[
  {
    header: 'Docker Host',
    items: [
      'Docker 20.10+ or Docker Engine',
      'Docker Compose V2',
      '2GB RAM (minimum)',
      '10GB free disk space',
      'Linux-based OS'
    ]
  },
  {
    header: 'Target Devices',
    items: [
      'SSH access (password or key)',
      'Python 3.8+ for Ansible features',
      'Sudo privileges for container management',
      'Docker for container features'
    ]
  },
  {
    header: 'Browser Support',
    items: [
      'Chrome 90+',
      'Firefox 90+',
      'Safari 15+',
      'Edge 90+'
    ]
  },
  {
    header: 'Network',
    items: [
      'Open port 8000 for web interface',
      'Outbound SSH access to devices',
      'Internet access for updates'
    ]
  }
]" />

## Host System Requirements

The host system is where you'll install SSM. This can be a physical server, virtual machine, or container host.

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU       | 2 cores with AVX* | 4+ cores with AVX |
| RAM       | 2 GB    | 4+ GB       |
| Disk Space | 10 GB  | 20+ GB      |
| Network   | 100 Mbps | 1 Gbps     |

\* See [MongoDB AVX workaround](#mongodb-avx-workaround) if your CPU doesn't support AVX instructions.

### Software Requirements

| Software | Version | Notes |
|----------|---------|-------|
| Docker   | 20.10+  | Needed for container management |
| Docker Compose | V2 | Required for orchestrating the SSM containers |
| Operating System | Linux-based | Docker on Windows/macOS is supported but may have limitations |

## Target Device Requirements

Target devices are the servers or systems you want to manage with SSM. Since SSM uses an agentless architecture, there's no need to install software on these devices.

### Basic Requirements (All Devices)

- SSH access (password or key-based authentication)
- User with sudo/root privileges
- Network connectivity between SSM host and target device

### Device-Specific Requirements

<RequirementsGrid :requirements="deviceRequirements" />

## Network Requirements

<RequirementsGrid :requirements="networkRequirements" />

<style>
</style>

## Storage Requirements

SSM's storage requirements vary based on the number of devices managed, containers deployed, and monitoring data retained.

<MentalModelDiagram 
  title="Storage Requirements" 
  imagePath="/images/reference-storage-requirements-dark.svg" 
  altText="SSM Storage Requirements (Dark Mode)" 
  caption="Figure 1: SSM Storage Requirements Breakdown" 
/>

## Advanced Topics

### MongoDB AVX Workaround {#mongodb-avx-workaround}

Modern MongoDB versions require CPUs with AVX instructions. If your CPU doesn't support AVX, you can use an older MongoDB version by modifying your docker-compose.yml file:

```yaml
services:
  mongo:
    image: mongo:4.4.18  # Use this older version that doesn't require AVX
```

### Reducing Resource Usage

For low-resource environments, you can modify resource limits in your docker-compose.yml:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          memory: 512M
  client:
    deploy:
      resources:
        limits:
          memory: 256M
```

### Air-Gapped Environments

SSM can operate in air-gapped environments with some limitations:
- Pre-download all needed container images
- Disable automatic updates
- Set up local container registries if needed
- Prepare any required Ansible collections in advance


## Troubleshooting Requirements Issues

If you encounter issues with system requirements, check our troubleshooting guide:

<NextStepCard 
  icon="🔧" 
  title="Troubleshooting Guide" 
  description="Solve common installation and requirements issues" 
  link="/docs/troubleshoot/troubleshoot" 
/>