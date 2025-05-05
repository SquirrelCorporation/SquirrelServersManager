<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import ProcessSteps from '/components/ProcessSteps.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Architecture Overview" 
  icon="🏗️" 
  time="Reading time: 10 minutes" 
/>

:::tip 🌰 In a Nutshell
- SSM uses an agentless architecture with SSH as the primary connection method
- Components include a server, client frontend, database, and cache
- Secure, lightweight approach with minimal requirements on target devices
- Combines Docker and Ansible capabilities through a unified interface
- Modular design enables extensibility through plugins
:::

## System Architecture

Squirrel Servers Manager (SSM) is designed with a modern, microservices-based architecture that prioritizes security, flexibility, and ease of use. This document provides an overview of how SSM works and how its components interact.

<div class="architecture-diagram">
  <img src="/overview/reference-architecture.svg" alt="SSM Architecture Overview" />
  <div class="diagram-caption">Figure 1: High-level architecture of SSM</div>
</div>

## Core Components

### Server Component

The SSM server is the central component that:
- Handles authentication and user management
- Communicates with devices over SSH
- Runs Ansible playbooks and commands
- Manages the database and caching layer
- Provides the REST API for the frontend client

**Technologies Used**:
- Node.js with NestJS framework
- TypeScript for type safety
- WebSockets for real-time updates
- JWT for authentication

### Client Component

The web-based frontend client provides:
- User interface for all SSM features
- Real-time device monitoring
- Container management interface
- Dashboard with performance metrics
- Configuration tools for devices and services

**Technologies Used**:
- React with TypeScript
- Ant Design component library
- WebSockets for real-time updates
- Chart libraries for metrics visualization

### Storage Components

SSM uses two primary storage mechanisms:

<div class="component-cards">
  <div class="component-card">
    <div class="component-card-header">MongoDB</div>
    <div class="component-card-content">
      <p><strong>Purpose:</strong> Primary database for persistent data storage</p>
      <p><strong>Stores:</strong></p>
      <ul>
        <li>User accounts and preferences</li>
        <li>Device configurations</li>
        <li>Container definitions</li>
        <li>Playbook execution history</li>
        <li>System settings and credentials</li>
      </ul>
    </div>
  </div>
  
  <div class="component-card">
    <div class="component-card-header">Redis</div>
    <div class="component-card-content">
      <p><strong>Purpose:</strong> In-memory data store for queue management and settings</p>
      <p><strong>Stores:</strong></p>
      <ul>
        <li>Session data</li>
        <li>Task execution queues</li>
        <li>Settings storage</li>
        <li>WebSocket subscription data</li>
      </ul>
    </div>
  </div>
</div>


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
- Role-based access control for operations
- Session management with configurable expiration
- Secure credential storage and transmission

### Network Security

- SSH connections with strict host key verification
- No permanent open ports on managed devices
- SSH connections closed after command execution

## Agentless Architecture Benefits

SSM's agentless approach offers several advantages:

<div class="benefits-grid">
  <div class="benefit-card">
    <h4>🛡️ Lower Attack Surface</h4>
    <p>No permanent agents running on devices means a reduced attack surface and fewer potential vulnerabilities.</p>
  </div>
  
  <div class="benefit-card">
    <h4>🧰 Simple Maintenance</h4>
    <p>No agent updates or patching required on managed devices, simplifying long-term maintenance.</p>
  </div>
  
  <div class="benefit-card">
    <h4>⚡ Resource Efficiency</h4>
    <p>Minimal resource usage on managed devices since there's no resident agent consuming memory or CPU.</p>
  </div>
  
  <div class="benefit-card">
    <h4>🔄 Instant Compatibility</h4>
    <p>Works with any device that supports SSH, without requiring complex agent installation procedures.</p>
  </div>
</div>


## Deployment Options

SSM supports various deployment configurations:

### Standard Deployment

The recommended deployment with all components:
- Server for backend functionality
- Client for frontend interface
- MongoDB for data storage
- Redis for queue management and settings

### Minimal Deployment

A lightweight configuration for resource-constrained environments:
- Combined server and client
- MongoDB for storage
- No Redis (reduced queue management capabilities)

### Enterprise Deployment

For larger installations managing many devices:
- Load-balanced server instances
- Replicated MongoDB for high availability
- Redis cluster for distributed queue management
- Separate metrics storage for long-term data

## Related Concepts

<div class="related-concepts">
  <a href="/docs/concepts/agentless" class="related-concept">
    <h3>🔄 Agentless Architecture</h3>
    <p>Deep dive into SSM's agentless approach</p>
  </a>
  
  <a href="/docs/concepts/security" class="related-concept">
    <h3>🔐 Security Model</h3>
    <p>How SSM protects your infrastructure</p>
  </a>
  
  <a href="/docs/concepts/plugins" class="related-concept">
    <h3>🧩 Plugin System</h3>
    <p>Extending SSM with custom functionality</p>
  </a>
</div>


## Next Steps

Now that you understand SSM's architecture, learn more about its agentless approach:

<NextStepCard 
  icon="🛠️" 
  title="Agentless Architecture" 
  description="Understand how SSM manages devices without permanent agents" 
  link="/docs/concepts/agentless" 
/>
