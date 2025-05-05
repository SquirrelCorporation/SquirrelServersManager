# Docker Configuration Reference

<div class="quick-start-header">
  <div class="quick-start-icon">🐳</div>
  <div class="quick-start-time">⏱️ Estimated time: 10 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- Docker integration is a core feature of SSM's container management capabilities
- SSM connects to Docker via SSH tunneling for secure remote management
- Configuration options include connection settings, monitoring schedules, and container watching preferences
- Docker Compose support enables complex multi-container deployments
- Container updates can be monitored based on image tags or digests
:::

## Overview

Docker integration is at the heart of SSM's container management capabilities. This reference guide covers all Docker configuration options and best practices for managing containers across your infrastructure.

## Connection Methods

SSM connects to Docker on remote devices using SSH tunneling, providing a secure way to manage containers without exposing the Docker API directly to the network.

### SSH Tunneling

The default and recommended method for connecting to Docker:

```yaml
docker:
  enabled: true
  socketPath: /var/run/docker.sock
  sshTunnel:
    enabled: true
    # Uses the same SSH configuration as the device
```

**Advantages**:
- Secure connection through encrypted SSH tunnel
- No need to expose Docker API to the network
- Uses existing SSH credentials
- Works through firewalls that allow SSH

**How it works**:
1. SSM establishes an SSH connection to the device
2. A tunnel is created to the Docker socket on the remote device
3. Docker commands are sent through this encrypted tunnel
4. Responses are returned through the same tunnel

### Direct TCP Connection

For environments where Docker API is exposed over TCP (not recommended for production):

```yaml
docker:
  enabled: true
  host: 192.168.1.100
  port: 2375
  sshTunnel:
    enabled: false
```

**Security Warning**: ⚠️ This method transmits Docker API traffic unencrypted unless TLS is configured. Only use in secure networks or with TLS.

### TLS Secured Connection

For environments requiring encrypted direct connections:

```yaml
docker:
  enabled: true
  host: 192.168.1.100
  port: 2376
  sshTunnel:
    enabled: false
  tls:
    enabled: true
    caFile: /path/to/ca.pem
    certFile: /path/to/cert.pem
    keyFile: /path/to/key.pem
```

## Configuration Options

### Basic Connection Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `enabled` | Enable Docker integration | `false` | `true` |
| `socketPath` | Path to Docker socket | `/var/run/docker.sock` | `/var/run/docker.sock` |
| `host` | Docker host (for direct connection) | - | `192.168.1.100` |
| `port` | Docker API port (for direct connection) | `2375` | `2376` |

### SSH Tunnel Options

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `sshTunnel.enabled` | Enable SSH tunneling | `true` | `true` |
| `sshTunnel.user` | SSH username (if different from device) | Device's SSH user | `docker-admin` |
| `sshTunnel.port` | SSH port (if different from device) | Device's SSH port | `2222` |

### TLS Options

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `tls.enabled` | Enable TLS for direct connection | `false` | `true` |
| `tls.caFile` | Path to CA certificate | - | `/path/to/ca.pem` |
| `tls.certFile` | Path to client certificate | - | `/path/to/cert.pem` |
| `tls.keyFile` | Path to client key | - | `/path/to/key.pem` |
| `tls.verify` | Verify server certificate | `true` | `true` |

### Monitoring Options

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `cron` | Schedule for container monitoring | `0 * * * *` | `*/30 * * * *` |
| `watchstats` | Enable container stats monitoring | `true` | `true` |
| `cronstats` | Schedule for stats monitoring | `*/1 * * * *` | `*/5 * * * *` |
| `watchbydefault` | Watch containers by default | `true` | `false` |
| `watchall` | Watch all containers (including stopped) | `true` | `false` |
| `watchevents` | Watch Docker events | `true` | `true` |

## Container Watching

SSM can monitor your containers for updates based on image tags or digests.

### Tag-Based Monitoring

Monitors container images for newer versions based on semantic versioning:

```yaml
containers:
  watch:
    type: tag
    include: "*"  # Tag patterns to include
    exclude: "beta,rc*"  # Tag patterns to exclude
```

**Best for**:
- Images following semantic versioning (e.g., 1.2.3)
- Stable release channels
- Predictable update paths

### Digest-Based Monitoring

Monitors container images for changes in the image digest, even if the tag remains the same:

```yaml
containers:
  watch:
    type: digest
    repositories: ["docker.io", "ghcr.io"]  # Repositories to check
```

**Best for**:
- Images using floating tags (e.g., "latest", "stable")
- Security-critical containers
- Detecting silent updates

### Container Labels

You can control watching behavior with Docker labels:

| Label | Description | Example |
|-------|-------------|---------|
| `ssm.watch` | Control if container is watched | `"true"` or `"false"` |
| `ssm.watch.tag.include` | Tag patterns to include | `"v*,latest"` |
| `ssm.watch.tag.exclude` | Tag patterns to exclude | `"*-alpha,*-beta"` |
| `ssm.watch.tag.transform` | Transform tag before comparison | `"v(.*)=$1"` |
| `ssm.watch.digest` | Enable digest watching | `"true"` or `"false"` |

Example:

```yaml
services:
  myapp:
    image: nginx:1.21
    labels:
      ssm.watch: "true"
      ssm.watch.tag.include: "1.*"
      ssm.watch.tag.exclude: "*-alpine"
```

## Docker Compose Support

SSM provides comprehensive support for Docker Compose deployments.

### Compose File Management

SSM can:
- Create and edit Docker Compose files
- Deploy multi-container applications
- Manage container stacks
- Update running containers

### Template-Based Deployment

SSM includes a template system for common container deployments:

```yaml
template:
  name: "my-nginx"
  title: "nginx"
  image: "nginx:latest"
  ports:
    - host: 8080
      container: 80
  volumes:
    - bind: "/data/nginx"
      container: "/usr/share/nginx/html"
  env:
    - name: "NGINX_HOST"
      default: "example.com"
  restart_policy: "unless-stopped"
```

## Security Considerations

### Docker Socket Permissions

The SSH user must have access to the Docker socket:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Or set specific permissions on the socket
sudo setfacl -m user:$USER:rw /var/run/docker.sock
```

### Least Privilege Principle

Create a dedicated user for Docker management with limited permissions:

```bash
# Create docker management user
sudo useradd -m docker-admin
sudo usermod -aG docker docker-admin
```

### Network Security

- Use SSH tunneling instead of exposing Docker API
- If using direct connection, always enable TLS
- Consider network segmentation for container traffic

## Troubleshooting

### Connection Issues

**Symptom**: "Cannot connect to the Docker daemon"

**Solution**:
1. Verify the Docker service is running on the remote device
2. Check SSH connection and permissions
3. Ensure the Docker socket exists at the configured path
4. Verify the user has permissions to access the Docker socket

### Permission Issues

**Symptom**: "Permission denied" when accessing Docker

**Solution**:
1. Add the SSH user to the docker group
2. Restart the SSH session to apply group changes
3. Check file permissions on the Docker socket
4. Verify SELinux or AppArmor settings if applicable

### Container Watching Issues

**Symptom**: Container updates not being detected

**Solution**:
1. Check if the container has the correct watching labels
2. Verify the image uses semantic versioning for tag-based watching
3. Enable digest watching for images with floating tags
4. Check registry access and authentication

## Advanced Configuration

### Custom Docker API Version

Specify a particular Docker API version:

```yaml
docker:
  enabled: true
  apiVersion: "1.41"
  socketPath: /var/run/docker.sock
```

### Registry Authentication

Configure authentication for private registries:

```yaml
docker:
  enabled: true
  registries:
    - url: "registry.example.com"
      username: "user"
      password: "password"
```

### Resource Monitoring Thresholds

Set thresholds for container resource alerts:

```yaml
docker:
  monitoring:
    cpu:
      warning: 80  # Percentage
      critical: 95  # Percentage
    memory:
      warning: 80  # Percentage
      critical: 95  # Percentage
    disk:
      warning: 80  # Percentage
      critical: 95  # Percentage
```

## Related Documentation

- [Container Management](/docs/user-guides/containers/management) - Managing Docker containers
- [SSH Configuration](/docs/reference/ssh-configuration) - Configuring SSH for device access
- [Docker Compose Editor](/docs/user-guides/stacks/containers/editor) - Creating and editing Docker Compose files
- [Container Security](/docs/advanced-guides/security) - Security best practices for containers

<div class="next-steps">
  <a href="/docs/user-guides/containers/management" class="next-step-card">
    <div class="next-step-card-title">Container Management</div>
    <div class="next-step-card-description">Learn how to manage Docker containers with SSM</div>
  </a>
</div>

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

.screenshot-container {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.screenshot {
  width: 100%;
  display: block;
}

.screenshot-caption {
  background-color: var(--vp-c-bg-soft);
  padding: 0.75rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider);
}

.next-steps {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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
}

.next-step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.next-step-card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-brand);
}

.next-step-card-description {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>
