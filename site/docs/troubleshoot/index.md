---
layout: FeatureGuideLayout
title: "Troubleshooting Guide"
icon: 🛠️
time: 15 min read
signetColor: '#3a5ccc'
nextStep:
  icon: 🖥️
  title: Device Management
  description: Learn how to effectively manage your devices
  link: /docs/user-guides/devices/management
feedbackSupport: true
credits: true
---
<p align="center">
  <img src="/images/squirrels-squirrel-troubleshoot.png" alt="firsttime2" width="102.4" height="153.6">
</p>

:::tip In a Nutshell (🌰)
- Follow structured diagnostic approaches to identify issues quickly
- Check connection settings for device-related problems
- Verify Docker and container configurations for container issues
- Review playbook syntax and permissions for automation errors
- Use SSM's built-in diagnostic tools for troubleshooting
:::


## Diagnostic Process

<ProcessSteps
  :steps="[
    { title: 'Start', description: 'Begin troubleshooting your SSM issue.' },
    { title: 'What type of issue are you having?', description: 'Choose the category that best matches your problem.' },
    { title: 'SSM Installation Issues', description: 'Common symptoms: Install errors, MongoDB AVX issues. Solutions: See [Installation Guide](/docs/getting-started/installation), check prerequisites, review Docker logs.' },
    { title: 'Device Connectivity Issues', description: 'Common symptoms: SSH connection fails, device shows as offline. Solutions: See [Device Management](/docs/user-guides/devices/management), verify network connectivity, check SSH credentials.' },
    { title: 'Container/Docker Issues', description: 'Common symptoms: Containers won\'t start, socket hangup errors. Solutions: See [Container Management](/docs/user-guides/containers/management), check Docker permissions, review container logs.' },
    { title: 'Performance Issues', description: 'Common symptoms: Resource limits, database optimization. Solutions: See [Performance Optimization Tips](/docs/reference/docker-configuration#performance-optimization-tips).' }
  ]"
  />

When you encounter an issue with Squirrel Servers Manager, following a structured diagnostic process helps you identify and resolve problems efficiently:

1. **Identify the Symptom** - Determine the specific error or unexpected behavior
2. **Isolate the Component** - Pinpoint which component (device, container, playbook) is affected
3. **Check Logs** - Review relevant logs to find error messages
4. **Test Connectivity** - Verify network connections to affected components
5. **Apply Solution** - Implement the appropriate fix based on your findings
6. **Verify Resolution** - Confirm the issue has been resolved

## Decision Tree for Troubleshooting
<MentalModelDiagram 
  title="Troubleshooting Decision Tree" 
  imagePath="/images/troubleshooting-decision-tree-flow.svg" 
  altText="Decision Tree for Issue Resolution" 
  caption="Figure 2: Follow this decision tree to identify and resolve issues" 
/>

-----

# Common Issues and Solutions
## Device Connection Problems

If you're having trouble connecting to a device:

- **Symptom**: Device shows as offline or connections time out
- **Possible Causes**:
  - Incorrect SSH credentials
  - Firewall blocking connections
  - Network connectivity issues
  - SSH service not running on the device

**Solutions:**

1. Verify SSH credentials in SSM device configuration
2. Check firewall settings to ensure SSH port is open
3. Test direct SSH connection from SSM server to the device
4. Verify the SSH service is running on the target device

```bash
# Test SSH connection from command line
ssh user@device-ip -p port

# Check SSH service status on device
systemctl status sshd
```

## Docker Engine Connectivity

If SSM can't connect to Docker on a device:

- **Symptom**: Docker containers not visible or Docker operations fail
- **Possible Causes**:
  - Docker not installed or running
  - Docker API not exposed
  - TLS certificates issue
  - Docker socket permissions problem

**Solutions:**

1. Verify Docker is installed and running on the device:

```bash
docker --version
systemctl status docker
```

2. Check Docker socket permissions:

```bash
ls -la /var/run/docker.sock
```

3. For TLS connections, verify certificates are valid:

```bash
openssl x509 -text -in /path/to/cert.pem
```

4. If using TCP, ensure the Docker daemon is configured for remote access

## Container Management Issues

When containers can't be started, stopped, or managed:

- **Symptom**: Container operations fail with error messages
- **Possible Causes**:
  - Insufficient privileges
  - Resource constraints
  - Port conflicts
  - Volume mount issues

**Solutions:**

1. Check container logs for specific error messages:

```bash
docker logs container_name
```

2. Verify available resources (disk space, memory, CPU):

```bash
df -h
free -m
top
```

3. Check for port conflicts:

```bash
netstat -tulpn | grep PORT_NUMBER
```

4. Verify volume mount paths exist and have correct permissions

## Playbook Execution Failures

If playbooks fail to execute properly:

- **Symptom**: Playbook execution errors or unexpected results
- **Possible Causes**:
  - Syntax errors in playbook
  - Missing variables or inventory
  - Insufficient privileges on target hosts
  - Network connectivity issues

**Solutions:**

1. Check playbook syntax with ansible-playbook --syntax-check
2. Review any missing variables or incorrect inventory entries
3. Run playbook in verbose mode to see detailed execution:

```bash
ansible-playbook -vvv playbook.yml
```

4. Verify target hosts are reachable and credentials are correct


## Common Error Messages

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| `SSH connection failed: Connection refused` | SSH service not running or firewall blocking | Check SSH service, verify port, check firewall |
| `Error: connection error: desc = "transport: Error while dialing dial tcp: lookup [hostname] no such host"` | DNS resolution failure | Check hostname/IP configuration |
| `Error response from daemon: Get "https://registry-1.docker.io/v2/"` | Docker registry connectivity issue | Check internet connection, verify registry credentials |
| `Error: Unable to find image '[image]' locally` | Image not available | Pull image manually, check registry connectivity |
| `Error: Ansible inventory missing or invalid` | Incorrect inventory configuration | Verify inventory file format and host entries |

## Log Locations

<MentalModelDiagram 
  title="Log Locations" 
  imagePath="/images/troubleshooting-log-locations.svg" 
  altText="SSM Log Locations" 
  caption="Figure 3: Where to find logs for troubleshooting" 
/>

SSM logs are essential for troubleshooting. Here's where to find them:

- **SSM Server Logs**: `/var/log/ssm/server.log` or Docker container logs
- **Ansible Logs**: `/var/log/ssm/ansible/` or within SSM interface
- **Docker Container Logs**: Accessible via `docker logs container_name`
- **Client-side Logs**: Browser console or within SSM interface
- **Device Logs**: System logs on the managed devices (`/var/log/syslog`, `/var/log/messages`)

## Built-in Diagnostic Tools

SSM provides several built-in diagnostic tools that can help identify and resolve issues:

## Device Diagnostic Tool

1. Navigate to the device's configuration page
2. Click on the "Diagnostic" tab
3. Run the connection test to verify SSH connectivity
4. Check individual service tests (Docker, Proxmox, etc.)

## Network Connectivity Test

The network connectivity test can help identify network-related issues:

1. Access the device settings
2. Run the network diagnostic
3. Review results for any connection problems

## Docker Engine Diagnostic

For Docker-related issues:

1. Go to the device's Docker configuration
2. Run the Docker engine test
3. Check for connectivity, API version compatibility, and permissions

## Getting Support

When reporting an issue, include:

- Detailed description of the problem
- Steps to reproduce the issue
- Relevant logs and error messages
- SSM version and installation method
- Device information (OS, Docker version, etc.)

## Admin Password Recovery

If you are unable to log in as the administrator and need to reset your password, you can do so by accessing the MongoDB database directly:

```bash
# Connect to the MongoDB container
docker exec -it mongo-ssm mongosh

# Switch to the SSM database
use ssm

# Reset password (replace with your email)
db.users.updateOne(
  { email: "your.email@example.com" },
  { $set: { password: "$2b$10$CZt6MqBEVu8abVXel6mnn.A6AJuWlI8qKpPyTZ6TYWLm2jCr7HvdG" } }
)
```

This will reset the password to `Password123!`. Be sure to change it immediately after logging in.

## Related Resources

<FeatureGrid>
  <FeatureCard
    icon="🐳"
    title="Docker Configuration Guide"
    description="Reference for Docker integration and configuration"
    link="/docs/reference/docker-configuration"
  />
  <FeatureCard
    icon="🔑"
    title="SSH Configuration Guide"
    description="Reference for SSH setup and troubleshooting"
    link="/docs/reference/ssh-configuration"
  />
  <FeatureCard
    icon="📜"
    title="Ansible"
    description="Reference for Ansible integration and automation"
    link="/docs/reference/ansible/"
  />
  <FeatureCard
    icon="💻"
    title="Device Management"
    description="Guide to managing devices in SSM"
    link="/docs/user-guides/devices/management"
  />
</FeatureGrid>

