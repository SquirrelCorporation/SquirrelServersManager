---
title: Why I Built My Own Docker Management Solution Instead of Using Portainer
description: The journey of creating a unified container management platform that speaks your language
date: 2024-01-20
author: Emmanuel Costa
tags: [docker, containers, management, homelab]
---

# Why I Built My Own Docker Management Solution Instead of Using Portainer

Don't get me wrong - Portainer is great. But after managing containers across 15+ devices for two years, I kept hitting the same walls. I needed something that understood my infrastructure holistically, not just containers in isolation. This is the story of how Squirrel Servers Manager's container management came to be, and why sometimes building your own solution is the right choice.

## The Limitations I Faced

Running a homelab with multiple Docker hosts, I encountered several pain points:

1. **No unified view**: Each Portainer instance was an island
2. **No integration**: Containers existed separately from host monitoring
3. **Limited automation**: No easy way to deploy across multiple hosts
4. **Missing context**: Container health without host health is meaningless
5. **Authentication overhead**: Managing access across instances

I wanted a single pane of glass that understood both my containers AND my infrastructure.

## Designing a Better Solution

The key insight was that containers don't exist in a vacuum. They run on hosts that have CPU, memory, disk constraints. They need monitoring, logging, and orchestration. So we built a holistic solution:

### Multi-Host Container Discovery

```typescript
// server/src/modules/containers/application/services/container.service.ts
export class ContainerService {
  private readonly logger = new Logger(ContainerService.name);

  async syncContainersForAllDevices(): Promise<void> {
    const devices = await this.deviceService.getOnlineDevices();
    
    // Parallel sync across all devices
    const syncPromises = devices.map(device => 
      this.syncContainersForDevice(device)
        .catch(error => {
          this.logger.error(`Sync failed for ${device.ip}:`, error);
          return { device: device.uuid, error: error.message };
        })
    );

    const results = await Promise.all(syncPromises);
    
    // Emit aggregated results
    this.eventEmitter.emit(ContainerEvents.SYNC_COMPLETED, {
      total: devices.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error)
    });
  }

  async syncContainersForDevice(device: Device): Promise<Container[]> {
    // Execute docker commands over SSH
    const dockerCommands = {
      containers: 'docker ps -a --format "{{json .}}"',
      stats: 'docker stats --no-stream --format "{{json .}}"',
      images: 'docker image ls --format "{{json .}}"',
      networks: 'docker network ls --format "{{json .}}"',
      volumes: 'docker volume ls --format "{{json .}}"'
    };

    const results = await this.sshService.execBundledCommands(
      device.uuid,
      Object.values(dockerCommands)
    );

    // Parse container information
    const containers = this.parseDockerOutput(results[0])
      .map(container => this.enrichContainerData(container, results[1]));

    // Update database with current state
    await this.updateContainerRegistry(device.uuid, containers);

    // Check for state changes and emit events
    await this.detectAndEmitChanges(device.uuid, containers);

    return containers;
  }

  private enrichContainerData(
    container: DockerContainer, 
    stats: string
  ): EnrichedContainer {
    const statsData = this.parseDockerStats(stats)
      .find(s => s.container === container.id);

    return {
      ...container,
      cpuPercent: statsData?.cpuPercent || 0,
      memoryUsage: statsData?.memUsage || '0B',
      memoryLimit: statsData?.memLimit || '0B',
      networkIn: statsData?.netIn || '0B',
      networkOut: statsData?.netOut || '0B',
      blockIn: statsData?.blockIn || '0B',
      blockOut: statsData?.blockOut || '0B',
      // Additional enrichment
      health: this.calculateContainerHealth(container, statsData),
      uptime: this.calculateUptime(container.status),
      isSquirrelManaged: container.labels?.['squirrel.managed'] === 'true'
    };
  }
}
```

This gives us real-time container information across all hosts, enriched with performance metrics and health scores.

### Intelligent Container Deployment

One of Portainer's limitations is deploying the same stack across multiple hosts. We solved this with our template system:

```typescript
// server/src/modules/container-stacks/application/services/stack-deployment.service.ts
export class StackDeploymentService {
  async deployStackToDevices(
    stackId: string, 
    deviceUuids: string[],
    variables?: Record<string, string>
  ): Promise<DeploymentResult[]> {
    const stack = await this.stackRepository.findById(stackId);
    
    // Validate stack compatibility with target devices
    const validationResults = await this.validateDeviceCompatibility(
      stack,
      deviceUuids
    );

    // Prepare deployment tasks
    const deploymentTasks = validationResults
      .filter(v => v.compatible)
      .map(v => this.createDeploymentTask(stack, v.device, variables));

    // Execute deployments with rate limiting
    const results = await this.executeWithRateLimit(
      deploymentTasks,
      5 // Max 5 concurrent deployments
    );

    // Generate deployment report
    return this.generateDeploymentReport(results);
  }

  private async createDeploymentTask(
    stack: ContainerStack,
    device: Device,
    variables?: Record<string, string>
  ): Promise<DeploymentTask> {
    // Process template variables
    const processedCompose = this.templateEngine.process(
      stack.composeContent,
      {
        ...stack.defaultVariables,
        ...variables,
        DEVICE_HOSTNAME: device.hostname,
        DEVICE_IP: device.ip,
        DEVICE_ARCH: device.systemInfo.arch
      }
    );

    return {
      device,
      stack,
      composeContent: processedCompose,
      execute: async () => {
        // Create temporary compose file on target
        const remotePath = `/tmp/ssm-deploy-${Date.now()}.yml`;
        await this.sshService.writeFile(
          device.uuid,
          remotePath,
          processedCompose
        );

        try {
          // Deploy with docker-compose
          const deployCommand = `
            cd $(dirname ${remotePath}) &&
            docker-compose -f ${remotePath} up -d --remove-orphans
          `;
          
          const result = await this.sshService.execCommand(
            device.uuid,
            deployCommand,
            { timeout: 300000 } // 5 minute timeout
          );

          // Tag containers for management
          await this.tagDeployedContainers(device.uuid, stack.id);

          return {
            success: true,
            device: device.uuid,
            output: result.stdout,
            deployedServices: this.parseDeployedServices(result.stdout)
          };
        } finally {
          // Cleanup
          await this.sshService.execCommand(
            device.uuid,
            `rm -f ${remotePath}`
          );
        }
      }
    };
  }

  private async tagDeployedContainers(
    deviceUuid: string,
    stackId: string
  ): Promise<void> {
    const labelCommands = `
      docker ps -q -f "label=com.docker.compose.project" | 
      xargs -I {} docker update {} \\
        --label squirrel.managed=true \\
        --label squirrel.stack=${stackId} \\
        --label squirrel.deployed=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    `;

    await this.sshService.execCommand(deviceUuid, labelCommands);
  }
}
```

### Real-Time Container Logs

Unlike Portainer's basic log viewer, we built a powerful streaming log system with search and filtering:

```typescript
// server/src/modules/containers/presentation/gateways/container-logs.gateway.ts
@WebSocketGateway({
  namespace: 'container-logs',
  cors: { origin: '*' }
})
export class ContainerLogsGateway {
  private activeStreams = new Map<string, ContainerLogStream>();

  @SubscribeMessage('startLogStream')
  async handleStartLogStream(
    @MessageBody() data: LogStreamRequest,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { deviceUuid, containerId, options } = data;
    const streamKey = `${deviceUuid}:${containerId}:${client.id}`;

    // Set up SSH stream for docker logs
    const connection = await this.sshService.getConnection(deviceUuid);
    const logCommand = this.buildLogCommand(containerId, options);

    const stream = new ContainerLogStream({
      connection,
      command: logCommand,
      onData: (chunk: string) => {
        // Parse Docker log format and emit to client
        const logs = this.parseDockerLogs(chunk);
        client.emit('logData', {
          containerId,
          logs: logs.map(log => ({
            ...log,
            highlighted: this.highlightLog(log, options.filters)
          }))
        });
      },
      onError: (error: Error) => {
        client.emit('logError', {
          containerId,
          error: error.message
        });
      }
    });

    // Store stream reference
    this.activeStreams.set(streamKey, stream);
    
    // Start streaming
    await stream.start();

    // Handle client disconnect
    client.on('disconnect', () => {
      this.cleanupStream(streamKey);
    });
  }

  private buildLogCommand(
    containerId: string, 
    options: LogOptions
  ): string {
    const args = ['docker logs'];
    
    if (options.follow) args.push('-f');
    if (options.timestamps) args.push('-t');
    if (options.tail) args.push(`--tail ${options.tail}`);
    if (options.since) args.push(`--since ${options.since}`);
    
    args.push('2>&1'); // Combine stdout and stderr
    args.push(containerId);

    // Add grep filtering if specified
    if (options.filters?.length) {
      const grepPattern = options.filters
        .map(f => f.pattern)
        .join('\\|');
      args.push(`| grep -E "${grepPattern}"`);
    }

    return args.join(' ');
  }

  private parseDockerLogs(chunk: string): ParsedLog[] {
    const lines = chunk.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      // Parse Docker log format: "2024-01-20T10:30:45.123456789Z message"
      const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s(.*)$/);
      
      if (timestampMatch) {
        return {
          timestamp: new Date(timestampMatch[1]),
          message: timestampMatch[2],
          level: this.detectLogLevel(timestampMatch[2]),
          stream: this.detectStream(line)
        };
      }

      return {
        timestamp: new Date(),
        message: line,
        level: 'info',
        stream: 'stdout'
      };
    });
  }

  private detectLogLevel(message: string): LogLevel {
    const patterns = {
      error: /error|exception|fail|fatal/i,
      warn: /warn|warning/i,
      debug: /debug/i,
      trace: /trace/i
    };

    for (const [level, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return level as LogLevel;
      }
    }

    return 'info';
  }
}
```

### Container Health Monitoring

We go beyond simple up/down status to provide intelligent health monitoring:

```typescript
// server/src/modules/containers/application/services/container-health.service.ts
export class ContainerHealthService {
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly healthRules = new Map<string, HealthRule[]>();

  async checkContainerHealth(
    device: Device,
    container: Container
  ): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkDockerHealth(device.uuid, container.id),
      this.checkResourceUsage(device.uuid, container.id),
      this.checkNetworkConnectivity(device.uuid, container.id),
      this.checkLogPatterns(device.uuid, container.id),
      this.runCustomHealthChecks(device.uuid, container)
    ]);

    const healthScore = this.calculateHealthScore(checks);
    const status = this.determineHealthStatus(healthScore);

    // Store historical data
    await this.healthRepository.record({
      deviceUuid: device.uuid,
      containerId: container.id,
      timestamp: new Date(),
      score: healthScore,
      status,
      checks
    });

    // Emit alerts if needed
    if (status === 'unhealthy' || status === 'degraded') {
      this.eventEmitter.emit(ContainerEvents.HEALTH_ALERT, {
        device,
        container,
        status,
        checks: checks.filter(c => !c.passed)
      });
    }

    return { status, score: healthScore, checks };
  }

  private async checkResourceUsage(
    deviceUuid: string,
    containerId: string
  ): Promise<HealthCheck> {
    const stats = await this.getContainerStats(deviceUuid, containerId);
    
    const issues = [];
    if (stats.cpuPercent > 90) {
      issues.push('CPU usage above 90%');
    }
    if (stats.memoryPercent > 85) {
      issues.push('Memory usage above 85%');
    }

    return {
      name: 'Resource Usage',
      passed: issues.length === 0,
      message: issues.length ? issues.join(', ') : 'Resources within limits',
      severity: issues.length > 1 ? 'high' : 'medium'
    };
  }

  private async checkLogPatterns(
    deviceUuid: string,
    containerId: string
  ): Promise<HealthCheck> {
    // Check recent logs for error patterns
    const recentLogs = await this.sshService.execCommand(
      deviceUuid,
      `docker logs --since 5m ${containerId} 2>&1 | tail -100`
    );

    const errorPatterns = [
      { pattern: /fatal|panic/i, severity: 'critical' },
      { pattern: /error|exception/i, severity: 'high' },
      { pattern: /warn|warning/i, severity: 'medium' }
    ];

    const detectedIssues = errorPatterns
      .filter(({ pattern }) => pattern.test(recentLogs.stdout))
      .map(({ pattern, severity }) => ({
        pattern: pattern.toString(),
        severity,
        count: (recentLogs.stdout.match(pattern) || []).length
      }));

    const highestSeverity = detectedIssues.reduce((max, issue) => 
      this.compareSeverity(max, issue.severity) > 0 ? max : issue.severity,
      'low'
    );

    return {
      name: 'Log Analysis',
      passed: detectedIssues.length === 0,
      message: detectedIssues.length 
        ? `Found ${detectedIssues.length} concerning patterns`
        : 'No errors in recent logs',
      severity: highestSeverity,
      details: detectedIssues
    };
  }
}
```

## The Integrated Experience

What makes our solution powerful is the integration with the rest of SSM:

### 1. Unified Dashboard
See container health alongside host metrics - understand the full picture at a glance.

### 2. Intelligent Alerts
Get notified not just when a container dies, but when it's heading toward trouble:

```typescript
// Alert when container restart frequency is too high
if (container.restartCount > 5 && container.uptime < 3600) {
  this.alertService.create({
    severity: 'warning',
    title: 'Container Instability Detected',
    message: `${container.name} has restarted ${container.restartCount} times in the last hour`,
    deviceUuid: device.uuid,
    metadata: { containerId: container.id }
  });
}
```

### 3. Automated Remediation
Use Ansible playbooks triggered by container events:

```typescript
// Auto-restart unhealthy containers with cleanup
@OnEvent(ContainerEvents.HEALTH_CRITICAL)
async handleCriticalHealth(event: HealthEvent): Promise<void> {
  if (event.container.labels['squirrel.auto-remediate'] === 'true') {
    await this.playbookExecutor.run('container-remediation', {
      device_uuid: event.device.uuid,
      container_id: event.container.id,
      cleanup_volumes: 'true',
      pull_latest: 'true'
    });
  }
}
```

## Performance at Scale

Managing 100+ containers across multiple hosts requires optimization:

### Batch Operations
```typescript
// Update multiple containers in one command
const batchUpdate = containers
  .map(c => `docker update ${c.id} --restart unless-stopped`)
  .join(' && ');

await this.sshService.execCommand(deviceUuid, batchUpdate);
```

### Smart Caching
```typescript
// Cache image metadata to reduce queries
private imageCache = new TTLCache<string, ImageInfo>({ 
  ttl: 3600000, // 1 hour
  max: 1000 
});
```

### Differential Sync
Only transfer what's changed:

```typescript
const changes = await this.detectContainerChanges(device.uuid, currentState);
if (changes.length > 0) {
  await this.syncChangedContainers(device.uuid, changes);
}
```

## Real-World Results

After 6 months of production use:

- **500+ containers** managed across 50+ devices
- **95% reduction** in time spent on container management  
- **Real-time updates** with <2 second latency
- **Automated deployment** to multiple hosts in parallel
- **Integrated monitoring** catching issues before they become problems

## What's Next?

We're continuously improving container management:

- **Kubernetes integration**: Bridging Docker and K8s management
- **Image vulnerability scanning**: Security analysis before deployment
- **Cost tracking**: Resource usage and estimated costs per container
- **GitOps workflows**: Deploy on git push with automatic rollback

## Try It Today

Squirrel Servers Manager brings enterprise-grade container management to your homelab:

```bash
# Quick deploy with our managed stack
docker run -d \
  -p 8080:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ssm-data:/data \
  squirrelserversmanager/ssm:latest
```

Join our [community](https://discord.gg/your-server) and help shape the future of container management!

---

*What container management challenges are you facing? Share your thoughts on [GitHub](https://github.com/SquirrelCorporation/SquirrelServersManager) or reach out on Discord. Let's build better tools together.*