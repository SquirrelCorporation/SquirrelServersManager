# Device Data Model

<div class="quick-start-header">
  <div class="quick-start-icon">📊</div>
  <div class="quick-start-time">⏱️ Reading time: 5 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- Each device in SSM is represented by a DeviceItem data structure
- Devices contain information about capabilities, configuration, and system information
- The model includes authentication, network, and hardware details
- Understanding the device model helps when working with the API or creating plugins
:::

## Core Device Structure

The Device Data Model in SSM is represented by the `DeviceItem` interface, which contains all the information about a managed device.

```typescript
type DeviceItem = {
  uuid: string;
  capabilities: DeviceCapabilities;
  configuration: DeviceConfiguration;
  disabled?: boolean;
  hostname?: string;
  fqdn?: string;
  ip?: string;
  status: number;
  uptime?: number;
  systemInformation: DeviceSystemInformation;
  agentType?: string;
  agentVersion?: string;
  updatedAt?: string;
  createdAt?: string;
};
```

## Key Components

### Device Identification

Each device has these core identification properties:

- **UUID**: Unique identifier for the device
- **Hostname**: The device's hostname
- **FQDN**: Fully Qualified Domain Name (if available)
- **IP**: Main IP address
- **Status**: Current operational status
- **Uptime**: Time since the device was last started (in seconds)

### Device Capabilities

The capabilities field defines what features are available on the device:

```typescript
type DeviceCapabilities = {
  containers: {
    docker: {
      enabled: boolean;
    };
    proxmox: {
      enabled: boolean;
    };
    lxd: {
      enabled: boolean;
    };
  };
};
```

This structure allows SSM to know which container technologies are available on the device.

### Device Configuration

The configuration section defines how SSM interacts with the device:

```typescript
type DeviceConfiguration = {
  containers: {
    proxmox?: {
      watchContainersCron?: string;
    };
    docker?: {
      watchContainers?: boolean;
      watchContainersCron?: string;
      watchContainersStats?: boolean;
      watchContainersStatsCron?: string;
      watchEvents?: boolean;
      watchAll?: boolean;
    };
  };
  systemInformation?: SystemInformationConfiguration;
};
```

This includes settings for:
- Containers monitoring (Docker, Proxmox)
- System information collection schedules
- Cron expressions for scheduled tasks

### System Information

The systemInformation field contains hardware and software details:

```typescript
type DeviceSystemInformation = {
  system?: Systeminformation.SystemData;
  os?: Systeminformation.OsData;
  cpu?: Systeminformation.CpuData;
  mem?: Partial<Systeminformation.MemData>;
  networkInterfaces?: Systeminformation.NetworkInterfacesData[];
  versions?: Systeminformation.VersionData;
  usb?: Systeminformation.UsbData[];
  wifi?: Systeminformation.WifiInterfaceData[];
  bluetooth?: Systeminformation.BluetoothDeviceData[];
  graphics?: Systeminformation.GraphicsData;
  fileSystems?: Systeminformation.DiskLayoutData[];
};
```

This information allows SSM to display detailed hardware information and monitor system resources.

## Authentication Information

Device authentication is stored separately for security but is linked to the device model:

```typescript
type DeviceAuth = {
  authType: string;
  sshPort: number;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
  sshConnection?: SSHConnection;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
  proxmoxAuth?: ProxmoxAuth;
};
```

This includes SSH credentials and parameters for connecting to Docker and Proxmox services.

## Working with Device Data

When working with the Device model, there are several common operations you may need to perform:

### Getting Device Status

Devices have a numeric status code that represents their current state:

```typescript
// Example of interpreting device status
const isDeviceOnline = device.status === 1; // Online status
const isDeviceOffline = device.status === 0; // Offline status
```

### Checking Capabilities

Before performing operations, you should check if the device supports them:

```typescript
// Example of checking if Docker is enabled
const hasDocker = device.capabilities.containers.docker.enabled;

// Example of checking if Proxmox is enabled
const hasProxmox = device.capabilities.containers.proxmox.enabled;
```

## Next Steps

Now that you understand the Device Data Model, learn more about how to authenticate and connect to devices:

<a href="/docs/concepts/device-authentication" class="next-step-card">
  <div class="next-step-icon">🔑</div>
  <h2>Device Authentication</h2>
  <div class="next-step-separator"></div>
  <p>Understand how SSM securely connects to devices</p>
</a>