<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import SectionHeader from '/components/SectionHeader.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Adding Devices" 
  icon="🖥️" 
  time="Estimated time: 5-10 minutes" 
/>

:::tip 🌰 In a Nutshell
- Navigate to the Inventory screen and click "Install Agent on New Device"
- Enter SSH connection info (hostname/IP, port, authentication)
- Configure sudo settings if needed for elevated permissions
- Run connection tests to verify connectivity
- Select the agentless installation method (recommended)
- Confirm details and complete the device setup
:::

## Prerequisites

Before adding a device to SSM, ensure:

- You have SSH access to the target device
- The device meets the [system requirements](/docs/requirements)
- You have valid credentials (password or SSH key)
- If using key-based authentication, your private key is accessible
- For Docker management, Docker is installed on the target device

## Step-by-Step Guide

### 1. Open the Inventory Panel

Navigate to the Inventory panel in the Configuration Section on the left sidebar and click "Install Agent on New Device".

<div class="screenshot-container">
  <img src="/add-device/add-device-1.png" alt="SSM Inventory Panel" class="screenshot" />
  <div class="screenshot-caption">The Inventory panel with Add Device button</div>
</div>

### 2. Configure SSH Connection

In the modal that appears, enter the SSH connection information:

<div class="screenshot-container">
  <img src="/add-device/add-device-2.png" alt="SSH Connection Screen" class="screenshot" />
  <div class="screenshot-caption">SSH connection configuration screen</div>
</div>

Fill in the following details:
- **Hostname/IP**: The IP address or hostname of your device
- **SSH Port**: Usually 22 (default) unless configured otherwise
- **Authentication Method**: Choose either password or key-based
- **Username**: SSH username with appropriate permissions
- **Password/Key**: Enter password or select your private key file

#### Sudo Configuration

If your user requires sudo for elevated permissions:
- Select the appropriate sudo method (with or without password)
- Provide sudo password if required
- Specify custom sudo user if needed

### 3. Run Connection Tests

SSM will automatically test the connection using your provided details.

<div class="screenshot-container">
  <img src="/add-device/add-device-6.png" alt="Connection Tests" class="screenshot" />
  <div class="screenshot-caption">SSM connection test results</div>
</div>

Wait for the tests to complete and address any issues that arise. Successful tests will show green checkmarks.

### 4. Choose Installation Method

Select the preferred installation method. We recommend using the default Agentless method.

<div class="screenshot-container">
  <img src="/add-device/add-device-7.png" alt="Installation Method" class="screenshot" />
  <div class="screenshot-caption">Device installation method selection</div>
</div>

| Method | Description | Recommended For |
|--------|-------------|----------------|
| **Agentless (Default)** | Uses SSH for all operations without installing an agent | Most deployments; simplest setup |
| *Node Agent (Deprecated)* | Installs Node.js agent on the device | Legacy deployments only |
| *Node Agent - Enhanced (Deprecated)* | Installs Node.js agent with advanced playbook | Legacy deployments only |
| *Dockerized Agent (Deprecated)* | Runs agent in Docker container | Legacy deployments only |

### 5. Review and Confirm

Verify all information is correct on the confirmation screen.

<div class="screenshot-container">
  <img src="/add-device/add-device-4.png" alt="Confirmation Screen" class="screenshot" />
  <div class="screenshot-caption">Device configuration confirmation screen</div>
</div>

Click **"Confirm"** to add the device to SSM.

## Advanced Configuration

After adding your device, you can configure additional features:

- [SSH Advanced Configuration](/docs/user-guides/devices/configuration/ssh) - Configure key management and connection options
- [Docker Configuration](/docs/user-guides/devices/configuration/docker) - Set up container management capabilities
- [Proxmox Configuration](/docs/user-guides/devices/configuration/proxmox) - Enable Proxmox integration if available
- [Diagnostic Settings](/docs/user-guides/devices/configuration/diagnostic) - Configure monitoring and diagnostics

## Troubleshooting

If you encounter issues during device setup:

<details>
<summary>SSH Connection Failure</summary>

**Problem**: SSM can't establish SSH connection to your device.

**Solutions**:
1. Verify IP address/hostname is correct
2. Confirm SSH service is running on the device
3. Check if firewall is blocking port 22 (or your custom SSH port)
4. Ensure credentials are correct

**Verification Command**:
```bash
# Test SSH connection from your local machine
ssh username@device_ip -p port
```
</details>

<details>
<summary>Sudo Permission Issues</summary>

**Problem**: SSM can connect but fails when using sudo commands.

**Solutions**:
1. Verify sudo password is correct
2. Check that user has sudo privileges on the device
3. Confirm sudo configuration doesn't require tty
4. Try using a different sudo method in the configuration

**Modify sudoers if needed**:
```bash
# Add this line to /etc/sudoers to allow passwordless sudo for specific commands
username ALL=(ALL) NOPASSWD: /usr/bin/docker,/usr/bin/docker-compose
```
</details>

<details>
<summary>Docker Connection Failure</summary>

**Problem**: SSM connects via SSH but can't communicate with Docker.

**Solutions**:
1. Verify Docker is installed on the device
2. Ensure your user has permission to access Docker
3. Check Docker socket permissions
4. Configure Docker to listen on TCP if needed

**Add user to Docker group**:
```bash
sudo usermod -aG docker username
```
</details>

## Next Steps

After adding your first device, you'll need to manage its configuration and deploy containers:

<NextStepCard 
  icon="🔧" 
  title="Device Management" 
  description="Learn how to configure, monitor, and manage your devices" 
  link="/docs/user-guides/devices/management" 
/>
