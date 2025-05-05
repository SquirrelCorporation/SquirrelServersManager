# Developing Plugins

:::info Latest Documentation
This guide provides comprehensive instructions for developing SSM plugins. However, for the absolute latest updates, examples, and potential template changes, please refer to the canonical documentation within the [SquirrelServersManager-Plugins repository](https://github.com/SquirrelCorporation/SquirrelServersManager-Plugins).
:::

Squirrel Servers Manager (SSM) supports plugins to extend its functionality. You can create plugins to add new backend features, custom API endpoints, and integrate custom user interfaces directly into the main application.

This guide provides instructions for developers who want to create and distribute their own SSM plugins.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** LTS version 18.x or higher is recommended.
*   **npm** (usually included with Node.js) or **yarn**.

## Getting Started: Project Setup

1.  **Create Plugin Folder:**
    *   Choose a unique name for your plugin using **kebab-case** (e.g., `my-awesome-plugin`). This name is important as it will be used for the plugin ID.
    *   Create a directory with this name:
        ```bash
        mkdir my-awesome-plugin
        cd my-awesome-plugin
        ```

2.  **Initialize npm Package:**
    *   Create a `package.json` file:
        ```bash
        npm init -y
        ```
    *   You can edit the details (author, license, etc.) later. The `name` field should match your kebab-case folder name.

3.  **Install Core Dependencies:**
    *   Add TypeScript and essential Node.js types:
        ```bash
        npm install --save-dev typescript @types/node
        ```
    *   Add NestJS core dependencies (even if not creating complex NestJS modules internally, the host uses them):
        ```bash
        npm install --save-dev @nestjs/common @nestjs/core reflect-metadata rxjs
        ```
        :::tip Peer Dependencies
        Consider moving `@nestjs/common`, `@nestjs/core`, `reflect-metadata`, and `rxjs` to `peerDependencies` in your `package.json` later to avoid bundling them if the host provides them.
        :::

4.  **Install Frontend Dependencies (Optional):**
    *   If your plugin will have a UI component, install React, ReactDOM, and Ant Design:
        ```bash
        npm install react react-dom antd
        npm install --save-dev @types/react @types/react-dom webpack webpack-cli ts-loader copy-webpack-plugin @babel/core babel-loader @babel/preset-react @babel/preset-typescript
        ```
        :::tip Peer Dependencies (Frontend)
        `react`, `react-dom`, and `antd` should also be listed in `peerDependencies` to use the versions provided by the host application.
        :::

## Project Structure and Configuration

Set up the essential configuration files and the basic folder layout.

1.  **Create Directory Structure:**
    ```bash
    mkdir src public dist
    touch src/index.ts # Server entry point
    # If creating a UI:
    mkdir src/client
    touch src/client/index.tsx # Client entry point
    touch src/client/MyPluginComponent.tsx # Example UI component
    touch public/icon.svg # Placeholder for plugin icon
    ```

2.  **Create `manifest.json` (Required):**
    *   This file is critical for SSM to recognize and load your plugin. Create it in the root of your plugin folder.
    ```json
    {
      "id": "my-awesome-plugin",
      "name": "My Awesome Plugin",
      "version": "0.0.1",
      "description": "A brief description.",
      "entryPoint": "dist/index.js",
      "icon": "client/icon.svg", // Path relative to the 'public/' dir in the package
      "client": {
        "remoteEntryRelativePath": "public/client/remoteEntry.js",
        "exposedModule": "./MyPluginComponent",
        "componentName": "MyPluginComponent",
        "hasDedicatedPage": true
      }
    }
    ```
    *   **`id` (string, required):** Unique identifier in **kebab-case**. MUST match the folder name ideally. Used for URLs (`/plugins/<id>`).
    *   **`name` (string, required):** Human-readable name.
    *   **`version` (string, required):** SemVer version string.
    *   **`description` (string, required):** Brief description.
    *   **`entryPoint` (string, required):** Path to the compiled server entry point (relative to the package root). Almost always `"dist/index.js"`.
    *   **`icon` (string, optional):** Path to the plugin's icon (SVG recommended) relative to the `public/` directory within the packaged plugin. This icon is copied during the build process.
    *   **`client` (object, optional):** Include *only* if your plugin provides a UI component.
        *   **`remoteEntryRelativePath` (string, required):** Path to the Webpack Module Federation entry file. Use `"public/client/remoteEntry.js"`.
        *   **`exposedModule` (string, required):** The key used in the `exposes` section of your `webpack.config.js`. Typically `./YourComponentName`.
        *   **`componentName` (string, required):** The exported name of your main React component.
        *   **`hasDedicatedPage` (boolean, optional):** If `true`, creates a dedicated page for your plugin at `/plugins/<id>`.
    *   **`database` (string, optional):** If your plugin needs its own isolated database, specify a *unique* database name here (e.g., `"my_plugin_db"`). Cannot be the main SSM database name.

3.  **Create `tsconfig.json` (Required):**
    *   Configure the TypeScript compiler.
    ```json
    {
      "compilerOptions": {
        "module": "CommonJS",
        "target": "ES2017",
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "declaration": true, // Recommended for better type checking
        "sourceMap": true    // Recommended for debugging
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist", "src/client/**/*"] // Exclude client files from server build
    }
    ```

4.  **Create `webpack.config.js` (Required for UI):**
    *   Configure Webpack for bundling the client-side code using Module Federation. See the "Client-Side Implementation" section for the specific configuration details.

5.  **Create `.gitignore`:**
    *   Prevent committing unnecessary files.
    ```
    node_modules
    dist
    public/client
    *.tsbuildinfo
    *.tar.gz
    *.sha256
    .DS_Store
    ```

## Server-Side Implementation (Backend)

Every plugin needs a server-side entry point, even if it only provides a frontend UI.

1.  **Entry Point (`src/index.ts`):**
    *   This file **must** export an object named `Plugin`. The host application looks for this export.
    *   Implement the `register` method, which is called by the host during plugin loading.
    *   Optionally implement `registerRoutes` to provide API endpoints.

    ```typescript
    // src/index.ts
    import { INestApplication } from '@nestjs/common';
    import { Connection } from 'mongoose'; // Example if using database

    // Define types expected from the host context
    interface PluginLogger {
      info: (message: string, ...meta: any[]) => void;
      warn: (message: string, ...meta: any[]) => void;
      error: (message: string, ...meta: any[]) => void;
      debug: (message: string, ...meta: any[]) => void;
    }

    interface PluginContext {
      logger: PluginLogger;
      dbConnection?: Connection; // Only provided if "database" is in manifest.json
    }

    // Define structure for API routes
    interface RouteDefinition {
      path: string;
      method: 'get' | 'post' | 'put' | 'delete' | 'patch';
      handler: (req: any, res: any, logger: PluginLogger) => void;
      description?: string;
    }

    // --- Your Plugin's Implementation ---
    const pluginImplementation = {
      loggerInstance: null as PluginLogger | null,
      dbConnectionInstance: null as Connection | null,

      /**
       * Called by the host when the plugin loads. Use for initialization.
       */
      async register(app: INestApplication, context: PluginContext): Promise<void> {
        this.loggerInstance = context.logger;
        if (!this.loggerInstance) {
            this.loggerInstance = console as any; // Fallback
            this.loggerInstance.warn('Logger not found in context, using console.');
        }

        this.loggerInstance.info(`Registering ${'my-awesome-plugin'}...`);

        // Store DB connection if provided
        if (context.dbConnection) {
            this.loggerInstance.info('Database connection provided.');
            this.dbConnectionInstance = context.dbConnection;
            // Initialize Mongoose models here using this.dbConnectionInstance
            // e.g., this.myModel = createMyModel(this.dbConnectionInstance);
        }

        // Add other initialization logic (e.g., setup internal services)

        this.loggerInstance.info(`${'my-awesome-plugin'} registered successfully!`);
      },

      /**
       * Optional: Called by the host to get API routes.
       */
      registerRoutes(): RouteDefinition[] {
        if (!this.loggerInstance) {
            console.error("Cannot register routes: logger not initialized!");
            return [];
        }
        const logger = this.loggerInstance; // Use closure to pass logger to handlers

        this.loggerInstance.info('Providing API routes...');
        return [
          {
            path: '/my-data', // Route becomes /plugins/my-awesome-plugin/my-data
            method: 'get',
            handler: (req, res) => { // Access logger via closure
                logger.info('Handling GET /my-data');
                // Access DB models via this.myModel if initialized
                res.json({ message: 'Data from my awesome plugin!' });
            },
            description: 'Get awesome data.'
          }
          // Add more routes...
        ];
      }
    };

    // Export the implementation object AS 'Plugin' for the host to find
    export const Plugin = pluginImplementation;
    ```

    :::important Logger Usage
    Always use the logger provided in the `context` (e.g., `this.loggerInstance.info(...)`) instead of `console.log` for server-side logging. This ensures logs are integrated with the host application's logging system.
    :::

2.  **API Routes (Optional):**
    *   If you implement `registerRoutes`, the function should return an array of `RouteDefinition` objects.
    *   The `path` you define is relative to `/plugins/<your-plugin-id>/`.
    *   Use the `logger` instance passed via closure within your handler functions.
    *   Access any initialized database models or services via `this`.

3.  **Database Usage (Optional):**
    *   If you add the `"database"` field to your `manifest.json`, the host will create an isolated MongoDB database for your plugin and pass the Mongoose `Connection` object in `context.dbConnection`.
    *   Use this connection within the `register` method to initialize your Mongoose models.
    *   Access your models within your route handlers (e.g., `this.myModel.find(...)`).

## Client-Side Implementation (Frontend UI - Optional)

If your plugin needs a UI integrated into SSM, you must use **React** and **Webpack with Module Federation**.

1.  **Create UI Component:**
    *   Build your main React component (e.g., `src/client/MyPluginComponent.tsx`).
    *   You can use Ant Design components (`antd`), as it's shared by the host.
    *   Fetch data from your plugin's backend API routes using relative URLs like `/plugins/<your-plugin-id>/your-route`.

    ```typescript
    // src/client/MyPluginComponent.tsx (Example)
    import React, { useState, useEffect } from 'react';
    import { Spin, message, Card } from 'antd';

    const API_BASE_URL = '/plugins/my-awesome-plugin'; // Use your plugin ID

    const MyPluginComponent: React.FC = () => {
        const [data, setData] = useState<any>(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetch(`${API_BASE_URL}/my-data`)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(setData)
                .catch(err => message.error(`Failed to load plugin data: ${err.message}`))
                .finally(() => setLoading(false));
        }, []);

        if (loading) return <Spin />;
        if (!data) return <p>Error loading data.</p>;

        return (
            <Card title="My Awesome Plugin">
                <p>Data from backend: {data.message}</p>
            </Card>
        );
    };

    // MUST be the default export
    export default MyPluginComponent;
    ```

2.  **Create Client Entry Point:**
    *   Create `src/client/index.tsx` that simply exports your main component as the default export.
    ```typescript
    // src/client/index.tsx
    import MyPluginComponent from './MyPluginComponent';
    export default MyPluginComponent;
    ```

3.  **Configure `webpack.config.js` (Critical):**
    *   This file tells Webpack how to bundle your client code and expose it correctly for the host application via Module Federation.
    *   **Pay close attention to the required naming conventions and paths.**

    ```javascript
    // webpack.config.js
    const path = require("path");
    const webpack = require("webpack");
    const { ModuleFederationPlugin } = webpack.container;
    const CopyPlugin = require("copy-webpack-plugin");

    // ---!!! MUST CONFIGURE THESE !!!---
    const pluginKebabCaseId = "my-awesome-plugin"; // Must match manifest.json 'id'
    const pluginCamelCaseName = "myAwesomePlugin"; // Convert kebab-case to camelCase
    const exposedComponentPath = "./src/client/MyPluginComponent.tsx"; // Path to your main React component file
    const exposedComponentKey = "./MyPluginComponent"; // Key for exposes (MUST match manifest.json 'client.exposedModule')
    // ------------------------------------

    const sharedConfig = {
      react: { singleton: true, requiredVersion: false },
      "react-dom": { singleton: true, requiredVersion: false },
      antd: { singleton: true, requiredVersion: false },
      // Add other libraries shared with the host if needed
    };

    module.exports = {
      mode: "production", // Use 'development' for easier debugging if needed
      entry: "./src/client/index.tsx", // Client entry point
      output: {
        // CRITICAL: Output MUST be to 'public/client' relative to package root
        path: path.resolve(__dirname, "public/client"),
        // CRITICAL: publicPath structure MUST follow this pattern
        publicPath: `/static-plugins/client/${pluginKebabCaseId}/`,
        filename: 'bundle.[contenthash].js', // Use contenthash for caching
        chunkFilename: '[name].[contenthash].js',
        clean: true, // Clean the output directory before build
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: ["ts-loader"], // Or babel-loader with presets
          },
          // Add loaders for CSS, images, etc. if needed
        ],
      },
      plugins: [
        new ModuleFederationPlugin({
          // CRITICAL: 'name' MUST be the camelCase version of your plugin ID
          name: pluginCamelCaseName,
          // CRITICAL: 'library' config is required for the host to find the module
          library: { type: "window", name: pluginCamelCaseName }, // Must match 'name'
          // CRITICAL: 'filename' MUST be 'remoteEntry.js'
          filename: "remoteEntry.js",
          exposes: {
            // CRITICAL: Key MUST match 'exposedModule' in manifest.json
            // CRITICAL: Value is the relative path to your component file from root
            [exposedComponentKey]: exposedComponentPath,
          },
          shared: sharedConfig, // Share dependencies with the host
        }),
        // CRITICAL: Copy the required icon from public/ source to public/client/ output
        new CopyPlugin({
          patterns: [
            { from: "public/icon.svg", to: "icon.svg", noErrorOnMissing: false },
            // Copy other static assets if needed
          ],
        }),
      ],
      devtool: "source-map", // Optional: 'source-map' for production, 'eval-source-map' for dev
    };
    ```

    :::danger Webpack Configuration
    The `output.path`, `output.publicPath`, `ModuleFederationPlugin.name`, `ModuleFederationPlugin.library.name`, `ModuleFederationPlugin.filename`, and the key in `ModuleFederationPlugin.exposes` **must** follow the exact patterns and conventions shown. Mismatches will prevent the host application from loading your plugin's UI.
    :::

4.  **Add Plugin Icon (Required for UI):**
    *   Place an SVG icon for your plugin at `public/icon.svg`.
    *   The `CopyPlugin` in `webpack.config.js` copies this to the build output (`public/client/icon.svg`).
    *   Ensure the `icon` field in `manifest.json` points to `"client/icon.svg"`.
    *   The build will fail if `public/icon.svg` is missing when the `CopyPlugin` runs.

## Building the Plugin

Add scripts to your `package.json` to streamline the build process.

```json
// package.json (scripts section)
"scripts": {
  "build:server": "tsc -p tsconfig.json",
  "build:client": "webpack --mode production", // Or --mode development
  "build": "npm run build:server && npm run build:client", // Adjust if no client needed
  // Add clean script (see Packaging section)
  // ... other scripts ...
},
```

Run the build:

```bash
npm run build
```

This compiles the server code to `dist/` and bundles the client code (if any) to `public/client/`.

## Packaging for Distribution

Plugins are distributed as `.tar.gz` archives containing the compiled code, assets, manifest, and production dependencies.

Add standardized packaging scripts to `package.json`:

```json
// package.json (scripts section additions)
"scripts": {
  // ... build scripts ...
  "clean": "rm -rf dist public/client ${npm_package_name}-*.tar.gz ${npm_package_name}-*.sha256",
  "prepackage": "npm run clean && npm run build && npm install --omit=dev",
  "package": "tar czf ${npm_package_name}-v${npm_package_version}.tar.gz --exclude='src' --exclude='*.tsbuildinfo' --exclude='webpack.config.js' --exclude='tsconfig.json' --exclude='.git' --exclude='.gitignore' --exclude='${npm_package_name}-*.tar.gz' --exclude='${npm_package_name}-*.sha256' manifest.json package.json dist public node_modules && shasum -a 256 ${npm_package_name}-v${npm_package_version}.tar.gz > ${npm_package_name}-v${npm_package_version}.tar.gz.sha256",
  "postpackage": "npm install"
},
```

Run the package command:

```bash
npm run package
```

This generates:
*   `<plugin-name>-v<version>.tar.gz`: The distributable plugin archive.
*   `<plugin-name>-v<version>.tar.gz.sha256`: A checksum file for integrity verification.

The archive will contain `manifest.json`, `package.json`, `dist/`, `public/`, and `node_modules/` (production dependencies only).

## Testing During Development

To test your plugin with a running SSM instance:

1.  **Build Your Plugin:** Run `npm run build` in your plugin's directory.
2.  **Link Your Plugin (Recommended):**
    *   In your plugin directory: `npm link`
    *   In the SSM project directory: `npm link <your-plugin-package-name>`
    *   Restart the SSM server. Changes require rebuilding the plugin (`npm run build`) and potentially restarting SSM.
3.  **Direct Development (Alternative):**
    *   Develop your plugin directly inside the SSM project's `.data.dev/plugins/` directory.
    *   Run `npm install` and `npm run build` within that directory.
    *   Restart the SSM server.
4.  **Manual Copy (Less Convenient):**
    *   Build your plugin (`npm run build`).
    *   Manually copy `dist/`, `public/`, `manifest.json`, `package.json`, and production `node_modules/` into a new folder inside SSM's `.data.dev/plugins/`.
    *   Restart the SSM server.

**Testing Steps:**

*   Check SSM server logs for registration messages or errors.
*   If you have a UI:
    *   Visit the "Plugins" page in SSM to see if your plugin is listed.
    *   If `hasDedicatedPage: true`, navigate to `/plugins/<your-plugin-id>`.
    *   Use browser developer tools to check the console and network requests.
*   Test backend API endpoints using your UI or tools like `curl`.

## Example Plugins

Refer to the `sample-plugin` and `todo-tasks-manager` within the `plugins/` directory of the main SSM repository for more complete examples. 