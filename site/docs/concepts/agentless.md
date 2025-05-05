# Agentless Architecture

<div class="quick-start-header">
  <div class="quick-start-icon">🔌</div>
  <div class="quick-start-time">⏱️ Reading time: 7 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- SSM uses SSH for communication with managed devices
- No permanent agent software runs on target devices
- Connections are made only when needed for specific operations
- Benefits include lower resource usage, simpler setup, and reduced attack surface
- Commands are executed with appropriate permissions via sudo when required
:::

## What is Agentless Architecture?

Squirrel Servers Manager (SSM) is designed with an agentless architecture, which means it doesn't require permanent software agents installed on the devices it manages. Instead, SSM communicates with devices through secure SSH connections, executing commands remotely when needed.

<div class="architecture-diagram">
  <img src="/overview/reference-architecture.svg" alt="Agentless Architecture Diagram" />
  <div class="diagram-caption">Figure 1: SSM's agentless connection model</div>
</div>

### Key Advantages

The agentless approach offers several significant benefits:

#### 1. Simplified Deployment

Without agents to install and maintain, adding new devices to SSM is straightforward:
- No pre-installation steps on target devices
- No agent software to update or troubleshoot
- No compatibility issues with different OS versions
- Faster onboarding of new devices

#### 2. Reduced System Footprint

Agentless operation means minimal impact on your managed devices:
- No continuous resource consumption
- No background processes running permanently
- No disk space used for agent software
- Lower memory and CPU overhead

#### 3. Enhanced Security

The agentless architecture improves security in several ways:
- Fewer installed components means a smaller attack surface
- No need to maintain and patch agent software
- Secure SSH communication with key-based authentication
- No persistent connections that could be exploited

#### 4. Streamlined Maintenance

Without agents, there's less to maintain over time:
- No agent updates to deploy across your infrastructure
- No version compatibility issues to manage
- Simpler troubleshooting when issues arise
- Less complexity in the overall system

## How Agentless Architecture Works

SSM's agentless architecture relies on secure SSH connections to manage devices:

1. **Authentication**: SSM connects to devices using SSH with password or key-based authentication
2. **Command Execution**: Commands are executed remotely over SSH
3. **Data Collection**: System information is gathered through standard Linux/Unix commands
4. **Container Management**: Docker operations are performed via the Docker API or command line
5. **Configuration Management**: Ansible is used for more complex configuration tasks

### Technologies Behind Agentless Operation

SSM leverages several key technologies to enable its agentless architecture:

- **SSH**: Secure Shell protocol for secure remote access
- **Ansible**: Agentless automation platform for configuration management
- **Docker API**: Remote Docker management through the Docker daemon API
- **Standard *nix Tools**: Leveraging common utilities available on Linux/Unix systems

## Agentless vs. Agent-Based Approaches

To understand the advantages of SSM's approach, it's helpful to compare agentless and agent-based architectures:

| Feature | Agentless (SSM) | Agent-Based |
|---------|----------------|-------------|
| **Installation** | SSH access only | Agent software installation required |
| **Resource Usage** | Minimal, only when actively used | Continuous, agents always running |
| **Maintenance** | No agent updates needed | Regular agent updates required |
| **Security** | Smaller attack surface | Larger potential attack surface |
| **Compatibility** | Works with any SSH-accessible system | May have OS compatibility limitations |
| **Scalability** | Good for small to medium deployments | May scale better for very large deployments |
| **Offline Operation** | Requires network connectivity | Some operations may work offline |

## Legacy Agent Support

While SSM has transitioned to an agentless architecture, it maintains legacy support for older agent-based approaches:

- **Node Agent**: A Node.js-based agent (deprecated)
- **Dockerized Agent**: An agent running in a Docker container (deprecated)

These legacy options are maintained for backward compatibility but are not recommended for new deployments.

## Best Practices for Agentless Management

To get the most out of SSM's agentless architecture:

1. **Use Key-Based Authentication**: More secure than password-based
2. **Implement Proper SSH Security**: Configure SSH securely on all devices
3. **Manage Permissions Carefully**: Use the principle of least privilege
4. **Regular Credential Rotation**: Change SSH keys and passwords periodically
5. **Network Security**: Ensure SSH access is properly secured at the network level

## Next Steps

Now that you understand SSM's agentless architecture, learn more about:

<a href="/docs/concepts/security" class="next-step-card">
  <div class="next-step-icon">🔒</div>
  <h2>Security Model</h2>
  <div class="next-step-separator"></div>
  <p>Understand how SSM secures communication with devices</p>
</a>