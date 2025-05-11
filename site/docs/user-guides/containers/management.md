---
layout: FeatureGuideLayout
title: "Container Management"
icon: "🐳"
time: "5 min read"
signetColor: '#27ae60'
nextStep:
  icon: "➡️"
  title: "Deploy From Store"
  description: "Deploy a container"
  link: "/docs/user-guides/containers/deploy-store"
credits: true
---

:::tip In a Nutshell (🌰)
- View all Docker containers across your devices
- Deploy containers from templates or custom configurations
- Start, stop, restart, and remove containers
- View container logs and resource usage
- Manage Docker images, networks, and volumes
:::

## Container Overview

SSM provides a centralized container management interface that allows you to monitor and control Docker containers across all your connected devices. SSM automatically discovers and lists running Docker containers from all connected and configured devices, actively monitors Docker events in real-time to keep its information current, and also performs a periodic full scan (hourly by default) to ensure synchronization with your devices. The Containers tab gives you a comprehensive view of your containerized applications.

<div class="screenshot-container">
  <img src="/images/services.png" alt="Containers Dashboard" class="screenshot" />
  <div class="screenshot-caption">The Containers dashboard showing all containers across devices</div>
</div>

### Key Features

The container management interface offers:

<FeatureGrid>
  <FeatureCard icon="🗂️" title="Unified view" description="Unified view of all containers across your infrastructure" />
  <FeatureCard icon="🔍" title="Filtering and sorting" description="Filtering and sorting to find specific containers" />
  <FeatureCard icon="⚡" title="Quick actions" description="Quick actions for common container operations" />
  <FeatureCard icon="ℹ️" title="Detailed information" description="Detailed information about each container" />
  <FeatureCard icon="📊" title="Logs and monitoring" description="Logs and monitoring for troubleshooting" />
  <FeatureCard icon="🔄" title="Force Refresh" description="Option to manually trigger a refresh of container statuses and check for available image updates." />
</FeatureGrid>

You can typically find a 'Force Refresh' button (often depicted in images like the one for Docker Image management below) to update the view and check for new image versions.

### Container Update Detection
SSM helps you keep your containers up-to-date. It can detect when a newer version of a container's image is available in its source registry. An 'Update available' tag or indicator (as seen in the Docker Networks/Volumes images below, for example) will be displayed next to the container.

The update detection mechanism primarily works by comparing semantic versioning (semver) strings, typically in the `MAJOR.MINOR.PATCH` format. SSM attempts to parse these versions strictly and includes a fallback to handle less standard versioning by focusing on the core segments.

This feature often relies on container labels, similar to systems like WhatsUpDocker. For detailed information on how labelling works and how to configure it for update detection, see the [Container Labelling Guide](/docs/reference/containers/labelling.md).

If your container images are stored in a private registry, ensure you have configured [private registry authentication](/docs/user-guides/settings/registry) in SSM settings to enable update checking for these images.

### Container Details

Click on a container to view detailed information:

TODO IMAGE

The details panel shows:

- **Configuration**: Environment variables, volumes, networks
- **Metadata**: Labels, container ID, creation time

## Managing Containers

### Container Actions

For each container, you can perform several actions:

<div class="screenshot-container">
  <img src="/images/services-services-overview.gif" alt="Container Actions" class="screenshot" />
  <div class="screenshot-caption">Performing actions on containers</div>
</div>

Available actions include:

| Action           | Description                                 |
|------------------|---------------------------------------------|
| **Start**        | Launch a stopped container                  |
| **Stop**         | Gracefully stop a running container         |
| **Restart**      | Stop and restart a container                |
| **Pause/Unpause**| Temporarily suspend container execution     |
| **Remove**       | Delete the container (optionally with volumes) |
| **View Logs**    | See container output and error logs         |
| **Inspect**      | View detailed container configuration       |

### Deploying New Containers

SSM offers several ways to deploy new containers:

1. **From Templates**: Use pre-configured container templates
2. **Custom Configuration**: Create containers with custom settings
3. **Docker Compose**: Deploy multi-container applications

#### Deploying from Templates

The easiest way to deploy a container is from the templates store:

1. Navigate to the Containers tab
2. Click "Deploy from Store"
3. Browse or search for a template
4. Configure the container settings
5. Click "Deploy"

<div class="screenshot-container">
  <img src="/images/services-deploy-store.png" alt="Deploy from Store" class="screenshot" />
  <div class="screenshot-caption">Deploying a container from the template store</div>
</div>

Learn more about [deploying from the store](/docs/user-guides/containers/deploy-store).


### Working with Networks and Volumes

SSM provides interfaces for managing Docker networks and volumes:

TODO IMAGE
<!--
<div class="screenshot-container">
  <img src="/images/services-services-3.png" alt="Docker Networks" class="screenshot" />
  <div class="screenshot-caption">Managing Docker networks</div>
</div>
-->

For networks, you can:
- Create custom networks
- Connect containers to networks
- View network details and connected containers
- Remove unused networks

TODO IMAGE
<!--
<div class="screenshot-container">
  <img src="/images/services-services-1.png" alt="Docker Volumes" class="screenshot" />
  <div class="screenshot-caption">Managing Docker volumes</div>
</div>
-->
For volumes, you can:
- Create new volumes
- Browse volume contents
- Back up volume data
- Remove unused volumes

## Container Stacks

For more complex applications with multiple containers, SSM provides the Container Stacks feature:

<div class="screenshot-container">
  <img src="/images/compose-compose-1.png" alt="Container Stacks" class="screenshot" />
  <div class="screenshot-caption">Managing container stacks</div>
</div>

Learn more about [using Container Stacks](/docs/user-guides/stacks/containers/editor).

## Troubleshooting Containers

| Issue Title                         | Symptoms                                                                | Solutions                                                                                                                                                           |
| :---------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container Fails to Start            | - Container status is Exited or Error<br>- No logs or error messages shown | - Check container logs for errors<br>- Verify image name and tag are correct<br>- Ensure required environment variables are set<br>- Check for port conflicts or missing volumes |
| Cannot Access Service in Container  | - Service not reachable at expected port<br>- Connection refused or timed out | - Check container port mappings<br>- Verify service is running inside the container<br>- Check firewall rules on host and container                                          |
| Container Uses Excessive Resources | - High CPU or memory usage<br>- Host system becomes slow or unresponsive    | - Limit resources using Docker Compose or container settings<br>- Monitor container stats and adjust limits as needed<br>- Restart or scale down containers if necessary      |