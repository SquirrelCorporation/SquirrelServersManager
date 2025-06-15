# Why I Built SquirrelServersManager: From Homelab Chaos to Orchestrated Harmony

*The story of how managing 12 Raspberry Pis drove me to create an open-source server management platform that now helps thousands of homelab enthusiasts worldwide.*

---

## The Breaking Point

It was 2 AM on a Sunday when I realized I had a problem. My wife was trying to watch a movie, but Jellyfin wasn't responding. I grabbed my laptop, opened Terminal, and started the familiar dance:

```bash
ssh pi@192.168.1.101  # Media server - wait, was it .101 or .110?
ssh pi@192.168.1.110  # Ah no, this is the PiHole
ssh pi@192.168.1.102  # Finally! Let me check Docker...
sudo docker ps       # Container crashed. Again.
```

After fixing the issue and apologizing to my wife (again), I sat back and thought: "There has to be a better way."

## The Homelab Sprawl

Like many of you, my homelab started innocently enough. One Raspberry Pi 4 running PiHole. "Look honey, no more ads!" I proclaimed proudly. She was impressed. I was hooked.

Within six months, my setup had evolved into:
- **3 Raspberry Pi 4s** running various Docker containers
- **2 Raspberry Pi 3B+** units for IoT projects
- **1 Raspberry Pi Zero W** monitoring the garage
- **2 old laptops** repurposed as Ubuntu servers
- **1 Proxmox server** I got from a friend
- **3 more Pis** in various states of experimentation

Each device had its purpose:
- **Living Room Pi**: Jellyfin, Sonarr, Radarr, Transmission
- **Office Pi**: GitLab, Jenkins, development databases
- **Basement Pi**: Home Assistant, MQTT broker, Zigbee2MQTT
- **Kitchen Pi**: PiHole, Unbound, WireGuard
- **Garage Pi**: Temperature monitoring, security camera

Managing this zoo of devices was becoming a part-time job. I had:
- A spreadsheet with IP addresses (often outdated)
- Sticky notes with SSH passwords (I know, I know...)
- No idea which Pi was running out of storage
- No clue when I last updated each system
- Zero visibility into overall resource usage

## The Search for Solutions

I spent weeks evaluating existing solutions:

### Enterprise Tools (Ansible Tower, Puppet, Chef)
- **Pros**: Powerful, battle-tested
- **Cons**: Overkill for homelab, expensive, steep learning curve

### Monitoring Solutions (Nagios, Zabbix)
- **Pros**: Great for monitoring
- **Cons**: No management capabilities, requires agents

### Container Platforms (Portainer, Rancher)
- **Pros**: Excellent for containers
- **Cons**: Doesn't handle the OS level, requires agents

### DIY Scripts
- **Pros**: Customized to my needs
- **Cons**: Maintenance nightmare, no UI, wife-approval factor: zero

Nothing fit the bill. I needed something that was:
1. **Agentless** - My Pi Zeros couldn't spare the RAM
2. **Comprehensive** - OS updates + container management + monitoring
3. **User-friendly** - Clean UI that my family could use
4. **Raspberry Pi aware** - Understanding ARM limitations
5. **Automation-capable** - Set it and forget it

## The Birth of SquirrelServersManager

In late 2022, I decided to build my own solution. I started with a simple question: "What if I could manage all my devices from one dashboard, using just SSH?"

### The First Prototype

My initial proof of concept was embarrassingly simple:

```typescript
// Early prototype - January 2023
class DeviceManager {
  async getDeviceStatus(ip: string, credentials: Credentials) {
    const ssh = new SSH2Promise({
      host: ip,
      username: credentials.username,
      password: credentials.password
    });
    
    const uptime = await ssh.exec('uptime');
    const df = await ssh.exec('df -h');
    const docker = await ssh.exec('docker ps');
    
    return { uptime, df, docker };
  }
}
```

It worked! I could see all my devices in one place. But this was just the beginning.

### Evolution Through Real Use

As I dogfooded my own creation, the requirements became clearer. Here's how the architecture evolved:

```typescript
// Current architecture - clean, modular, extensible
@Injectable()
export class DevicesService implements IDevicesService {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
    @Inject(DEVICE_AUTH_REPOSITORY)
    private readonly deviceAuthRepository: IDeviceAuthRepository,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultService: IVaultCryptoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<IDevice> {
    // Validation layer
    await this.validateDeviceCreation(createDeviceDto);
    
    // Security layer - encrypt sensitive data
    const encryptedAuth = {
      sshPwd: createDeviceDto.sshPwd
        ? await this.vaultService.encrypt(createDeviceDto.sshPwd, DEFAULT_VAULT_ID)
        : undefined,
      sshKey: createDeviceDto.sshKey
        ? await this.vaultService.encrypt(createDeviceDto.sshKey, DEFAULT_VAULT_ID)
        : undefined,
    };
    
    // Persistence layer
    const device = await this.deviceRepository.create({
      ...createDeviceDto,
      ...encryptedAuth
    });
    
    // Event layer - trigger discovery
    this.eventEmitter.emit(
      DeviceEvents.DEVICE_CREATED,
      new DeviceCreatedEvent(device.uuid)
    );
    
    return device;
  }
}
```

### The Raspberry Pi Challenge

One of the biggest challenges was properly supporting Raspberry Pi devices. These aren't just regular Linux boxes – they have unique characteristics:

```typescript
// Sophisticated Pi detection and categorization
async getCpu(): Promise<Systeminformation.CpuData> {
  const result = await si.cpu();
  
  // Special Raspberry Pi detection and handling
  if (result.vendor === 'ARM' && (await this.isRaspberry())) {
    const rPIRevision = this.decodePiCpuinfo();
    
    // Decode the revision to get exact model
    result.family = result.manufacturer;
    result.manufacturer = rPIRevision.manufacturer as string;
    result.brand = rPIRevision.processor as string;
    result.revision = rPIRevision.revisionCode as string;
    result.socket = 'SOC';
    
    // Adjust expectations based on model
    if (rPIRevision.type === 'Zero W') {
      result.flags = result.flags + ' low_power';
      result.cache = { l1d: 16384, l1i: 16384 }; // Smaller cache
    }
  }
  
  return result;
}

// Comprehensive Pi model database
export const typeList = {
  '00': 'A',        // The original!
  '01': 'B',        // 512MB RAM
  '02': 'A+',       // Smaller form factor
  '03': 'B+',       // More GPIO pins
  '04': '2B',       // Quad-core arrives
  '08': '3B',       // 64-bit capable
  '09': 'Zero',     // Tiny but mighty
  '0c': 'Zero W',   // WiFi enabled Zero
  '0d': '3B+',      // Faster networking
  '0e': '3A+',      // Compute Module
  '11': '4B',       // USB 3.0, true Gigabit
  '12': 'Zero 2 W', // Quad-core Zero!
  '13': '400',      // Keyboard computer
  '14': 'CM4',      // Compute Module 4
  '17': '5',        // PCIe, NVMe support!
};

// Memory configurations matter for resource planning
export const sizeList: { [key: string]: string } = {
  '0': '256',
  '1': '512',
  '2': '1024',
  '3': '2048',
  '4': '4096',
  '5': '8192',
};
```

### Real-Time Monitoring Without the Overhead

The next challenge was monitoring. I needed real-time metrics without installing agents that would consume precious resources on my Pi Zeros. The solution? Prometheus integration with SSH-based collection:

```typescript
export const METRICS_DEFINITIONS: MetricDefinition[] = [
  {
    type: MetricType.CPU_USAGE,
    name: 'device_cpu_usage_percent',
    help: 'CPU usage percent of devices',
    gauge: new Gauge({
      name: 'device_cpu_usage_percent',
      help: 'CPU usage percent of devices',
      labelNames: ['device_id', 'device_name', 'device_model'],
    }),
  },
  {
    type: MetricType.MEM_USAGE,
    name: 'device_mem_usage_percent',
    help: 'Memory usage percent of devices',
    gauge: new Gauge({
      name: 'device_mem_usage_percent',
      help: 'Memory usage percent of devices',
      labelNames: ['device_id', 'device_name', 'total_mb'],
    }),
  },
  {
    type: MetricType.TEMPERATURE,
    name: 'device_temperature_celsius',
    help: 'Device temperature in celsius',
    gauge: new Gauge({
      name: 'device_temperature_celsius',
      help: 'Device temperature in celsius',
      labelNames: ['device_id', 'device_name', 'sensor'],
    }),
  },
];

// Efficient metric collection
async collectMetrics(device: IDevice): Promise<void> {
  const sshPool = await this.getSSHConnection(device);
  
  try {
    // Batch commands for efficiency
    const [cpu, memory, temp, containers] = await Promise.all([
      sshPool.exec('top -bn1 | head -5'),
      sshPool.exec('free -m'),
      sshPool.exec('cat /sys/class/thermal/thermal_zone0/temp'),
      sshPool.exec('docker stats --no-stream --format json'),
    ]);
    
    // Parse and update metrics
    this.updatePrometheusMetrics(device, { cpu, memory, temp, containers });
  } finally {
    // Return connection to pool
    sshPool.release();
  }
}
```

### Container Management That Just Works

Docker management over SSH presented unique challenges. The Docker API expects a local socket, but I needed remote access:

```typescript
async createDockerConnection(device: IDevice): Promise<Dockerode> {
  const deviceAuth = await this.getDeviceAuth(device.uuid);
  
  // Custom SSH agent for Docker API tunneling
  const agent = getCustomAgent(logger, {
    host: device.ip,
    port: deviceAuth.sshPort || 22,
    username: deviceAuth.sshUser,
    password: deviceAuth.sshPwd 
      ? await this.vaultService.decrypt(deviceAuth.sshPwd)
      : undefined,
    privateKey: deviceAuth.sshKey
      ? await this.vaultService.decrypt(deviceAuth.sshKey)
      : undefined,
    timeout: 60000,
  });
  
  // Docker client with SSH tunnel
  return new Dockerode({
    agent,
    protocol: 'http',
    host: 'localhost',
    port: 2375,
    timeout: 60000,
  });
}

// Now I can manage containers remotely!
async getContainers(deviceUuid: string): Promise<ContainerInfo[]> {
  const docker = await this.createDockerConnection(device);
  const containers = await docker.listContainers({ all: true });
  
  return containers.map(container => ({
    id: container.Id,
    name: container.Names[0]?.replace('/', ''),
    image: container.Image,
    state: container.State,
    status: container.Status,
    ports: this.parsePortMappings(container.Ports),
    created: new Date(container.Created * 1000),
  }));
}
```

### Automation: The Game Changer

The real magic happened when I added automation capabilities. No more manual updates at 2 AM:

```typescript
// Automation engine with cron support
async createAutomation(
  automation: CreateAutomationDto,
  user: IUser
): Promise<IAutomation> {
  const chain: Automations.AutomationChain = {
    trigger: automation.trigger,
    cronValue: automation.cronValue, // e.g., "0 2 * * 0" - Sunday at 2 AM
    actions: automation.actions.map(action => ({
      action: action.type,
      playbook: action.playbookId,
      actionDevices: action.targetDevices,
      onSuccess: action.onSuccess,
      onFailure: action.onFailure,
    })),
  };
  
  // Register with scheduler
  if (automation.trigger === Automations.Triggers.CRON) {
    this.schedulerRegistry.addCronJob(
      automation.uuid,
      new CronJob(automation.cronValue, async () => {
        await this.executeAutomationChain(chain, user);
      })
    );
  }
  
  return this.automationRepository.create(automation);
}

// Pre-built automation templates
const templates: Partial<Automations.AutomationChain>[] = [
  {
    name: "Weekly System Updates",
    trigger: Automations.Triggers.CRON,
    cronValue: '0 2 * * 0', // Sunday 2 AM
    actions: [{
      action: Automations.Actions.PLAYBOOK,
      playbook: 'system-update',
      actionDevices: ['all-raspberry-pis'],
      onFailure: {
        action: Automations.Actions.NOTIFICATION,
        message: 'Update failed on {{device.name}}'
      }
    }]
  },
  {
    name: "Container Health Check",
    trigger: Automations.Triggers.CRON,
    cronValue: '*/15 * * * *', // Every 15 minutes
    actions: [{
      action: Automations.Actions.RESTART_UNHEALTHY_CONTAINERS,
      actionDevices: ['all-devices'],
    }]
  },
  {
    name: "Storage Space Alert",
    trigger: Automations.Triggers.DEVICE_STAT,
    condition: 'storage.used > 90',
    actions: [{
      action: Automations.Actions.PLAYBOOK,
      playbook: 'cleanup-logs',
      actionDevices: ['{{trigger.device}}'],
    }]
  }
];
```

## The Ansible Integration

One of my best decisions was integrating Ansible for complex operations:

```typescript
async executePlaybook(
  playbook: IPlaybook,
  user: IUser,
  target: string[] | undefined,
  extraVars?: API.ExtraVars,
  mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
): Promise<ExecutionId> {
  // Prepare execution environment
  const executionId = uuidv4();
  const executionPath = path.join(
    this.configService.get('ansible.workdir'),
    executionId
  );
  
  // Copy playbook to execution directory
  await fs.copy(playbook.path, executionPath);
  
  // Generate inventory dynamically
  const inventory = await this.generateInventory(target);
  await fs.writeFile(
    path.join(executionPath, 'inventory.json'),
    JSON.stringify(inventory)
  );
  
  // Handle vault secrets securely
  if (playbook.playbooksRepository?.vaults) {
    await this.setupVaultSecrets(
      executionPath,
      playbook.playbooksRepository.vaults
    );
  }
  
  // Execute with real-time log streaming
  const ansibleProcess = spawn('ansible-playbook', [
    '-i', 'inventory.json',
    '--extra-vars', JSON.stringify(extraVars),
    mode === SsmAnsible.ExecutionMode.CHECK ? '--check' : '',
    'site.yml'
  ], {
    cwd: executionPath,
    env: this.getAnsibleEnvironment(user),
  });
  
  // Stream logs to WebSocket
  ansibleProcess.stdout.on('data', (data) => {
    this.websocketGateway.sendExecutionLog(
      executionId,
      data.toString()
    );
  });
  
  return executionId;
}
```

## The Results: A Complete Transformation

Today, my homelab runs itself. Here's what changed:

### Before SquirrelServersManager:
- **Manual SSH sessions**: 30+ minutes daily
- **Update anxiety**: "Did I update that Pi last month?"
- **Container crashes**: Discovery after wife/kids complained
- **Resource waste**: No idea which Pi was underutilized
- **Security concerns**: Passwords in text files

### After SquirrelServersManager:
- **Single dashboard**: 2-minute morning check
- **Automated updates**: Every Sunday at 2 AM
- **Proactive monitoring**: Alerts before issues occur
- **Resource optimization**: Moved containers to underused Pis
- **Enterprise security**: Encrypted vault, key rotation

### Real metrics from my deployment:
```typescript
async getSystemStats(): Promise<SystemStats> {
  const stats = await this.statsRepository.getLatest();
  
  return {
    totalDevices: 15,
    onlineDevices: 15, // 100% uptime!
    totalContainers: 47,
    runningContainers: 47,
    avgCpuUsage: 23.4, // Percent
    avgMemUsage: 41.2, // Percent
    totalStorage: 2.1, // TB
    usedStorage: 0.8, // TB
    automationRuns: 1247, // This month
    successRate: 99.3, // Percent
    savedHours: 18.5, // This month
  };
}
```

## Open Sourcing: Giving Back

In mid-2023, I decided to open source SquirrelServersManager. 

## Lessons Learned

Building SquirrelServersManager taught me valuable lessons:

1. **Scratch your own itch**: The best software solves real problems
2. **Start simple**: My first version was 200 lines of code
3. **Dogfood religiously**: Use your own software daily
4. **Listen to users**: They'll request features you need but didn't know
5. **Architecture matters**: Clean code enables rapid evolution

## The Technical Stack

For the curious, here's what powers SquirrelServersManager:

### Backend:
- **NestJS**: Modular, testable, enterprise-grade
- **TypeScript**: Type safety prevents 2 AM debugging
- **MongoDB**: Flexible schema for diverse devices
- **Ansible**: Battle-tested automation
- **Prometheus**: Time-series metrics
- **Docker SDK**: Container management
- **SSH2**: Secure communication

### Frontend:
- **React**: Component-based UI
- **Ant Design Pro**: Beautiful, responsive components
- **Recharts**: Real-time metric visualization
- **Socket.io**: Live updates
- **Monaco Editor**: VSCode editor for playbooks

### Infrastructure:
- **Docker**: Easy deployment
- **GitHub Actions**: CI/CD pipeline
- **Jest/Vitest**: Comprehensive testing
- **ESLint/Prettier**: Code quality

## Join the Community

We have an amazing community of homelab enthusiasts, developers, and IT professionals:

- **GitHub**: [Star us](https://github.com/SquirrelCorporation/SquirrelServersManager) and contribute
- **Documentation**: Comprehensive guides at [squirrelserversmanager.io](https://squirrelserversmanager.io)
- **Blog**: Weekly tips on homelab management

## Final Thoughts

What started as a personal frustration has evolved into something that helps thousands of people manage their infrastructure more effectively. Every time someone tells me SSM saved them hours of work or prevented a disaster, it makes those late coding nights worth it.

Remember: Your homelab should be fun, not a chore. Let SquirrelServersManager handle the mundane so you can focus on building cool things.

*Happy homelabbing! 🐿️*

---

**About the Author**: I'm a software engineer with an unhealthy obsession with Raspberry Pis and home automation. When I'm not coding, you'll find me explaining to my wife why we need "just one more Pi" for the cluster.

**Technical Note**: All code examples in this article are from the actual SquirrelServersManager codebase. You can explore the full source code on [GitHub](https://github.com/SquirrelCorporation/SquirrelServersManager).