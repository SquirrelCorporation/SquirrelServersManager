# Plugin System for Squirrel Servers Manager

The plugin system allows extending the functionality of Squirrel Servers Manager with custom plugins.

## Overview

The plugin system provides a way to dynamically load and initialize plugins from a designated directory. Plugins can register custom routes and functionality with the main application.

## Plugin Structure

A valid plugin must have the following structure:

```
plugin-name/
├── manifest.json
└── index.js (or any file specified as entryPoint in manifest.json)
```

### Manifest File

The `manifest.json` file must contain the following properties:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Description of the plugin",
  "entryPoint": "index.js"
}
```

### Plugin Implementation

A plugin must export an object or class that implements the `Plugin` interface:

```typescript
export interface Plugin {
  register(app: INestApplication): Promise<void>;
  registerRoutes?(): RouteDefinition[] | Promise<RouteDefinition[]>;
}
```

Example plugin implementation:

```typescript
import { INestApplication } from '@nestjs/common';

export class Plugin {
  async register(app: INestApplication): Promise<void> {
    console.log('Plugin initialized');
    // Initialize plugin resources
  }

  async registerRoutes() {
    return [
      {
        path: '/',
        method: 'get',
        handler: (req, res) => {
          res.json({ message: 'Hello from plugin' });
        },
        description: 'Root endpoint for the plugin'
      },
      {
        path: '/stats',
        method: 'get',
        handler: (req, res) => {
          res.json({ status: 'ok', uptime: process.uptime() });
        },
        description: 'Get plugin statistics'
      }
    ];
  }
}
```

## Plugin Routes

Routes registered by plugins are available at:

```
/plugins/{plugin-name}/{route-path}
```

For example, if a plugin named "sample-plugin" registers a route with path "/stats", it will be accessible at:

```
/plugins/sample-plugin/stats
```

## Plugin System Architecture

The plugin system consists of the following components:

1. **PluginSystem**: Singleton class responsible for scanning, loading, and initializing plugins
2. **PluginModule**: NestJS module that provides the PluginSystem as a provider
3. **PluginsController**: Controller that exposes plugin information via API

## Adding a New Plugin

1. Create a new directory in the `plugins` directory at the project root
2. Create a `manifest.json` file with the required properties
3. Implement the plugin functionality in the entry point file
4. Restart the server to load the new plugin

## Plugin API

The plugin system exposes the following API endpoints:

- `GET /plugins`: List all installed plugins with their manifest information 