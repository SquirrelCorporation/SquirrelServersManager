<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
</script>

# Device Management

<div class="quick-start-header">
  <div class="quick-start-icon">🔧</div>
  <div class="quick-start-time">⏱️ Estimated time: 10 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- Access device details through the Devices panel
- Monitor health, performance, and system information
- Open SSH terminal for direct command-line access
- Configure Docker, Proxmox, and SSH settings
- Delete devices when they're no longer needed
:::

## Device Dashboard

After [adding a device](/docs/user-guides/devices/adding-devices), you'll be able to monitor and manage it through the Devices panel. This section shows all your connected devices, their status, and key metrics.

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Devices Dashboard]</div>
  <div class="screenshot-caption">The Devices dashboard showing connected servers</div>
</div>

### Device Status Indicators

Each device in the dashboard displays its current status:

| Status | Indicator | Description |
|--------|-----------|-------------|
| **Online** | <span style="color: green">●</span> Green | Device is connected and accessible |
| **Connecting** | <span style="color: orange">●</span> Orange | SSM is establishing connection |
| **Offline** | <span style="color: red">●</span> Red | Device is unreachable |
| **Unknown** | <span style="color: gray">●</span> Gray | Status cannot be determined |

## Device Information

Click on a device to view detailed information:

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Device Information Panel]</div>
  <div class="screenshot-caption">Detailed device information panel</div>
</div>

The device information panel provides:

- **System Information**: OS version, kernel, hostname
- **Hardware Details**: CPU, memory, disk usage
- **Network Configuration**: IP addresses, interfaces
- **Docker Status**: Version, running containers, images
- **Performance Metrics**: CPU load, memory usage, disk space

## Managing Devices

### Using SSH Terminal

You can access the device's command line directly through SSM's built-in SSH terminal:

1. Navigate to the device details page
2. Click the "SSH Terminal" button
3. Use the terminal as you would with any SSH client

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: SSH Terminal]</div>
  <div class="screenshot-caption">SSM's built-in SSH terminal</div>
</div>

The terminal provides:
- Full command-line access
- Command history
- Copy/paste functionality
- Custom terminal settings

### Device Configuration

You can modify a device's configuration after it's been added:

1. Navigate to the device details page
2. Click "Edit Configuration"
3. Modify the desired settings
4. Save your changes

Available configuration sections:

- [SSH Settings](/docs/user-guides/devices/configuration/ssh) - Authentication and connection options
- [Docker Configuration](/docs/user-guides/devices/configuration/docker) - Container management settings
- [Proxmox Settings](/docs/user-guides/devices/configuration/proxmox) - Proxmox VE integration
- [Diagnostic Options](/docs/user-guides/devices/configuration/diagnostic) - Monitoring and troubleshooting

### File Management with SFTP

SSM provides an SFTP interface for file management:

1. Navigate to the device details page
2. Click the "SFTP" button
3. Browse, upload, and download files through the interface

The SFTP browser allows you to:
- Navigate the device's file system
- Upload files from your local machine
- Download files to your local machine
- Create, rename, and delete files and directories
- Change file permissions

## Removing Devices

To remove a device from SSM:

1. Navigate to the Devices panel
2. Find the device you want to remove
3. Click the menu icon (⋮) and select "Delete Device"
4. Confirm the deletion

<div class="screenshot-container">
  <div class="screenshot-placeholder">[Screenshot: Delete Device Confirmation]</div>
  <div class="screenshot-caption">Device deletion confirmation</div>
</div>

:::warning
Deleting a device removes it from SSM but doesn't affect the device itself. Any containers or services running on the device will continue to run, but you'll no longer be able to manage them through SSM.
:::

## Next Steps

Now that you understand device management, you're ready to start working with containers:

<NextStepCard 
  icon="🐳" 
  title="Container Management" 
  description="Learn how to deploy and manage Docker containers on your devices" 
  link="/docs/user-guides/containers/management" 
/>
