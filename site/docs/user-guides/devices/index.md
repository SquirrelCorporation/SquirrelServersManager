---
layout: FeatureGuideLayout
title: "Devices"
icon: "💻" # Computer icon
time: "5 min read"
signetColor: '#3a5ccc'
nextStep:
  icon: "➡️"
  title: "Next Topic"
  description: "Continue to the next relevant section."
  link: "#"
credits: true
---

<PageHeader title="Device Management Guide" icon="🖥️" time="Guide Overview" />

:::tip In a Nutshell (🌰)
- Learn how to add, configure, and manage devices in SSM
- Understand SSH, Docker, and Proxmox connectivity options
- Discover how to monitor device health and performance
- Master device diagnostics and troubleshooting techniques
- Get familiar with remote file management via SFTP
:::

## What Are Devices in SSM?

In Squirrel Servers Manager, a "device" represents any remote system you manage through the platform. This includes:

- Physical servers
- Virtual machines
- Cloud instances
- Development machines
- Edge devices like Raspberry Pi

SSM connects to these devices using SSH and can manage various aspects of their operation, from simple monitoring to full container orchestration.

## Device Management Guides

<div class="features-grid">
  <a href="/docs/user-guides/devices/adding-devices" class="feature-card">
    <div class="feature-icon">➕</div>
    <div class="feature-content">
      <h3>Adding Devices</h3>
      <p>Learn how to connect your servers and devices to SSM</p>
      <div class="feature-links">
        <a href="/docs/user-guides/devices/adding-devices">View guide</a>
      </div>
    </div>
  </a>
  
  <a href="/docs/user-guides/devices/management" class="feature-card">
    <div class="feature-icon">🔄</div>
    <div class="feature-content">
      <h3>Device Management</h3>
      <p>Monitor and control your connected devices</p>
      <div class="feature-links">
        <a href="/docs/user-guides/devices/management">View guide</a>
      </div>
    </div>
  </a>
  
  <a href="/docs/user-guides/devices/configuration/" class="feature-card">
    <div class="feature-icon">⚙️</div>
    <div class="feature-content">
      <h3>Device Configuration</h3>
      <p>Configure SSH, Docker, Proxmox and more</p>
      <div class="feature-links">
        <a href="/docs/user-guides/devices/configuration/">View guide</a>
      </div>
    </div>
  </a>
</div>

## Configuration Options

SSM provides several configuration options for devices:

| Configuration | Description | Guide |
|---------------|-------------|-------|
| **SSH** | Secure shell connection settings | [SSH Configuration](/docs/user-guides/devices/configuration/ssh) |
| **Docker** | Container management capabilities | [Docker Configuration](/docs/user-guides/devices/configuration/docker) |
| **Proxmox** | Proxmox VE integration | [Proxmox Configuration](/docs/user-guides/devices/configuration/proxmox) |
| **Diagnostic** | Monitoring and troubleshooting | [Diagnostic Options](/docs/user-guides/devices/configuration/diagnostic) |

## Device Capabilities

Devices in SSM can have different capabilities enabled:

- **Base Connectivity**: SSH access for basic management
- **Container Management**: Docker support for managing containers
- **VM Management**: Proxmox integration for virtual machines
- **File Operations**: File transfer via SFTP
- **Terminal Access**: Direct shell access through SSM
- **Monitoring**: System metrics and performance data
- **Automation**: Support for automated tasks and playbooks

## Next Steps

Ready to add your first device to SSM?

<a href="/docs/user-guides/devices/adding-devices" class="next-step-card">
  <div class="next-step-icon">➕</div>
  <h2>Adding Devices</h2>
  <div class="next-step-separator"></div>
  <p>Learn how to connect your servers and devices to SSM</p>
</a>