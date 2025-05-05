<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
</script>

# Container Management

<div class="quick-start-header">
  <div class="quick-start-icon">🐳</div>
  <div class="quick-start-time">⏱️ Reading time: 8 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- View all Docker containers across your devices
- Deploy containers from templates or custom configurations
- Start, stop, restart, and remove containers
- View container logs and resource usage
- Manage Docker images, networks, and volumes
:::

## Container Overview

SSM provides a centralized container management interface that allows you to monitor and control Docker containers across all your connected devices. The Containers tab gives you a comprehensive view of your containerized applications.

<div class="screenshot-container">
  <img src="/services.png" alt="Containers Dashboard" class="screenshot" />
  <div class="screenshot-caption">The Containers dashboard showing all containers across devices</div>
</div>

### Key Features

The container management interface offers:

- **Unified view** of all containers across your infrastructure
- **Filtering and sorting** to find specific containers
- **Quick actions** for common container operations
- **Detailed information** about each container
- **Logs and monitoring** for troubleshooting

## Viewing Containers

The Containers tab displays all containers in a table format with key information:

| Column | Description |
|--------|-------------|
| **Name** | Container name |
| **Image** | Docker image name and tag |
| **Status** | Current container state (running, stopped, etc.) |
| **Ports** | Exposed port mappings |
| **Created** | When the container was created |
| **Device** | The host device running the container |

### Container Details

Click on a container to view detailed information:

<div class="screenshot-container">
  <img src="/services/services-1.png" alt="Container Details" class="screenshot" />
  <div class="screenshot-caption">Detailed container information panel</div>
</div>

The details panel shows:

- **Configuration**: Environment variables, volumes, networks
- **Resource Usage**: CPU, memory, network I/O
- **Logs**: Real-time container logs
- **Metadata**: Labels, container ID, creation time

## Managing Containers

### Container Actions

For each container, you can perform several actions:

<div class="screenshot-container">
  <img src="/services/services-overview.gif" alt="Container Actions" class="screenshot" />
  <div class="screenshot-caption">Performing actions on containers</div>
</div>

Available actions include:

- **Start**: Launch a stopped container
- **Stop**: Gracefully stop a running container
- **Restart**: Stop and restart a container
- **Pause/Unpause**: Temporarily suspend container execution
- **Remove**: Delete the container (optionally with volumes)
- **View Logs**: See container output and error logs
- **Inspect**: View detailed container configuration

### Deploying New Containers

SSM offers several ways to deploy new containers:

1. **From Templates**: Use pre-configured container templates
2. **From Image Registry**: Deploy containers from Docker Hub or private registries
3. **Custom Configuration**: Create containers with custom settings
4. **Docker Compose**: Deploy multi-container applications

#### Deploying from Templates

The easiest way to deploy a container is from the templates store:

1. Navigate to the Containers tab
2. Click "Deploy from Store"
3. Browse or search for a template
4. Configure the container settings
5. Click "Deploy"

<div class="screenshot-container">
  <img src="/services/deploy-store.png" alt="Deploy from Store" class="screenshot" />
  <div class="screenshot-caption">Deploying a container from the template store</div>
</div>

Learn more about [deploying from the store](/docs/user-guides/containers/deploy-store).

#### Custom Container Deployment

For more advanced configurations:

1. Navigate to the Containers tab
2. Click "Create Container"
3. Enter the container configuration:
   - Image name and tag
   - Container name
   - Environment variables
   - Port mappings
   - Volume mounts
   - Network settings
4. Select the target device
5. Click "Create"

### Managing Docker Images

SSM allows you to manage Docker images across your devices:

<div class="screenshot-container">
  <img src="/services/services-2.png" alt="Docker Images" class="screenshot" />
  <div class="screenshot-caption">Managing Docker images</div>
</div>

You can:
- **Pull** new images from registries
- **Remove** unused images to free up space
- **View** image details and layers
- **Search** for available images
- **Tag** images with custom labels

### Working with Networks and Volumes

SSM provides interfaces for managing Docker networks and volumes:

<div class="screenshot-container">
  <img src="/services/services-3.png" alt="Docker Networks" class="screenshot" />
  <div class="screenshot-caption">Managing Docker networks</div>
</div>

For networks, you can:
- Create custom networks
- Connect containers to networks
- View network details and connected containers
- Remove unused networks

<div class="screenshot-container">
  <img src="/services/services-1.png" alt="Docker Volumes" class="screenshot" />
  <div class="screenshot-caption">Managing Docker volumes</div>
</div>

For volumes, you can:
- Create new volumes
- Browse volume contents
- Back up volume data
- Remove unused volumes

## Container Stacks

For more complex applications with multiple containers, SSM provides the Container Stacks feature:

<div class="screenshot-container">
  <img src="/compose/compose-1.png" alt="Container Stacks" class="screenshot" />
  <div class="screenshot-caption">Managing container stacks</div>
</div>

Learn more about [using Container Stacks](/docs/user-guides/stacks/containers/editor).

## Troubleshooting Containers

If you encounter issues with your containers:

<details>
<summary>Container fails to start</summary>

**Problem**: Container shows "Exited" status immediately after starting.

**Solutions**:
1. Check container logs for error messages
2. Verify that all required environment variables are set
3. Ensure volume paths exist on the host
4. Check for port conflicts with other containers
5. Confirm the container image is compatible with the host architecture

</details>

<details>
<summary>Cannot access container services</summary>

**Problem**: Container is running but you cannot access its services.

**Solutions**:
1. Verify port mappings are correct
2. Check host firewall settings
3. Ensure the container's internal service is running
4. Try accessing from the host directly to rule out network issues
5. Verify the container is connected to the correct network

</details>

<details>
<summary>Container resource usage issues</summary>

**Problem**: Container is using excessive CPU/memory or performing poorly.

**Solutions**:
1. View container stats to monitor resource usage
2. Add resource limits (CPU, memory) to the container
3. Check for memory leaks in the application
4. Consider scaling the application horizontally
5. Optimize the application or container configuration

</details>

## Next Steps

Now that you understand container management, learn how to deploy pre-configured containers from the store:

<NextStepCard 
  icon="🔄" 
  title="Deploy from Store" 
  description="Learn how to quickly deploy containers from the template store" 
  link="/docs/user-guides/containers/deploy-store" 
/>
