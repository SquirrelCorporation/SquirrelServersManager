---
layout: FeatureGuideLayout
title: "Ssh Configuration"
icon: "🔐" # Lock/security icon
time: "5 min read"
signetColor: '#23233e'
credits: true
---

:::tip In a Nutshell (🌰)
- SSH is the primary connection method for device management in SSM
- Three authentication methods are supported: password, SSH key, and password-less
- All credentials are securely encrypted in the database
- SSH connections enable terminal access, command execution, and container management
- Advanced options allow for custom port configuration and IPv4/IPv6 preferences
:::

## Overview

Secure Shell (SSH) is the foundation of SSM's agentless architecture, providing secure remote access to your devices. This reference guide covers all SSH configuration options and best practices for secure device management.

### SSH Connection Flow

<ProcessSteps :steps="[
  { icon: '🔑', title: 'Authentication Preparation', description: 'SSM retrieves encrypted credentials and prepares connection parameters' },
  { icon: '🔌', title: 'Connection Establishment', description: 'SSH handshake is initiated with the target device' },
  { icon: '🔒', title: 'Authentication', description: 'Credentials are verified using the configured authentication method' },
  { icon: '📡', title: 'Secure Channel', description: 'Encrypted communication channel is established' },
  { icon: '⚙️', title: 'Command Execution', description: 'Commands are executed through the secure channel' }
]" />
 
## SSH Authentication Methods

SSM supports three authentication methods for SSH connections:

<script setup>
const authDecisionTree = {
  type: 'question',
  question: 'Do you have SSH keys already set up?',
  options: [
    {
      label: 'Yes',
      next: {
        type: 'question',
        question: 'Is an SSH agent available?',
        options: [
          {
            label: 'Yes',
            next: {
              type: 'result',
              variant: 'success',
              title: 'Use Password-less Authentication',
              description: 'Simplest option when SSH agent is configured'
            }
          },
          {
            label: 'No',
            next: {
              type: 'result',
              variant: 'success',
              title: 'Use SSH Key Authentication',
              description: 'Most secure option for all environments'
            }
          }
        ]
      }
    },
    {
      label: 'No',
      next: {
        type: 'question',
        question: 'Is this a production environment?',
        options: [
          {
            label: 'Yes',
            next: {
              type: 'result',
              variant: 'warning',
              title: 'Generate and Use SSH Keys',
              description: 'Recommended for production security'
            }
          },
          {
            label: 'No',
            next: {
              type: 'result',
              variant: 'warning',
              title: 'Use Password Authentication',
              description: 'Quick setup for testing environments'
            }
          }
        ]
      }
    }
  ]
};
</script>
decision tree
<DecisionTree :tree="authDecisionTree" />

### 1. Password Authentication

The simplest method, using a username and password combination.

```yaml
authentication:
  type: UserPassword
  username: admin
  password: ********
```

**Advantages**:
- Simple to set up
- No key management required

**Disadvantages**:
- Less secure than key-based authentication
- Subject to brute force attacks
- Password rotation can be challenging

### 2. SSH Key Authentication

The most secure method, using public/private key pairs.

```yaml
authentication:
  type: KeyBased
  username: admin
  privateKey: |
    -----BEGIN RSA PRIVATE KEY-----
    MIIEpAIBAAKCAQEA1D9c9...
    -----END RSA PRIVATE KEY-----
  passphrase: optional_passphrase
```

**Advantages**:
- Significantly more secure than passwords
- No password transmission over the network
- Can be used with SSH agents for convenience

**Disadvantages**:
- Requires key management
- More complex initial setup

### 3. Password-less Authentication

Uses existing SSH configurations like SSH agent or host-based authentication.

```yaml
authentication:
  type: PasswordLess
  username: admin
```

**Advantages**:
- Convenient for environments with existing SSH infrastructure
- No credentials stored in SSM

**Disadvantages**:
- Requires pre-configured SSH environment
- Limited to specific use cases

## Connection Settings

### Basic Connection Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `host` | IP address or hostname of the device | Required | `192.168.1.100` |
| `port` | SSH port number | `22` | `2222` |
| `username` | SSH username | Required | `admin` |

### Advanced Connection Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `forceIPv4` | Force connection over IPv4 | `false` | `true` |
| `forceIPv6` | Force connection over IPv6 | `false` | `true` |
| `tryKeyboard` | Enable keyboard-interactive authentication | `true` | `true` |

## Security Considerations

### Credential Storage

All SSH credentials in SSM are:

1. **Encrypted at rest** using a secure vault service
2. **Never logged** in plain text
3. **Never exposed** in API responses

### Best Practices

::: tip 💡 Recommended Security Practices
- Use SSH key authentication whenever possible
- Implement key rotation policies
- Use dedicated SSH users with limited permissions
- Enable SSH key passphrase for additional security
- Disable password authentication on your servers when using key-based auth
:::

### Common Security Issues

| Issue Title         | Symptom(s)                                                                                                    | Solution(s)                                                                                                                                                           | Prevention(s)                                                                                                                               |
|---------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| Connection Issues   | - Cannot connect to SSH server<br>- Device shows as offline in the dashboard<br>- Cannot execute commands on the remote device | - Verify SSH service is running<br>- Check firewall settings and open port 22 (or your custom SSH port)<br>- Verify network connectivity with ping<br>- Check SSH credentials and configuration | - Configure SSH to start automatically on boot<br>- Use persistent SSH connection with keepalive settings<br>- Set up monitoring to alert on SSH service failures |
| Authentication Issues| - Authentication failed<br>- Permission denied errors                                                          | - Double-check username/password or SSH key<br>- Ensure correct key format and permissions<br>- If using a passphrase, only supported with paramiko connection method |                                                                                                                                             |
| Performance Issues  | - Long delays when connecting<br>- Connections drop unexpectedly<br>- Timeout errors during operations          | - Optimize SSH client settings (ServerAliveInterval, ControlMaster, etc.)<br>- Check network latency and packet loss<br>- Increase SSH connection timeout in .env file     |                                                                                                                                             |

::: warning ⚠️ Important
The SSH user must have permissions to access the Docker socket (typically by being in the 'docker' group)
:::

## Terminal Features

SSM's SSH implementation includes a full-featured terminal:

- **Real-time data streaming** for interactive sessions
- **Terminal resizing** to match your browser window
- **Session management** with automatic cleanup
- **Multi-client support** for collaborative sessions

## Platform-Specific Considerations

<PlatformNote icon="🐧" title="Linux">

**SSH Key Generation**
```bash
ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'
```

**Key Permissions**
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

**SSH Agent**
```bash
eval '$(ssh-agent -s)'
ssh-add ~/.ssh/id_rsa
```

</PlatformNote>

<PlatformNote icon="🍎" title="macOS">

**SSH Key Generation**
```bash
ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'
```

**SSH Agent (Automatic)**
macOS Sierra 10.12.2 or later automatically loads keys into SSH agent.
**SSH Agent (Manual)**
```bash
ssh-add -K ~/.ssh/id_rsa
```

**Keychain Integration**
```text
Host *
  UseKeychain yes
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_rsa
```
</PlatformNote>

<PlatformNote icon="🪟" title="Windows">

**SSH Key Generation (PowerShell)**
```bash
ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'
```

**SSH Agent Service**
Enable and start the SSH Agent service:
```bash
# In PowerShell as Administrator
Set-Service -Name ssh-agent -StartupType Automatic
Start-Service ssh-agent
```

**Add Key to Agent**
```bash
ssh-add $env:USERPROFILE\.ssh\id_rsa
```
**Alternative Tools**

Consider using PuTTY/PuTTYgen or Windows Subsystem for Linux (WSL) for more options.
</PlatformNote>

## Related Documentation

<FeatureGrid>
  <FeatureCard
    icon="💻"
    title="Device Management"
    description="Managing devices in SSM"
    link="/docs/user-guides/devices/management"
  />
  <FeatureCard
    icon="🐳"
    title="Docker Configuration"
    description="Configuring Docker access"
    link="/docs/reference/docker-configuration"
  />
  <FeatureCard
    icon="⚙️"
    title="Ansible Integration"
    description="How SSM uses Ansible with SSH"
    link="/docs/reference/ansible"
  />
</FeatureGrid>

