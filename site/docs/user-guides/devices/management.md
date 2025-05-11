---
layout: FeatureGuideLayout
title: "Device Management"
icon: 🖥️
time: 15 min read
signetColor: '#3a5ccc'
credits: true
nextStep:
  title: "Adding a New Device"
  description: "Learn how to add new devices to SSM for management."
  link: "/docs/user-guides/devices/adding-devices"
---

# Mastering Device Management in SSM

Squirrel Servers Manager (SSM) provides a comprehensive suite of tools to monitor, access, configure, and manage all your connected devices from a centralized interface. This guide walks you through the key aspects of device management.

:::tip In a Nutshell (🌰)
- **Monitor**: Keep an eye on real-time device health, resource usage (CPU, memory, disk, network), and running processes.
- **Access**: Securely connect via SSH, browse files with SFTP, and manage Docker engines directly.
- **Actions**: Perform essential operations like reboot, shutdown, and rescan devices.
- **Configure**: Update device-specific settings including SSH credentials and Docker/Proxmox parameters.
- **Remove**: Safely decommission devices from SSM when no longer needed.
:::

## Monitoring Device Health and Performance

SSM offers a detailed dashboard for each managed device, providing real-time insights into its operational status and resource utilization.

To view device metrics:
1. Navigate to the **Devices** section from the main menu.

Key monitored metrics typically include:

<AdvantagesSection :advantagesData="[
  {
    icon: '💻',
    title: 'System Information',
    description: 'View OS version, uptime, and hostname at a glance.'
  },
  {
    icon: '🧮',
    title: 'CPU Usage',
    description: 'Monitor overall utilization, load averages, and per-core stats.'
  },
  {
    icon: '🧠',
    title: 'Memory Usage',
    description: 'Track total, used, and free memory, including swap.'
  },
  {
    icon: '💾',
    title: 'Disk Space',
    description: 'See usage for all mounted partitions.'
  },
  {
    icon: '🌐',
    title: 'Network Status',
    description: 'Check interface details, IPs, and real-time bandwidth.'
  },
  {
    icon: '📋',
    title: 'Running Processes',
    description: 'List active processes for diagnostics.'
  }
]" />


:::info
SSM often presents this data using interactive charts and auto-refreshing readouts, allowing you to spot trends or issues quickly.
:::

## Remote Access and Control

SSM facilitates secure remote access to your devices using several built-in tools:

### 1. SSH Terminal
   - **What it is**: A secure command-line interface to your device.
   - **How to access**: Typically, a "Terminal" or "SSH" button on the device dashboard in SSM.
   - **Use cases**: Executing commands, managing files, troubleshooting, and performing administrative tasks.

### 2. SFTP File Browser
   - **What it is**: A secure way to transfer and manage files between your local machine and the remote device.
   - **How to access**: Look for a "File Browser", "SFTP", or "Files" option within the device view in SSM.
   - **Use cases**: Uploading/downloading configuration files, application data, logs, etc.

### 3. Docker Management (if applicable)
   - **What it is**: If the device is configured as a Docker host, SSM provides tools to manage Docker containers, images, volumes, and networks directly on that device.
   - **How to access**: Under a "Containers" tab.
   - **Use cases**: Starting/stopping containers, viewing logs, inspecting configurations without leaving the SSM interface.

## Performing Device Actions

Beyond monitoring and remote access, SSM allows you to perform several essential actions on your devices directly from the interface:

- **Reboot Device**: Safely restart the operating system on the selected device.
- **Shutdown Device**: Power off the selected device.
- **Run Health Check**: Trigger a manual health check to verify connectivity and basic SSM agent functionality (if applicable).

These actions are usually found in an "Configuration" menu.

## Updating Device Configuration

After a device has been added to SSM, you might need to update its configuration details. This is typically done by navigating to the device's settings page within SSM.

Key configurations you can update include:

- **SSH Credentials**: Modify the SSH username, password, private key, or port if they change. See the [SSH Configuration Guide](/docs/user-guides/devices/configuration/ssh) for more details.
- **Docker Configuration**: Adjust Docker connection settings or related parameters. Refer to the [Docker Configuration Guide](/docs/user-guides/devices/configuration/docker) for specifics.
- **Proxmox Settings**: Update Proxmox API details or node information if SSM is managing Proxmox VE. See the [Proxmox Configuration Guide](/docs/user-guides/devices/configuration/proxmox) for guidance.

:::tip Always Test Connections
After updating any connection-related settings (like SSH credentials), use SSM's built-in test functionality to ensure connectivity before saving changes.
:::

