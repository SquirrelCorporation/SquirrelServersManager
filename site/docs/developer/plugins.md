---
layout: FeatureGuideLayout
title: "Plugin System"
icon: 🧩
time: 15 min read
signetColor: '#3a5ccc'
nextStep:
  icon: 💡
  title: Why Create a Plugin
  description: Learn about the benefits of creating plugins
  link: /docs/developer/why-create-a-plugin
credits: true
---

:::tip In a Nutshell (🌰)
- Squirrel Servers Manager supports extensibility through a robust plugin system
- Plugins can add both backend functionality (API endpoints, services) and frontend UI components
- Frontend components integrate through Module Federation for seamless UI integration
- Built-in tools like the Plugin Generator CLI simplify plugin creation
:::

:::info Latest Documentation
For the absolute latest updates, examples, and potential template changes, please refer to the canonical documentation within the [SquirrelServersManager-Plugins repository](https://github.com/SquirrelCorporation/SquirrelServersManager-Plugins).
:::

## Overview

The Squirrel Servers Manager Plugin System allows developers to extend the application's functionality with custom features. Plugins can add new server-side capabilities, API endpoints, and client-side user interfaces that integrate seamlessly with the main application.

The plugin architecture follows a modular design that separates concerns between:

1. **Server-side logic**: Implemented using a simple adapter pattern with support for custom API routes
2. **Client-side UI**: Implemented using React components integrated via Module Federation
3. **Database access**: Optional MongoDB integration for plugins that need persistent storage

![Plugin Architecture](/images/plugin-architecture.svg)

## Plugin Structure

A typical plugin follows this structure:

```
your-plugin-name/
├── dist/                     # Compiled server-side code
├── public/
│   └── client/               # Bundled client-side assets
│       ├── remoteEntry.js    # Module Federation entry point
│       └── icon.svg          # Plugin icon
├── src/
│   ├── client/               # Source files for client-side components
│   │   ├── index.tsx         # Entry point for webpack client build
│   │   └── YourComponent.tsx # Main plugin UI component
│   └── index.ts              # Server-side entry point
├── manifest.json             # Plugin metadata
├── package.json              # Node.js package definition
├── tsconfig.json             # TypeScript configuration
└── webpack.config.js         # Webpack configuration for client-side
```

### The Manifest File

The `manifest.json` file is the cornerstone of every plugin, defining its identity and capabilities:

```json
{
  "id": "my-plugin",           // Required: Unique kebab-case identifier
  "name": "My Plugin",         // Required: Human-readable name
  "version": "1.0.0",          // Required: SemVer version
  "description": "Plugin description",  // Required: Brief description
  "entryPoint": "dist/index.js",  // Required: Server entry point path
  "staticDir": "public",       // Optional: Static files directory
  "database": "my_plugin_db",  // Optional: Custom database name
  "client": {                  // Optional: Include only for UI plugins
    "remoteEntryRelativePath": "public/client/remoteEntry.js",
    "exposedModule": "./MyPluginComponent",
    "componentName": "MyPluginComponent",
    "hasDedicatedPage": true   // Creates a route at /plugins/<id>
  }
}
```

## Creating Your First Plugin

The easiest way to create a new plugin is to use the included Plugin Generator CLI:

1. **Install the generator** (one-time setup):

```bash
cd plugins/plugin-generator
npm install
npm run build
npm link
```

2. **Generate a new plugin**:

```bash
generate-ssm-plugin create-plugin my-first-plugin
```

This creates a new plugin with the basic structure and boilerplate code. You can also specify options like `--no-frontend` or `--no-backend` depending on your needs.

## Backend Implementation

The server-side plugin must export an object named `Plugin` that implements two main methods:

1. **`register(app, context)`**: Called when the plugin is loaded, used for initialization
2. **`registerRoutes()`**: Returns an array of route definitions for the plugin's API endpoints

Here's a minimal server-side implementation:

```typescript
// src/index.ts
import { INestApplication } from '@nestjs/common';

interface PluginLogger {
  info: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
  debug: (message: string, ...meta: any[]) => void;
}

interface PluginContext {
  logger: PluginLogger;
  dbConnection?: any; // Available if database is specified in manifest
}

interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: (req: any, res: any) => void;
  description?: string;
}

export const Plugin = {
  loggerInstance: null as PluginLogger | null,

  async register(app: INestApplication, context: PluginContext): Promise<void> {
    this.loggerInstance = context.logger;
    this.loggerInstance.info('Plugin initialized');
  },

  registerRoutes(): RouteDefinition[] {
    const logger = this.loggerInstance;
    return [
      {
        path: '/',
        method: 'get',
        handler: (req, res) => {
          logger?.info('Handling request');
          res.json({ status: 'ok', message: 'Hello from plugin' });
        },
        description: 'Root endpoint'
      }
    ];
  }
};
```

### API Endpoints

Plugin API endpoints are automatically mounted at `/plugins/{plugin-id}/{route-path}`. For example, a route with path `/status` in a plugin with ID `my-plugin` would be accessible at `/plugins/my-plugin/status`.

## Frontend Implementation

To add a UI component to your plugin:

1. Create a React component:

```tsx
// src/client/MyPluginComponent.tsx
import React from 'react';

const MyPluginComponent: React.FC = () => {
  return (
    <div>
      <h2>My Plugin UI</h2>
      <p>This component is loaded via Module Federation.</p>
    </div>
  );
};

export default MyPluginComponent;
```

2. Create an entry point:

```tsx
// src/client/index.tsx
import MyPluginComponent from './MyPluginComponent';
export default MyPluginComponent;
```

3. Configure webpack for Module Federation:

```javascript
// webpack.config.js
const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;

// IMPORTANT: These values must match your manifest.json
const pluginKebabCaseId = "my-plugin";
const pluginCamelCaseName = "myPlugin";

module.exports = {
  mode: "production",
  entry: "./src/client/index.tsx",
  output: {
    path: path.resolve(__dirname, "public/client"),
    publicPath: `/static-plugins/client/${pluginKebabCaseId}/`,
    clean: true,
  },
  resolve: { extensions: [".tsx", ".ts", ".js", ".jsx"] },
  module: {
    rules: [{ test: /\.(ts|tsx)$/, exclude: /node_modules/, use: ["ts-loader"] }]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: pluginCamelCaseName,
      library: { type: "window", name: pluginCamelCaseName },
      filename: "remoteEntry.js",
      exposes: {
        "./MyPluginComponent": "./src/client/MyPluginComponent.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false },
        antd: { singleton: true, requiredVersion: false },
      },
    }),
  ],
};
```

## Using Database Storage

If your plugin needs persistent storage, add a `database` field to your `manifest.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin with database storage",
  "entryPoint": "dist/index.js",
  "database": "my_plugin_db"
}
```

The plugin system will automatically:
- Create a dedicated MongoDB database for your plugin
- Provide a Mongoose connection in the `context.dbConnection` object passed to your `register` method

Example usage:

```typescript
import mongoose from 'mongoose';

// Define your schema
const TaskSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export const Plugin = {
  // ...
  taskModel: null,

  async register(app, context) {
    this.loggerInstance = context.logger;
    
    // Initialize model if database connection is available
    if (context.dbConnection) {
      this.taskModel = context.dbConnection.model('Task', TaskSchema);
      this.loggerInstance.info('Task model initialized');
    } else {
      this.loggerInstance.warn('No database connection provided');
    }
  },

  registerRoutes() {
    const logger = this.loggerInstance;
    const taskModel = this.taskModel;
    
    return [
      {
        path: '/tasks',
        method: 'get',
        handler: async (req, res) => {
          try {
            const tasks = await taskModel.find();
            res.json(tasks);
          } catch (error) {
            logger.error('Error fetching tasks', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
          }
        }
      },
      // Add other routes...
    ];
  }
};
```

## The Client-Side Plugin Lifecycle

On the client side, the plugin system follows these steps:

1. **Discovery**: The client fetches plugin metadata from the server
2. **Loading**: For plugins with UI components, the Module Federation loader loads the remote entry
3. **Initialization**: The plugin component is created and registered
4. **Rendering**: The plugin component is rendered either in a dedicated page or in extension slots

The client-side plugin loader handles:
- Dynamically loading JavaScript modules
- Sharing dependencies to avoid duplicate code
- Creating plugin instances that register components, routes, and hooks
- Rendering plugins in the appropriate locations

## Building and Packaging

To build your plugin:

1. Add build scripts to your `package.json`:

```json
"scripts": {
  "build:server": "tsc -p tsconfig.json",
  "build:client": "webpack --mode production",
  "build": "npm run build:server && npm run build:client",
  "package": "tar czf my-plugin-v1.0.0.tar.gz manifest.json package.json dist public"
}
```

2. Run the build:

```bash
npm run build
```

3. Package for distribution:

```bash
npm run package
```

The resulting `.tar.gz` file can be installed in any Squirrel Servers Manager instance.

## Plugin Installation

Plugins can be installed via the SSM web interface:

1. Go to Settings > Plugins
2. Click "Upload Plugin"
3. Select your `.tar.gz` package
4. The system will validate, install, and activate your plugin

## Advanced Topics

### Accessing Core Services

Plugins can access core SSM services through the NestJS application instance passed to the `register` method:

```typescript
async register(app: INestApplication, context: PluginContext): Promise<void> {
  // Get a core service from the NestJS container
  const devicesService = app.get('DevicesService');
  
  // Use the service
  const devices = await devicesService.findAll();
  context.logger.info(`Found ${devices.length} devices`);
}
```

### Sharing State Between Frontend and Backend

To share state between your plugin's backend and frontend components:

1. Create API endpoints in your backend to expose data
2. Use the fetch API in your React component to retrieve data

```tsx
import React, { useState, useEffect } from 'react';

const MyPluginComponent: React.FC = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/plugins/my-plugin/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Plugin Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default MyPluginComponent;
```

## Testing During Development

To test your plugin during development:

1. **Build Your Plugin:** Run `npm run build` in your plugin's directory.
2. **Link Your Plugin (Recommended):**
   - In your plugin directory: `npm link`
   - In the SSM project directory: `npm link <your-plugin-package-name>`
   - Restart the SSM server

3. **Direct Development (Alternative):**
   - Develop your plugin directly inside the SSM project's `.data.dev/plugins/` directory
   - Run `npm run build` within that directory
   - Restart the SSM server

Always check server logs and browser developer tools to troubleshoot any issues.

## Best Practices

1. **Use kebab-case for plugin IDs**: Ensures compatibility with URLs and file paths
2. **Keep dependencies minimal**: Leverage shared dependencies when possible
3. **Handle errors gracefully**: Use try/catch blocks and provide helpful error messages
4. **Clean up resources**: Implement cleanup logic for database connections and timers
5. **Use TypeScript**: Type definitions improve code quality and development experience
6. **Follow SSM UI patterns**: Match the main application's look and feel for a seamless user experience

## Troubleshooting

### Common Issues

- **Plugin not loading**: Check that your `manifest.json` is valid and `entryPoint` path is correct
- **Frontend component not appearing**: Verify webpack configuration, especially `name` and `library.name`
- **API endpoints not working**: Ensure route handlers return responses and handle errors properly

### Debugging

1. Check server logs for errors during plugin loading
2. Look for console errors in the browser developer tools
3. Verify that the plugin's `remoteEntry.js` file is being loaded correctly (Network tab)
4. Test API endpoints directly using tools like Postman or curl

## Example Plugins

Refer to the `sample-plugin` and `todo-tasks-manager` within the `plugins/` directory of the main SSM repository for more complete examples.
