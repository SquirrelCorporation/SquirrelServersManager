---
layout: FeatureGuideLayout
title: "Docker Configuration"
icon: "🐳" # Docker whale icon
time: "5 min read"
signetColor: '#23233e'
credits: true
---

:::tip In a Nutshell (🌰)
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


## Configuration Options

### Basic Connection Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `enabled` | Enable Docker integration | `false` | `true` |
| `socketPath` | Path to Docker socket | `/var/run/docker.sock` | `/var/run/docker.sock` |
| `host` | Docker host (for direct connection) | - | `192.168.1.100` |
| `port` | Docker API port (for direct connection) | `2375` | `2376` |

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

- Consider network segmentation for container traffic

## Troubleshooting

| Title                      | Symptoms                                  | Solutions                                                                                                                                                                                            |
|----------------------------|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connection Issues          | - Cannot connect to the Docker daemon     | - Verify the Docker service is running on the remote device<br>- Check SSH connection and permissions<br>- Ensure the Docker socket exists at the configured path<br>- Verify the user has permissions to access the Docker socket |
| Permission Issues          | - Permission denied when accessing Docker | - Add the SSH user to the docker group<br>- Restart the SSH session to apply group changes<br>- Check file permissions on the Docker socket<br>- Verify SELinux or AppArmor settings if applicable      |
| Container Watching Issues  | - Container updates not being detected    | - Check if the container has the correct watching labels<br>- Verify the image uses semantic versioning for tag-based watching<br>- Enable digest watching for images with floating tags<br>- Check registry access and authentication |

## Performance Optimization Tips

- Use the latest supported Docker version for best performance and security.
- Prefer overlay or bridge networks for multi-container setups.
- Limit resource usage with `mem_limit` and `cpus` in Compose files.
- Use bind mounts for high-performance storage, but prefer named volumes for portability.
- Regularly prune unused images and containers to free up disk space:
  ```bash
  docker system prune -af
  ```
- Monitor container stats and set up alerts for high CPU/memory usage.

## Docker Networking with SSM

SSM supports all Docker networking modes. For most use cases:
- Use the default `bridge` network for isolated containers.
- Use `host` networking for maximum performance (not recommended for multi-tenant environments).
- Create custom networks for inter-container communication:
  ```bash
  docker network create mynetwork
  ```
  Then reference in Compose:
  ```yaml
  services:
    app:
      networks:
        - mynetwork
    db:
      networks:
        - mynetwork
  networks:
    mynetwork:
      driver: bridge
  ```
- For remote device management, ensure firewall rules allow required traffic between containers as needed.

## Quick Reference: Common Docker Commands

```bash
# List all containers
docker ps -a

# Start/stop a container
docker start <container>
docker stop <container>

# View logs
docker logs <container>

# Remove unused images/containers
docker system prune -af

# Check resource usage
docker stats
```


## Related Documentation

<FeatureGrid>
  <FeatureCard
    icon="🐳"
    title="Container Management"
    description="Managing Docker containers"
    link="/docs/user-guides/containers/management"
  />
  <FeatureCard
    icon="🔑"
    title="SSH Configuration"
    description="Configuring SSH for device access"
    link="/docs/reference/ssh-configuration"
  />
  <FeatureCard
    icon="📝"
    title="Docker Compose Editor"
    description="Creating and editing Docker Compose files"
    link="/docs/user-guides/stacks/containers/editor"
  />
</FeatureGrid>