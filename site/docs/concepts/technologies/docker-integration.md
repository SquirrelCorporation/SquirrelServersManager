---
layout: FeatureGuideLayout
title: "Docker Integration Architecture"
icon: "🐳"
time: 10 min read
signetColor: '#23233e' # Reference color
nextStep:
  icon: "🔌"
  title: "Docker Connection Guide"
  description: "Learn about Docker connection methods."
  link: "/docs/reference/docker/connection"
credits: true
---

The Docker integration in Squirrel Servers Manager (SSM) follows Clean Architecture principles with a component-based design. It allows monitoring and managing Docker containers, images, volumes, and networks across multiple remote servers without requiring an agent to be installed on the target systems.


:::tip In a Nutshell (🌰)
- SSM uses agentless architecture to connect to Docker daemons remotely via SSH.
- Components-based design with watchers, registries, and connection adapters.
- Real-time monitoring via WebSockets with customizable watch intervals.
- Registry integrations supporting Docker Hub, ECR, GCR, GHCR, GitLab, and more.
- Clean Architecture implementation with proper separation of concerns.
:::

<MentalModelDiagram 
  title="Docker Architecture in SSM" 
  imagePath="/images/diagrams-docker-architecture.svg" 
  altText="Docker Architecture Diagram" 
  caption="Figure 1: Docker Architecture in Squirrel Servers Manager" 
/>
<!-- TODO: Verify imagePath -->

## SSH-Based Connection

Instead of relying on direct exposure of the Docker HTTP API, SSM uses SSH tunneling to establish secure connections to remote Docker daemons. This approach offers several advantages:

1. No need to expose Docker API ports on remote servers.
2. Leverages existing SSH infrastructure and authentication methods.
3. Works through firewalls and NAT without additional configuration.
4. Provides enhanced security with encryption and key-based authentication.

The connection flow is detailed in the [Docker Connection Guide](/docs/reference/docker/connection).

## Component-Based Architecture

The Docker implementation uses a component-based architecture with several key components:

### Watcher Components

`DockerWatcherComponent` (implements `IWatcherComponent`, extends `AbstractDockerLogsComponent`):
- Monitors container states, statistics, and events on remote Docker hosts.
- Polls containers at configurable intervals.
- Listens for Docker events in real-time (start, stop, create, delete).
- Tracks container statistics (CPU, memory, network I/O, block I/O).
- Monitors container logs (streaming via WebSockets).
- Detects available image updates by comparing with registry information.

### Registry Components

Handle interactions with various container registries:
- Authenticate with registries.
- Query available tags for images.
- Fetch image manifests and digests.
- Normalize image references.

SSM supports multiple registry providers through dedicated components:
- Docker Hub, Amazon ECR, Google GCR, Azure ACR, GitHub GHCR, GitLab Container Registry, Quay.io, and custom registries.

### Connection Adapters

Handle low-level communication with Docker daemons:
- `SSHCredentialsAdapter`: Manages SSH authentication credentials.
- `SsmSshAgent`: Custom SSH agent for Docker communication over SSH tunnel.
- Docker Modem: Handles Docker protocol-level communication.

## Data Flow

1. **User Request**: User initiates an action (e.g., list containers, pull image) via the UI or API.
2. **Controller/Gateway**: Request is received by the appropriate NestJS controller or WebSocket gateway.
3. **Service Layer**: e.g., `ContainerService` processes the request and delegates to relevant components.
4. **Component**: Registry or watcher component performs the operation (e.g., fetch tags, get container list).
5. **SSH Tunnel**: Communication with the remote Docker daemon happens through the secure SSH tunnel.
6. **Response**: Results are returned to the user.
7. **Real-time Updates**: Changes (e.g., container status) are broadcast to connected clients via WebSockets.

## Monitoring and Real-Time Updates

- **Scheduled Monitoring**: Cron jobs in the watcher component periodically check status, resources, image updates, etc. (interval configurable per device).
- **Event-Based Updates**: Listens for Docker events for immediate updates.
- **Statistics Collection**: Resource usage (CPU, memory, network, I/O) collected at configurable intervals and stored.
- **Log Streaming**: Real-time log streaming via WebSockets.

## Container Lifecycle Management

SSM provides comprehensive container lifecycle management:

- **Container Actions**: Start/stop/restart, pause/unpause, kill, remove, view logs, inspect details.
- **Image Management**: Pull images, list images, remove images, check for updates.
- **Volume Management**: Create, mount, remove, backup volumes.
- **Network Management**: Create, connect containers, configure, remove networks.

## Security Considerations

- **Credential Management**: Sensitive credentials (SSH keys/passwords, registry tokens, Docker TLS certs) are encrypted using a vault-based approach.
- **Authentication**: Supports various SSH authentication methods and custom configurations.
- **Connection Security**: SSH connections use standard security (key auth, encryption, timeouts).

## Code Structure (Clean Architecture)

- **Domain Layer**: Entities (`IContainer`, `IContainerImage`), Interfaces (`IContainerService`), Value Objects.
- **Application Layer**: Services (`ContainerService`), Components (Registry, Watcher), Business Logic.
- **Infrastructure Layer**: Repositories (MongoDB), Adapters (SSH, Docker), Schemas.
- **Presentation Layer**: Controllers (REST API), Gateways (WebSockets), DTOs.

## Docker Label System

SSM uses Docker labels to identify and configure containers for update checking and display. These labels typically use the `wud.` prefix.

- `wud.watch`: Whether to monitor the container for updates.
- `wud.tag.include`: Pattern for including image tags in update checks.
- `wud.tag.exclude`: Pattern for excluding image tags.
- `wud.tag.transform`: Transform rules for tag comparison.
- `wud.display.name`: Custom display name for the container.
- `wud.display.icon`: Custom icon for the container.

See the [Container Labelling Guide](/docs/reference/containers/labelling) for full details.

*(Note: This document previously mentioned `ssm.` as a label prefix. The primary system for update checking uses `wud.` as detailed in the labelling guide.)*

## Related Resources

<FeatureGrid>
  <FeatureCard
    icon="🔌"
    title="Docker Connection Guide"
    description="Learn more about this topic."
    link="/docs/reference/docker/connection"
  />
  <FeatureCard
    icon="🏷️"
    title="Container Labelling Guide"
    description="Learn more about this topic."
    link="/docs/reference/containers/labelling"
  />
</FeatureGrid> 