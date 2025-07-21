---
title: Building a Plugin Architecture: How We Made SSM Infinitely Extensible
description: The technical journey of creating a plugin system that lets anyone extend SSM without touching core code
date: 2024-02-10
author: Emmanuel Costa
tags: [plugins, architecture, extensibility, open-source]
---

# Building a Plugin Architecture: How We Made SSM Infinitely Extensible

Every successful open-source project reaches a crossroads: users want features that don't belong in the core. "Can you add support for my specific monitoring tool?" "I need integration with our internal API." "What about this niche use case?" The answer can't always be yes - but what if users could build it themselves? This is the story of how we built Squirrel Servers Manager's plugin architecture, turning SSM from a monitoring tool into a platform.

## The Catalyst Moment

The request that changed everything was simple: "Can SSM send alerts to our internal chat system?" 

We already supported Discord, Slack, and email. Adding another notification channel seemed easy. But then came more requests: Teams, Telegram, Matrix, XMPP, custom webhooks, SMS gateways... The list was endless.

That's when we realized: we couldn't build everything, but we could build a system that lets others build anything.

## Designing for Extensibility

We had several goals for our plugin system:

1. **Zero core modifications**: Installing a plugin shouldn't touch SSM's code
2. **Full access**: Plugins should be as powerful as core features
3. **Isolation**: One plugin's crash shouldn't affect others
4. **Hot loading**: Add/remove plugins without restarting
5. **Developer friendly**: Building plugins should be enjoyable

Here's how we achieved each goal:

### The Plugin Interface

We started by defining what a plugin actually is:

```typescript
// server/src/infrastructure/plugins/plugin-system.ts
export interface Plugin {
  manifest: PluginManifest;
  activate(context: PluginContext): Promise<void>;
  deactivate?(): Promise<void>;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  
  // Compatibility
  engines: {
    ssm: string;  // Semver range like ">=0.5.0"
    node?: string;
  };
  
  // Capabilities
  contributes?: {
    api?: ApiContribution[];
    ui?: UiContribution[];
    commands?: CommandContribution[];
    hooks?: HookContribution[];
    widgets?: WidgetContribution[];
    settings?: SettingContribution[];
  };
  
  // Permissions
  permissions?: string[];
  
  // Dependencies
  dependencies?: Record<string, string>;
  extensionDependencies?: string[];
}

export interface PluginContext {
  // Core services
  logger: Logger;
  storage: PluginStorage;
  settings: PluginSettings;
  
  // API access
  api: {
    devices: DeviceAPI;
    containers: ContainerAPI;
    ansible: AnsibleAPI;
    notifications: NotificationAPI;
    events: EventAPI;
  };
  
  // Extension points
  registerCommand(command: Command): Disposable;
  registerApiEndpoint(endpoint: ApiEndpoint): Disposable;
  registerWidget(widget: Widget): Disposable;
  registerHook(hook: Hook): Disposable;
  
  // Utilities
  createWebSocketNamespace(name: string): SocketNamespace;
  scheduleTask(task: ScheduledTask): Disposable;
  
  // Plugin info
  extensionPath: string;
  globalState: GlobalState;
  workspaceState: WorkspaceState;
}
```

### Plugin Loading and Isolation

Each plugin runs in its own context with controlled access:

```typescript
// server/src/infrastructure/plugins/plugin-loader.ts
@Injectable()
export class PluginLoader {
  private plugins = new Map<string, LoadedPlugin>();
  private contexts = new Map<string, PluginContext>();

  async loadPlugin(pluginPath: string): Promise<LoadedPlugin> {
    try {
      // Load and validate manifest
      const manifestPath = path.join(pluginPath, 'manifest.json');
      const manifest = await this.loadManifest(manifestPath);
      
      // Check compatibility
      if (!this.isCompatible(manifest)) {
        throw new IncompatiblePluginException(manifest);
      }
      
      // Create isolated context
      const context = this.createPluginContext(manifest, pluginPath);
      
      // Load plugin code
      const pluginModule = await this.loadPluginModule(pluginPath, context);
      
      // Initialize plugin
      const plugin: LoadedPlugin = {
        id: manifest.id,
        manifest,
        module: pluginModule,
        context,
        status: 'loaded',
        activationTime: null,
        error: null
      };
      
      this.plugins.set(manifest.id, plugin);
      this.contexts.set(manifest.id, context);
      
      // Emit load event
      this.eventEmitter.emit(PluginEvents.LOADED, { pluginId: manifest.id });
      
      return plugin;
    } catch (error) {
      this.logger.error(`Failed to load plugin from ${pluginPath}:`, error);
      throw new PluginLoadException(pluginPath, error.message);
    }
  }

  private async loadPluginModule(
    pluginPath: string,
    context: PluginContext
  ): Promise<any> {
    const mainFile = path.join(pluginPath, 'dist', 'index.js');
    
    // Create sandboxed environment
    const sandbox = {
      // Node.js globals
      console: this.createSandboxedConsole(context),
      process: this.createSandboxedProcess(),
      Buffer,
      
      // Plugin context
      __pluginContext: context,
      
      // Allowed modules
      require: this.createSandboxedRequire(pluginPath, context)
    };
    
    // Load plugin in VM for isolation
    const vm = new VM({
      timeout: 5000,
      sandbox,
      require: {
        external: true,
        builtin: ['fs', 'path', 'crypto', 'util', 'events'],
        root: pluginPath,
        mock: {
          // Mock dangerous modules
          'child_process': {},
          'cluster': {}
        }
      }
    });
    
    const code = await fs.readFile(mainFile, 'utf8');
    return vm.run(code);
  }

  private createPluginContext(
    manifest: PluginManifest,
    pluginPath: string
  ): PluginContext {
    const pluginLogger = this.logger.child({ plugin: manifest.id });
    
    return {
      logger: pluginLogger,
      
      storage: new PluginStorage(manifest.id, this.storageService),
      
      settings: new PluginSettings(manifest.id, this.settingsService),
      
      api: this.createPluginAPI(manifest),
      
      registerCommand: (command) => {
        return this.commandRegistry.register(manifest.id, command);
      },
      
      registerApiEndpoint: (endpoint) => {
        return this.apiRegistry.register(manifest.id, endpoint);
      },
      
      registerWidget: (widget) => {
        return this.widgetRegistry.register(manifest.id, widget);
      },
      
      registerHook: (hook) => {
        return this.hookRegistry.register(manifest.id, hook);
      },
      
      createWebSocketNamespace: (name) => {
        return this.websocketService.createNamespace(`plugin-${manifest.id}-${name}`);
      },
      
      scheduleTask: (task) => {
        return this.taskScheduler.schedule(manifest.id, task);
      },
      
      extensionPath: pluginPath,
      
      globalState: new PluginGlobalState(manifest.id, this.stateService),
      
      workspaceState: new PluginWorkspaceState(manifest.id, this.stateService)
    };
  }

  private createPluginAPI(manifest: PluginManifest): PluginAPI {
    // Check permissions
    const hasPermission = (perm: string) => 
      manifest.permissions?.includes(perm) || false;
    
    return {
      devices: hasPermission('devices') 
        ? this.createDeviceAPI() 
        : this.createRestrictedAPI('devices'),
        
      containers: hasPermission('containers')
        ? this.createContainerAPI()
        : this.createRestrictedAPI('containers'),
        
      ansible: hasPermission('ansible')
        ? this.createAnsibleAPI()
        : this.createRestrictedAPI('ansible'),
        
      notifications: hasPermission('notifications')
        ? this.createNotificationAPI()
        : this.createRestrictedAPI('notifications'),
        
      events: this.createEventAPI(manifest.id)
    };
  }
}
```

### Plugin Activation Lifecycle

Plugins go through a careful activation process:

```typescript
// server/src/infrastructure/plugins/plugin-manager.ts
@Injectable()
export class PluginManager {
  private activePlugins = new Set<string>();

  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.loader.getPlugin(pluginId);
    if (!plugin) {
      throw new PluginNotFoundException(pluginId);
    }

    if (this.activePlugins.has(pluginId)) {
      return; // Already active
    }

    try {
      // Check dependencies
      await this.checkDependencies(plugin.manifest);
      
      // Activate the plugin
      plugin.status = 'activating';
      const startTime = Date.now();
      
      await plugin.module.activate(plugin.context);
      
      plugin.status = 'active';
      plugin.activationTime = Date.now() - startTime;
      this.activePlugins.add(pluginId);
      
      // Register plugin contributions
      await this.registerContributions(plugin);
      
      // Emit activation event
      this.eventEmitter.emit(PluginEvents.ACTIVATED, {
        pluginId,
        activationTime: plugin.activationTime
      });
      
      this.logger.log(`Plugin ${pluginId} activated in ${plugin.activationTime}ms`);
      
    } catch (error) {
      plugin.status = 'failed';
      plugin.error = error;
      
      this.logger.error(`Failed to activate plugin ${pluginId}:`, error);
      throw new PluginActivationException(pluginId, error.message);
    }
  }

  private async registerContributions(plugin: LoadedPlugin): Promise<void> {
    const contributions = plugin.manifest.contributes;
    if (!contributions) return;

    // Register API endpoints
    if (contributions.api) {
      for (const api of contributions.api) {
        await this.registerApiContribution(plugin.id, api);
      }
    }

    // Register UI components
    if (contributions.ui) {
      for (const ui of contributions.ui) {
        await this.registerUiContribution(plugin.id, ui);
      }
    }

    // Register commands
    if (contributions.commands) {
      for (const command of contributions.commands) {
        await this.registerCommandContribution(plugin.id, command);
      }
    }

    // Register hooks
    if (contributions.hooks) {
      for (const hook of contributions.hooks) {
        await this.registerHookContribution(plugin.id, hook);
      }
    }
  }

  private async registerApiContribution(
    pluginId: string,
    api: ApiContribution
  ): Promise<void> {
    const router = Router();
    
    // Add plugin middleware
    router.use(this.createPluginMiddleware(pluginId));
    
    // Register routes
    for (const route of api.routes) {
      const handler = this.createRouteHandler(pluginId, route);
      
      switch (route.method) {
        case 'GET':
          router.get(route.path, handler);
          break;
        case 'POST':
          router.post(route.path, handler);
          break;
        case 'PUT':
          router.put(route.path, handler);
          break;
        case 'DELETE':
          router.delete(route.path, handler);
          break;
      }
    }
    
    // Mount router
    this.app.use(`/api/plugins/${pluginId}`, router);
  }
}
```

### Plugin Storage and State

Plugins get isolated storage with automatic cleanup:

```typescript
// server/src/infrastructure/plugins/plugin-storage.ts
export class PluginStorage {
  constructor(
    private pluginId: string,
    private storageService: StorageService
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    const fullKey = this.getFullKey(key);
    return this.storageService.get<T>(fullKey);
  }

  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.storageService.set(fullKey, value);
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.storageService.delete(fullKey);
  }

  async list(prefix?: string): Promise<string[]> {
    const pattern = this.getFullKey(prefix || '*');
    const keys = await this.storageService.keys(pattern);
    
    // Remove plugin prefix from keys
    const prefixLength = this.getFullKey('').length;
    return keys.map(k => k.substring(prefixLength));
  }

  async clear(): Promise<void> {
    const keys = await this.list();
    await Promise.all(keys.map(k => this.delete(k)));
  }

  private getFullKey(key: string): string {
    return `plugin:${this.pluginId}:${key}`;
  }
}

// Persistent state across plugin reloads
export class PluginGlobalState {
  private cache = new Map<string, any>();

  constructor(
    private pluginId: string,
    private stateService: StateService
  ) {
    this.loadState();
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  async update<T>(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
    await this.persistState();
  }

  private async loadState(): Promise<void> {
    const state = await this.stateService.getPluginState(this.pluginId);
    if (state) {
      this.cache = new Map(Object.entries(state));
    }
  }

  private async persistState(): Promise<void> {
    const state = Object.fromEntries(this.cache.entries());
    await this.stateService.setPluginState(this.pluginId, state);
  }
}
```

### Real Plugin Example: Custom Notification Channel

Here's a real plugin that adds Matrix notification support:

```typescript
// plugins/matrix-notifications/src/index.ts
import { Plugin, PluginContext } from '@ssm/plugin-api';
import * as sdk from 'matrix-js-sdk';

export class MatrixNotificationPlugin implements Plugin {
  private client: sdk.MatrixClient | null = null;
  private context: PluginContext | null = null;

  async activate(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Register settings schema
    await context.settings.registerSchema({
      homeserver: {
        type: 'string',
        title: 'Matrix Homeserver',
        description: 'Your Matrix homeserver URL',
        default: 'https://matrix.org'
      },
      accessToken: {
        type: 'string',
        title: 'Access Token',
        description: 'Matrix access token',
        secret: true
      },
      roomId: {
        type: 'string',
        title: 'Room ID',
        description: 'Matrix room ID for notifications'
      },
      messageFormat: {
        type: 'string',
        title: 'Message Format',
        enum: ['plain', 'markdown', 'html'],
        default: 'markdown'
      }
    });

    // Initialize Matrix client
    await this.initializeClient();

    // Register notification handler
    context.api.notifications.registerHandler({
      id: 'matrix',
      name: 'Matrix',
      icon: 'matrix-logo',
      handler: this.sendNotification.bind(this)
    });

    // Register commands
    context.registerCommand({
      id: 'matrix.testNotification',
      title: 'Test Matrix Notification',
      handler: async () => {
        await this.sendTestNotification();
      }
    });

    // Register API endpoints
    context.registerApiEndpoint({
      method: 'POST',
      path: '/test',
      handler: async (req, res) => {
        try {
          await this.sendTestNotification();
          res.json({ success: true });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    });

    // Listen for notification events
    context.api.events.on('notification.send', async (event) => {
      if (event.channels.includes('matrix')) {
        await this.sendNotification(event);
      }
    });

    context.logger.info('Matrix notification plugin activated');
  }

  async deactivate(): Promise<void> {
    if (this.client) {
      this.client.stopClient();
      this.client = null;
    }
  }

  private async initializeClient(): Promise<void> {
    const settings = await this.context!.settings.get();
    
    if (!settings.homeserver || !settings.accessToken) {
      this.context!.logger.warn('Matrix settings not configured');
      return;
    }

    this.client = sdk.createClient({
      baseUrl: settings.homeserver,
      accessToken: settings.accessToken,
      userId: await this.getUserId(settings.accessToken)
    });

    await this.client.startClient();
  }

  private async sendNotification(notification: Notification): Promise<void> {
    if (!this.client) {
      throw new Error('Matrix client not initialized');
    }

    const settings = await this.context!.settings.get();
    if (!settings.roomId) {
      throw new Error('Matrix room ID not configured');
    }

    const content = this.formatMessage(notification, settings.messageFormat);

    await this.client.sendEvent(
      settings.roomId,
      'm.room.message',
      content
    );

    // Log successful send
    await this.context!.storage.set(`sent:${Date.now()}`, {
      notification: notification.id,
      timestamp: new Date().toISOString()
    });
  }

  private formatMessage(
    notification: Notification,
    format: string
  ): any {
    const baseContent = {
      msgtype: 'm.text',
      body: `${notification.title}\n\n${notification.message}`
    };

    if (format === 'markdown') {
      return {
        ...baseContent,
        format: 'org.matrix.custom.html',
        formatted_body: this.markdownToHtml(notification)
      };
    }

    if (format === 'html') {
      return {
        ...baseContent,
        format: 'org.matrix.custom.html',
        formatted_body: this.generateHtmlMessage(notification)
      };
    }

    return baseContent;
  }

  private generateHtmlMessage(notification: Notification): string {
    const severityColors = {
      info: '#0066cc',
      warning: '#ff9900',
      error: '#cc0000',
      success: '#009900'
    };

    return `
      <div style="border-left: 4px solid ${severityColors[notification.severity]}; padding-left: 10px;">
        <h3>${notification.title}</h3>
        <p>${notification.message}</p>
        ${notification.metadata ? `
          <details>
            <summary>Details</summary>
            <pre>${JSON.stringify(notification.metadata, null, 2)}</pre>
          </details>
        ` : ''}
        <small style="color: #666;">
          From: ${notification.source} | 
          Time: ${new Date(notification.timestamp).toLocaleString()}
        </small>
      </div>
    `;
  }
}

// Export plugin instance
export default new MatrixNotificationPlugin();
```

### Plugin UI Integration

Plugins can contribute UI components that integrate seamlessly:

```typescript
// client/src/plugins/services/plugin-loader.ts
export class PluginLoader {
  private loadedPlugins = new Map<string, LoadedPlugin>();

  async loadPlugin(manifest: PluginManifest): Promise<void> {
    try {
      // Load plugin bundle
      const module = await this.loadPluginModule(manifest);
      
      // Register UI contributions
      if (manifest.contributes?.ui) {
        for (const contribution of manifest.contributes.ui) {
          await this.registerUiContribution(manifest.id, contribution, module);
        }
      }

      // Register widget contributions
      if (manifest.contributes?.widgets) {
        for (const widget of manifest.contributes.widgets) {
          this.widgetRegistry.register({
            id: `${manifest.id}.${widget.id}`,
            component: module[widget.component],
            zone: widget.zone,
            priority: widget.priority
          });
        }
      }

      this.loadedPlugins.set(manifest.id, {
        manifest,
        module,
        status: 'loaded'
      });

    } catch (error) {
      console.error(`Failed to load plugin ${manifest.id}:`, error);
      throw error;
    }
  }

  private async loadPluginModule(manifest: PluginManifest): Promise<any> {
    // Dynamically import plugin bundle
    const pluginUrl = `/api/plugins/${manifest.id}/bundle.js`;
    return import(/* webpackIgnore: true */ pluginUrl);
  }

  private async registerUiContribution(
    pluginId: string,
    contribution: UiContribution,
    module: any
  ): Promise<void> {
    switch (contribution.type) {
      case 'page':
        this.routeRegistry.register({
          path: `/plugins/${pluginId}/${contribution.route}`,
          component: module[contribution.component],
          title: contribution.title,
          icon: contribution.icon
        });
        break;

      case 'panel':
        this.panelRegistry.register({
          id: `${pluginId}.${contribution.id}`,
          component: module[contribution.component],
          location: contribution.location,
          title: contribution.title
        });
        break;

      case 'action':
        this.actionRegistry.register({
          id: `${pluginId}.${contribution.id}`,
          handler: module[contribution.handler],
          label: contribution.label,
          icon: contribution.icon,
          contexts: contribution.contexts
        });
        break;
    }
  }
}

// React component for rendering plugin widgets
export const PluginWidget: React.FC<{ zone: string }> = ({ zone }) => {
  const widgets = usePluginWidgets(zone);

  return (
    <div className="plugin-widget-zone">
      {widgets.map(widget => (
        <ErrorBoundary key={widget.id} fallback={<WidgetError />}>
          <Suspense fallback={<WidgetLoading />}>
            <widget.component />
          </Suspense>
        </ErrorBoundary>
      ))}
    </div>
  );
};
```

### Plugin Security

Security is paramount when running third-party code:

```typescript
// server/src/infrastructure/plugins/plugin-security.ts
export class PluginSecurityManager {
  private readonly permissions = new Map<string, Set<string>>();

  validatePermissions(
    pluginId: string,
    requestedPermissions: string[]
  ): ValidationResult {
    const violations: string[] = [];
    
    for (const permission of requestedPermissions) {
      if (!this.isValidPermission(permission)) {
        violations.push(`Invalid permission: ${permission}`);
      }
      
      if (this.isDangerousPermission(permission)) {
        violations.push(`Dangerous permission requested: ${permission}`);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  checkPermission(
    pluginId: string,
    permission: string,
    resource?: string
  ): boolean {
    const pluginPermissions = this.permissions.get(pluginId);
    if (!pluginPermissions) return false;

    // Check exact permission
    if (pluginPermissions.has(permission)) return true;

    // Check wildcard permissions
    const parts = permission.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join('.') + '.*';
      if (pluginPermissions.has(wildcard)) return true;
    }

    return false;
  }

  private isDangerousPermission(permission: string): boolean {
    const dangerous = [
      'system.exec',
      'system.write',
      'network.raw',
      'plugins.manage'
    ];
    
    return dangerous.includes(permission);
  }
}

// Rate limiting for plugin API calls
export class PluginRateLimiter {
  private limits = new Map<string, RateLimit>();

  async checkLimit(
    pluginId: string,
    operation: string
  ): Promise<boolean> {
    const key = `${pluginId}:${operation}`;
    const limit = this.limits.get(key) || this.createLimit(key);

    const allowed = await limit.check();
    
    if (!allowed) {
      this.logger.warn(`Rate limit exceeded for ${key}`);
    }

    return allowed;
  }

  private createLimit(key: string): RateLimit {
    const limit = new RateLimit({
      id: key,
      max: 100,
      duration: 60000, // 1 minute
      strategy: 'sliding-window'
    });

    this.limits.set(key, limit);
    return limit;
  }
}
```

## Real-World Impact

The plugin system has transformed SSM:

- **50+ community plugins** in the first 6 months
- **Custom integrations** for enterprise users
- **Reduced core complexity** by moving features to plugins
- **Faster innovation** through community contributions
- **Better stability** with isolated plugin execution

## Popular Plugins Built by the Community

1. **Grafana Integration**: Export metrics to Grafana
2. **Backup Manager**: Automated backup scheduling  
3. **Security Scanner**: Vulnerability scanning integration
4. **Cost Calculator**: Track resource costs
5. **Custom Dashboards**: Industry-specific monitoring views

## Lessons Learned

Building a plugin system taught us:

1. **API design is forever**: Once published, plugin APIs can't easily change
2. **Sandboxing is hard**: Balance security with functionality
3. **Documentation is critical**: Plugin developers need excellent docs
4. **Community is everything**: Foster and support plugin developers
5. **Dogfood your own APIs**: Build core features as plugins

## Building Your Own Plugin

Getting started is easy:

```bash
# Install plugin generator
npm install -g @ssm/create-plugin

# Create new plugin
create-ssm-plugin my-awesome-plugin

# Develop with hot reload
cd my-awesome-plugin
npm run dev

# Build for distribution
npm run build
```

Example plugin structure:
```
my-awesome-plugin/
├── manifest.json
├── package.json
├── src/
│   ├── index.ts
│   ├── api/
│   ├── components/
│   └── services/
├── dist/
└── README.md
```

## What's Next?

We're expanding the plugin ecosystem:

- **Plugin marketplace**: Discover and install plugins from the UI
- **Plugin dependencies**: Plugins depending on other plugins
- **WASM plugins**: Write plugins in any language
- **Cloud functions**: Serverless plugin execution
- **Revenue sharing**: Monetization for plugin developers

## Join the Ecosystem

The SSM plugin ecosystem is growing rapidly. Whether you want to:
- Build integrations with your tools
- Add custom monitoring capabilities
- Create industry-specific features
- Contribute to existing plugins

There's a place for you in our community.

```bash
# Get started with SSM + plugins
docker run -d \
  -p 8080:8000 \
  -v /path/to/plugins:/plugins \
  -e PLUGIN_DIR=/plugins \
  squirrelserversmanager/ssm:latest
```

Check out our [Plugin Developer Guide](https://docs.ssm.io/plugins) and join our [Discord](https://discord.gg/your-server) to connect with other developers!

---

*Have an idea for a plugin? We'd love to see what you build! Share your creations in our [plugin showcase](https://github.com/SquirrelCorporation/awesome-ssm-plugins).*