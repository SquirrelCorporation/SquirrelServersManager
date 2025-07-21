---
layout: FeatureGuideLayout
title: "Architecture Overview"
icon: 🏗️ # From PageHeader
time: 10 minutes # From PageHeader (simplified)
signetColor: '#3498db' # Blue for Concepts
nextStep:
  icon: 🛠️
  title: Agentless Architecture
  description: Understand how SSM manages devices without permanent agents
  link: /docs/concepts/agentless
credits: true
---

:::tip In a Nutshell (🌰)
- SSM uses an agentless architecture with SSH as the primary connection method
- Components include a server, client frontend, database, and cache
- Secure, lightweight approach with minimal requirements on target devices
- Combines Docker and Ansible capabilities through a unified interface
- Modular design enables extensibility through plugins
:::

## System Architecture

Squirrel Servers Manager (SSM) is designed with a modern, microservices-based architecture that prioritizes security, flexibility, and ease of use. This document provides an overview of how SSM works and how its components interact.

## Core Components

### Server Component

The SSM server is the central component that:
- Handles authentication and user management
- Communicates with devices over SSH
- Runs Ansible playbooks and commands
- Manages the database and caching layer
- Provides the REST API for the frontend client

**Technologies Used**:
| Technology   | Purpose                        |
|-------------|-------------------------------|
| Node.js + NestJS | Backend framework and runtime |
| TypeScript  | Type safety and better tooling  |
| WebSockets  | Real-time updates               |
| JWT         | Authentication                  |

### Client Component

The web-based frontend client provides:
- User interface for all SSM features
- Real-time device monitoring
- Container management interface
- Dashboard with performance metrics
- Configuration tools for devices and services

**Technologies Used**:
| Technology   | Purpose                                 |
|-------------|-----------------------------------------|
| React + TypeScript | Frontend framework and type safety     |
| Ant Design  | UI component library                      |
| WebSockets  | Real-time updates                         |
| Chart libraries | Metrics visualization                  |

### Storage Components

SSM uses two primary storage mechanisms:

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="MongoDB"
    purpose="Primary database for persistent data storage"
    :storesItems="[
      'User accounts and preferences',
      'Device configurations',
      'Container definitions',
      'Playbook execution history',
      'System settings and credentials'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Redis"
    purpose="In-memory data store for queue management and settings"
    :storesItems="[
      'Session data',
      'Task execution queues',
      'Settings storage',
      'WebSocket subscription data'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Prometheus"
    purpose="Collects and stores metrics from devices and containers"
    :storesItems="[
      'Time-series metrics',
      'Alerting rules',
      'Service discovery configurations'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Local Filesystem Storage"
    purpose="Stores underlying data for databases and other persistent application files"
    :storesItems="[
      'MongoDB data files',
      'Redis RDB/AOF files',
      'Application logs',
      'Uploaded user content',
      'Backup archives'
    ]"
  />
</ComponentInfoGrid>


### Monitoring Components

SSM includes built-in monitoring capabilities through:

- **Prometheus**: Collects and stores metrics from devices and containers
- **Internal Metrics Collector**: Gathers performance data through SSH and Docker API

## Communication Flow

<ProcessSteps :steps="[
  { title: 'Client Request', description: 'User initiates action via the web interface' },
  { title: 'Server Processing', description: 'Server validates request and prepares operation' },
  { title: 'Device Connection', description: 'Server connects to target device using SSH' },
  { title: 'Command Execution', description: 'Command, playbook, or Docker operation runs on device' },
  { title: 'Result Processing', description: 'Server processes and stores operation results' },
  { title: 'Client Update', description: 'Result sent to client via REST API or WebSocket' }
]" />


## Security Architecture

Security is a core principle of SSM's design:

### Credential Management

- SSH keys and passwords encrypted using Ansible Vault
- Credentials stored in database with additional encryption layer
- No permanent storage of plain-text secrets in memory

### Authentication & Authorization

- JWT-based authentication for API access
- Session management with configurable expiration
- Secure credential storage and transmission

### Network Security

- SSH connections with strict host key verification
- No permanent open ports on managed devices (except SSH)
- SSH connections closed after command execution

## Agentless Architecture Benefits

SSM's agentless approach offers several advantages:

<FeatureGrid>
  <FeatureCard
    icon="🛡️"
    title="Lower Attack Surface"
    description="No permanent agents running on devices means a reduced attack surface and fewer potential vulnerabilities."
  />
  <FeatureCard
    icon="🧰"
    title="Simple Maintenance"
    description="No agent updates or patching required on managed devices, simplifying long-term maintenance."
  />
  <FeatureCard
    icon="⚡"
    title="Resource Efficiency"
    description="Minimal resource usage on managed devices since there's no resident agent consuming memory or CPU."
  />
  <FeatureCard
    icon="🔄"
    title="Instant Compatibility"
    description="Works with any device that supports SSH, without requiring complex agent installation procedures."
  />
</FeatureGrid>

## Related Concepts

<FeatureGrid>
  <FeatureCard
    icon="🔄"
    title="Agentless Architecture"
    description="Deep dive into SSM's agentless approach"
    link="/docs/concepts/agentless"
  />
  <FeatureCard
    icon="🔐"
    title="Security Model"
    description="How SSM protects your infrastructure"
    link="/docs/concepts/security"
  />
  <FeatureCard
    icon="🧩"
    title="Plugin System"
    description="Extending SSM with custom functionality"
    link="/docs/concepts/plugins"
  />
</FeatureGrid>

