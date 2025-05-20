---
layout: FeatureGuideLayout
title: "Device Configuration"
icon: 🛠️
time: 5 min read
signetColor: '#3a5ccc'
nextStep:
  icon: 🖥️
  title: SSH Configuration
  description: Learn how to configure SSH access for your devices
  link: /docs/user-guides/devices/configuration/ssh
feedbackSupport: true
credits: true
---

:::tip In a Nutshell (🌰)
- Squirrel Servers Manager provides a comprehensive configuration interface for your devices
- Configure SSH, Docker/Proxmox, and run diagnostics from a single location
- Customize connection settings to match your infrastructure requirements
- Set up automated watchers to monitor container health and performance
:::

## Overview

Device configuration is a central feature of Squirrel Servers Manager (SSM) that allows you to define how your server connects to devices and manages their resources. The configuration panel provides a unified interface to set up:

- SSH connection settings for secure remote access
- Docker or Proxmox integration for container management
- Diagnostic tools to verify connectivity and troubleshoot issues
- Advanced settings for customized deployments

<MentalModelDiagram 
  title="Device Configuration Overview" 
  imagePath="/images/device-configuration-device-model-diagram.svg" 
  altText="Device Configuration Architecture" 
  caption="Figure 1: Device configuration components in SSM" 
/>

## Accessing Device Configuration

You can access the configuration panel for any device directly from the inventory page by following these steps:

<ProcessSteps :steps="[
  { number: 1, title: 'Open Devices Page', description: 'Navigate to the Devices section in the main navigation.' },
  { number: 2, title: 'Locate Device', description: 'Find the device you want to configure in the inventory list.' },
  { number: 3, title: 'Access Configuration', description: 'Click on the ⚙️ (Configuration) button for your target device.' }
]" />

![device-configuration-device-configuration-1.png](/images/device-configuration-device-configuration-1.png)

## Configuration Tabs

The device configuration interface is organized into the following tabs:

<FeatureGrid>
  <FeatureCard 
    title="SSH" 
    description="Configure SSH connection settings, authentication methods, and privileged access." 
    icon="🔑" 
  />
  <FeatureCard 
    title="Containers" 
    description="Set up Docker or Proxmox integration, container monitoring, and automated watchers." 
    icon="🐳" 
  />
  <FeatureCard 
    title="Diagnostic" 
    description="Verify connection settings, test integrations, and troubleshoot configuration issues." 
    icon="🔍" 
  />
</FeatureGrid>

### SSH Tab

The SSH tab allows you to configure the secure connection between SSM and your device. This includes host information, authentication method, and privileged access settings.

![device-configuration-device-configuration-2.png](/images/device-configuration-device-configuration-2.png)

Key configuration options include:
- Host IP and port
- Authentication method (password, key-based, or passwordless)
- Sudo configuration for privileged operations

→ For detailed configuration instructions, see [SSH Configuration](./ssh).

### Containers Tab

The Containers tab enables you to configure Docker or Proxmox integration for container management and monitoring.

![device-configuration-device-configuration-3.png](/images/device-configuration-device-configuration-3.png)

Key configuration options include:
- Enable/disable container capability
- Configure automatic container monitoring
- Set up real-time container event tracking
- Define monitoring intervals for resource usage statistics

→ For Docker settings, see [Docker Configuration](./docker).
→ For Proxmox settings, see [Proxmox Configuration](./proxmox).

### Diagnostic Tab

The Diagnostic tab provides tools to verify your configuration and troubleshoot connection issues.

![device-configuration-device-configuration-4.png](/images/device-configuration-device-configuration-4.png)

Key diagnostic tools include:
- Connection tests for SSH, Docker, and Proxmox
- Detailed error reporting for failed connections
- Step-by-step verification of configuration requirements

→ For diagnostic information, see [Diagnostic Tools](./diagnostic).

## Advanced Configuration

Each configuration tab includes an "Advanced" section that provides additional options for specialized deployments. These settings allow for fine-grained control over:

- Custom Docker socket locations
- Non-standard authentication requirements
- Specialized monitoring configurations
- Alternative connection methods

![device-configuration-device-configuration-5.png](/images/device-configuration-device-configuration-5.png)

:::warning
Advanced settings should be modified with caution as they can impact the ability of SSM to communicate with your devices.
:::

## Configuration Best Practices

<RequirementsGrid :requirements="[
  { header: 'Testing', items: ['Periodically use the diagnostic tools to verify connections remain stable.'] },
  { header: 'Authentication', items: ['Prefer key-based authentication over passwords when possible.'] },
  { header: 'Monitoring', items: ['Balance monitoring frequency with resource usage—higher frequency provides more accurate data but increases load.'] },
  { header: 'Documentation', items: ['Keep a record of custom configurations, especially for advanced settings.'] }
]" />

## Troubleshooting

If you encounter issues with your device configuration:

1. Use the Diagnostic tab to identify specific connection problems
2. Verify network connectivity between SSM and your device
3. Check system logs on both SSM and the target device
4. Ensure required services (SSH, Docker) are running on the target device
5. Verify authentication credentials are correct and not expired

For persistent issues, see our comprehensive [Troubleshooting Guide](/docs/troubleshoot/).