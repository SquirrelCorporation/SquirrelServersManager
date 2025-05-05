<script setup>
import DeviceModelDiagram from '/components/DeviceModelDiagram.vue';
import NextStepCard from '/components/NextStepCard.vue';
</script>

# Device Mental Model

:::tip 🌰 In a Nutshell
- Devices are the core entities in SSM representing physical or virtual servers
- Each device connects via SSH and optionally manages Docker containers
- Devices maintain their own configuration, metrics, and connection status
- The agentless architecture means no software installation is required on target servers
:::

## What is a Device?

In Squirrel Servers Manager, a **Device** represents any server, virtual machine, or computing resource that you want to manage. Devices are the fundamental building blocks of your infrastructure and serve as the connection point for all management operations.

Unlike traditional management systems that require agent software to be installed on each server, SSM uses an **agentless architecture** that connects to your devices using standard protocols like SSH and the Docker API.

## Device Data Model

The device data model consists of several key components that define its identity, connection methods, and capabilities:

<div class="concept-diagram">
  <img src="/home/device-info.png" alt="Device Data Model Diagram" class="screenshot" />
  <div class="diagram-caption">Figure 1: The Device Data Model in SSM</div>
</div>

### Core Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier for the device |
| `name` | String | Human-readable name for the device |
| `ip` | String | IP address or hostname for connecting to the device |
| `status` | Enum | Current connection status (online, offline, error) |
| `type` | Enum | Device type (server, VM, container, etc.) |
| `os` | Object | Operating system information (name, version, etc.) |
| `tags` | Array | User-defined tags for organizing devices |

### Connection Configuration

Each device maintains configuration for how SSM connects to and interacts with it:

#### SSH Configuration

```json
{
  "host": "192.168.1.100",
  "port": 22,
  "username": "admin",
  "authMethod": "key", // or "password"
  "password": "", // stored encrypted
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n...", // stored encrypted
  "passphrase": "", // stored encrypted
  "sudo": true // whether to use sudo for privileged operations
}
```

#### Docker Configuration

```json
{
  "enabled": true,
  "version": "20.10.12",
  "socketPath": "/var/run/docker.sock", // for Unix socket connections
  "tcpEndpoint": "tcp://192.168.1.100:2375", // for TCP connections
  "tlsVerify": true,
  "certPath": "/path/to/certs" // for TLS connections
}
```

## Device Lifecycle

Devices in SSM follow a specific lifecycle from creation to deletion:

1. **Creation**: A device is added to SSM with basic connection information
2. **Connection**: SSM establishes an SSH connection to the device
3. **Discovery**: System information and capabilities are detected
4. **Configuration**: Additional settings like Docker access are configured
5. **Monitoring**: The device is continuously monitored for status and metrics
6. **Management**: Operations like container deployment are performed
7. **Deletion**: The device is removed from SSM (with no impact on the actual server)

## Connection Methods

SSM supports multiple connection methods to devices:

### SSH Connection

The primary connection method is SSH, which provides secure access to the device's shell. SSM supports both password and key-based authentication:

<div class="concept-diagram">
  <img src="/home/new-device.png" alt="Device Connection Flow" class="screenshot" />
  <div class="diagram-caption">Figure 2: SSH Connection Flow in SSM</div>
</div>

#### Connection Process

1. **Authentication Preparation**:
   - SSM prepares the SSH connection parameters (host, port, username)
   - Authentication credentials are retrieved from the encrypted storage
   - For key-based auth: private key and optional passphrase are loaded
   - For password auth: password is decrypted for use

2. **Connection Establishment**:
   - SSH handshake is initiated with the target device
   - Server and client exchange encryption capabilities
   - Authentication method is negotiated
   - Credentials are verified by the target device

3. **Session Management**:
   - Upon successful authentication, a secure session is established
   - The session is maintained for subsequent operations
   - Commands are executed through this secure channel
   - Results are returned to SSM through the same channel

4. **Privilege Escalation (if needed)**:
   - For operations requiring elevated privileges, sudo is used
   - SSM can be configured with sudo password or passwordless sudo
   - Privilege escalation method can be customized (sudo, su, etc.)

### Docker API Connection

For container management, SSM connects to the Docker API on the device. This can be done through:

<div class="concept-diagram">
  <img src="/home/dashboard.png" alt="Docker Connection Dashboard" class="screenshot" />
  <div class="diagram-caption">Figure 3: Docker Management in SSM</div>
</div>

#### Docker Connection Methods

1. **Unix Socket (via SSH)**:
   - Most common and secure method
   - SSM connects to the device via SSH
   - Commands are executed to interact with Docker through its Unix socket (`/var/run/docker.sock`)
   - Requires SSH user to have access to the Docker socket (typically via docker group membership)
   - Example configuration:
     ```json
     {
       "socketPath": "/var/run/docker.sock",
       "enabled": true
     }
     ```

2. **TCP Connection**:
   - Direct connection to Docker daemon exposed over TCP
   - Typically used when SSH access is not available
   - Less secure unless TLS encryption is used
   - Requires Docker daemon to be configured to listen on a TCP port
   - Example configuration:
     ```json
     {
       "tcpEndpoint": "tcp://192.168.1.100:2375",
       "enabled": true
     }
     ```

3. **TLS Connection**:
   - Secure TCP connection with certificate authentication
   - Provides encryption and authentication
   - Requires proper certificate setup on both SSM and Docker host
   - Example configuration:
     ```json
     {
       "tcpEndpoint": "tcp://192.168.1.100:2376",
       "tlsVerify": true,
       "certPath": "/path/to/certs",
       "enabled": true
     }
     ```

#### Docker API Operations

Once connected, SSM can perform various operations through the Docker API:

- **Container Management**: Create, start, stop, restart, remove containers
- **Image Management**: Pull, list, remove images
- **Volume Management**: Create, list, remove volumes
- **Network Management**: Create, list, remove networks
- **System Information**: Get Docker version, system info, disk usage
- **Events**: Monitor Docker events in real-time
- **Logs**: Access container logs
- **Stats**: Monitor container resource usage

## Device Operations

Devices support various operations:

### Basic Operations

- **Ping**: Check if the device is reachable
- **Connect**: Establish an SSH connection
- **Disconnect**: Close the SSH connection
- **Reboot**: Restart the device
- **Shutdown**: Power off the device

### Management Operations

- **Execute Command**: Run a shell command on the device
- **Transfer File**: Upload or download files
- **Install Package**: Install software packages
- **Update System**: Apply system updates

### Container Operations

- **List Containers**: View all containers on the device
- **Deploy Container**: Create and start a new container
- **Manage Container**: Start, stop, restart, or remove containers
- **View Logs**: Access container logs
- **Update Container**: Update container configuration or image

## Device Metrics

SSM collects and displays various metrics from devices:

- **System Metrics**: CPU, memory, disk usage, network traffic
- **Process Metrics**: Running processes, resource usage
- **Container Metrics**: Container-specific resource usage
- **Service Metrics**: Status of system services
- **Update Status**: Available system and package updates

## Security Considerations

Device management involves several security considerations:

1. **Credential Storage**: SSH credentials are encrypted in the database
2. **Least Privilege**: Use accounts with minimal required permissions
3. **Key Authentication**: Prefer SSH key authentication over passwords
4. **Connection Security**: All connections are encrypted using SSH or TLS
5. **Audit Logging**: All device operations are logged for accountability

## Best Practices

For optimal device management:

1. **Use Descriptive Names**: Give devices clear, meaningful names
2. **Apply Tags**: Use tags to organize devices by function, environment, etc.
3. **Group Related Devices**: Create logical groups for batch operations
4. **Regular Testing**: Periodically verify connection settings
5. **Monitor Status**: Set up alerts for device status changes
6. **Backup Configurations**: Export device configurations regularly
7. **Use SSH Keys**: Prefer key-based authentication over passwords

## Device Types Comparison

SSM supports various types of devices, each with its own capabilities and use cases:

| Feature | Standard Linux Server | Docker Host | Proxmox Host | Unmanaged Device |
|---------|----------------------|-------------|--------------|------------------|
| **SSH Access** | ✅ Required | ✅ Required | ✅ Required | ❌ Optional |
| **Container Management** | ❌ No | ✅ Yes (Docker) | ✅ Yes (LXC) | ❌ No |
| **VM Management** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **System Metrics** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Limited |
| **Command Execution** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **File Transfer** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Playbook Execution** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Automation Support** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Limited |
| **Typical Use Case** | General-purpose servers | Container workloads | Virtualization hosts | Monitoring-only devices |

### Real-World Examples

#### Standard Linux Server

```json
{
  "ip": "192.168.1.100",
  "hostname": "web-server-01",
  "status": 1, // online
  "capabilities": {
    "containers": {
      "docker": {
        "enabled": false
      }
    }
  },
  "systemInformation": {
    "os": {
      "platform": "linux",
      "distro": "Ubuntu",
      "release": "22.04"
    }
  }
}
```

#### Docker Host

```json
{
  "ip": "192.168.1.101",
  "hostname": "docker-host-01",
  "status": 1, // online
  "capabilities": {
    "containers": {
      "docker": {
        "enabled": true
      }
    }
  },
  "dockerVersion": "20.10.12",
  "systemInformation": {
    "os": {
      "platform": "linux",
      "distro": "Debian",
      "release": "11"
    }
  },
  "configuration": {
    "containers": {
      "docker": {
        "watchContainers": true,
        "watchContainersCron": "*/5 * * * *",
        "watchContainersStats": true,
        "watchContainersStatsCron": "*/10 * * * *"
      }
    }
  }
}
```

#### Proxmox Host

```json
{
  "ip": "192.168.1.102",
  "hostname": "proxmox-host-01",
  "status": 1, // online
  "capabilities": {
    "containers": {
      "proxmox": {
        "enabled": true
      },
      "docker": {
        "enabled": false
      }
    }
  },
  "systemInformation": {
    "os": {
      "platform": "linux",
      "distro": "Debian",
      "release": "11"
    }
  },
  "configuration": {
    "containers": {
      "proxmox": {
        "watchContainersCron": "*/15 * * * *"
      }
    }
  }
}
```

## Technical Implementation

Under the hood, SSM uses several technologies to manage devices:

1. **Node.js SSH2**: For establishing secure SSH connections
2. **Dockerode**: For interacting with the Docker API
3. **Ansible Core**: For executing playbooks and automation
4. **Prometheus**: For collecting and storing metrics
5. **Proxmox API**: For interacting with Proxmox hosts

## Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Connection Timeout | Network issue or firewall | Check network connectivity and firewall rules |
| Authentication Failed | Incorrect credentials | Verify username, password, or SSH key |
| Permission Denied | Insufficient privileges | Ensure the user has appropriate permissions |
| Docker Connection Failed | Docker not running or not accessible | Check Docker daemon status and socket permissions |
| High Resource Usage | Resource-intensive operations | Monitor and optimize resource-intensive tasks |

<NextStepCard 
  title="Container Management" 
  description="Learn how to deploy and manage containers on your devices" 
  link="/docs/concepts/models/containers" 
/>
