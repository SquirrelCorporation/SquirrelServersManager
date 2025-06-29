---
layout: FeatureGuideLayout
title: "SSH Configuration"
icon: 🔑
time: 10 min read
signetColor: '#3a5ccc'
nextStep:
  icon: 🐳
  title: Docker Configuration
  description: Learn how to configure Docker integration for your devices
  link: /docs/user-guides/devices/configuration/docker
credits: true
---

:::tip In a Nutshell (🌰)
- SSH is the primary secure connection method for managing devices in SSM
- Three authentication methods available: password, SSH key, and passwordless
- Credentials are securely encrypted using Ansible Vault (AES-256)
- Properly configured SSH enables terminal access, container management, and automation
- Advanced settings allow customization for specific network environments
:::

## Overview

Secure Shell (SSH) is the foundation of SSM's agentless architecture, providing secure remote access to your devices without requiring additional software installation. This guide covers all SSH configuration options within the SSM interface.

## SSH Configuration Interface

The SSH configuration tab in the device settings provides all options needed to establish a secure connection to your device.

![device-configuration-device-configuration-2.png](/images/device-configuration-device-configuration-2.png)

<ProcessSteps :steps="[
  { number: 1, title: 'Access Device Configuration', description: 'From the Devices page, click on the ⚙️ Configuration button for your device.' },
  { number: 2, title: 'Navigate to SSH Tab', description: 'Select the SSH tab in the configuration panel (this is the default tab).' },
  { number: 3, title: 'Configure Connection Settings', description: 'Enter host information, authentication details, and optional advanced settings.' },
  { number: 4, title: 'Test Connection', description: 'Use the Diagnostic tab to verify your connection settings before saving.' }
]" />

## Host Configuration

The Host section defines the basic connection parameters needed to reach your device on the network.



| Parameter | Required | Description |
|-----------|:--------:|-------------|
| **Device IP** | ⚠️ | The IPv4 address or hostname of the device. Must be reachable from the SSM instance. |
| **SSH Port** | ⚠️ | The SSH port number for the device. Default is `22`, but can be customized for security. |


:::warning Important
Ensure your network configuration allows SSH traffic between the SSM server and your device. This may require firewall configuration on both ends.
:::

## Super User Configuration

The Super User section defines how SSM gains elevated privileges on the remote device when needed for operations like Docker management or system configuration.


| Parameter | Required | Description |
|-----------|:--------:|-------------|
| **Sudo Method** | ⚠️ | The command used for privilege escalation. Almost always `sudo` on Linux systems. |
| **Sudo User** | ⭕ | The username to switch to when elevation is needed. Optional if the main user has sudo access. |
| **Sudo Password** | ⭕ | The password for the sudo user, if required. Many systems are configured for passwordless sudo. |


:::tip
If your system uses passwordless sudo (common for many Linux distributions), you can leave the Sudo Password field empty.
:::

## Authentication Methods

SSM supports three methods for authenticating with your devices. Choose the most appropriate option based on your security requirements and environment.


<FeatureGrid>
  <FeatureCard 
    title="Password Authentication" 
    description="Simple username and password authentication. Quick to set up but less secure for production environments." 
  />
  <FeatureCard 
    title="SSH Key Authentication" 
    description="Public/private key authentication. The most secure option and recommended for production use." 
  />
  <FeatureCard 
    title="Passwordless Authentication" 
    description="Uses existing SSH agent or host-based authentication. Convenient for development environments." 
  />
</FeatureGrid>

### 1. Password Authentication

Password authentication is the simplest method, requiring just a username and password.

![technical-guide-ssh-ssh-password.png](/images/technical-guide-ssh-ssh-password.png)

#### Configuration Steps:
1. Select **User/Password** as the SSH Connection Type
2. Enter the **Username** for the SSH account
3. Enter the **Password** for the SSH account

:::warning Security Note
Password authentication is more vulnerable to brute force attacks. Consider using key-based authentication for production environments.
:::

### 2. SSH Key Authentication

SSH key authentication is more secure and uses a cryptographic key pair instead of a password.

![technical-guide-ssh-ssh-key.png](/images/technical-guide-ssh-ssh-key.png)

#### Configuration Steps:
1. Select **Keys** as the SSH Connection Type
2. Enter the **Username** for the SSH account
3. Paste your **Private Key** in PEM format
4. Optionally enter a **Passphrase** if your key is protected

#### Linux

Generate an SSH key pair:
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Copy public key to your device:
```bash
ssh-copy-id username@device-ip
```

#### Windows

Generate an SSH key pair (PowerShell):
```powershell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Copy public key to your device (manually or using SSH tools)

### 3. Passwordless Authentication

Passwordless authentication relies on your system's SSH agent or host-based authentication and requires no credentials to be stored in SSM.

#### Configuration Steps:
1. Select **Passwordless** as the SSH Connection Type
2. Enter the **Username** for the SSH account

:::tip
This method requires that your SSH environment is already configured with the appropriate trust relationships between the SSM server and your device.
:::

## Advanced Settings

For non-standard environments or specific requirements, SSM provides advanced SSH configuration options.

![device-configuration-ssh-advanced-1.png](/images/device-configuration-ssh-advanced-1.png)


| Setting | Description | Default |
|---------|-------------|:-------:|
| **Force IPv4/IPv6** | Force a specific IP protocol version | Disabled |
| **Ansible Connection** | Custom connection method | 'smart' |
| **Ansible Port** | Custom port for Ansible connections | Same as SSH port |
| **Ansible Become** | Advanced privilege escalation | Disabled |
| **Ansible Become Method** | Method for privilege escalation | 'sudo' |


:::tip
Most users do not need to modify the advanced settings. These options are primarily for specialized environments or troubleshooting specific issues.
:::

## Testing Your Connection

After configuring SSH settings, you should always test the connection before saving.

<ProcessSteps :steps="[
  { number: 1, title: 'Go to Diagnostic Tab', description: 'Switch to the Diagnostic tab in the device configuration panel.' },
  { number: 2, title: 'Run Basic Test', description: 'Click Basic Test to verify basic SSH connectivity.' },
  { number: 3, title: 'Run Advanced Test', description: 'For more detailed diagnostics, click Advanced Test.' },
  { number: 4, title: 'Review Results', description: 'Check the test results and fix any issues before saving.' }
]" />

![device-configuration-device-configuration-4.png](/images/device-configuration-device-configuration-4.png)

## Troubleshooting

If you encounter issues with your SSH configuration, try these common solutions:

| Problem | Possible Solution |
|---------|------------------|
| **Connection Refused** | • Verify SSH service is running on the device<br>• Check firewall settings on both SSM server and device<br>• Verify the SSH port configuration |
| **Authentication Failed** | • Double-check username and password<br>• Verify SSH key format and permissions<br>• Ensure the user has SSH access on the device |
| **Permission Denied** | • Verify sudo permissions for the user<br>• Check if the user is in required groups (docker, sudo)<br>• Ensure proper file permissions for SSH keys |
| **Connection Timeout** | • Verify network connectivity between SSM and the device<br>• Check for network restrictions or VPN issues<br>• Ensure the device IP is correct |

For more comprehensive diagnostic information, see the [Diagnostic Tools](./diagnostic.md) documentation.

## Security Best Practices

To maintain the highest level of security for your SSH connections:

<FeatureGrid>
  <FeatureCard 
    title="Use SSH Keys" 
    description="Prefer SSH key authentication over passwords whenever possible" 
    icon="🔐" 
  />
  <FeatureCard 
    title="Key Rotation" 
    description="Implement regular key rotation for production environments" 
    icon="🔄" 
  />
  <FeatureCard 
    title="Dedicated Users" 
    description="Create specific users for SSM with appropriate permissions" 
    icon="👤" 
  />
  <FeatureCard 
    title="Minimal Privileges" 
    description="Apply the principle of least privilege to SSH accounts" 
    icon="🛡️" 
  />
</FeatureGrid>

## Related Documentation

<FeatureGrid>
  <FeatureCard
    icon="🔗"
    title="Technical Guide: SSH Connection"
    description="Detailed technical information about SSH implementation"
    link="/docs/technical-guide/ssh"
  />
  <FeatureCard
    icon="🔑"
    title="SSH Configuration Reference"
    description="Complete reference guide for all SSH options"
    link="/docs/reference/ssh-configuration"
  />
  <FeatureCard
    icon="📜"
    title="Ansible Connection Guide"
    description="How SSM uses Ansible with SSH"
    link="/docs/reference/ansible/"
  />
</FeatureGrid>
