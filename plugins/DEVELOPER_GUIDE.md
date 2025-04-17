# Squirrel Servers Manager - Plugin Developer Guide (Step-by-Step)

Welcome, plugin developer! This guide provides step-by-step instructions to create a custom plugin for the Squirrel Servers Manager (SSM) application. Plugins allow you to extend SSM's functionality with new backend features, API endpoints, and custom user interfaces integrated directly into the main application.

**Goal:** Create a plugin with optional backend API endpoints and an optional frontend UI component.

---

## Step 1: Set Up Your Development Environment

First, let's get your basic project structure and dependencies in place.

1.  **Install Prerequisites:** Make sure you have **Node.js** (LTS version 18.x or higher recommended) and **npm** (or yarn) installed.
2.  **Create Plugin Folder:** Choose a unique name for your plugin using **kebab-case** (e.g., `my-stats-plugin`). Create a directory with this name.
    ```bash
    mkdir my-stats-plugin
    cd my-stats-plugin
    ```
3.  **Initialize npm Package:** Start your `package.json` file.
    ```bash
    npm init -y
    ```
    *(You can edit the details in `package.json` later)*.
4.  **Install Core Dev Dependencies:** Add TypeScript and essential types.
    ```bash
    npm install --save-dev typescript @types/node
    ```
5.  **Install NestJS Dev Dependencies:** The host uses NestJS, so your plugin needs its types and core modules, even if you don't create complex NestJS structures within the plugin itself.
    ```bash
    npm install --save-dev @nestjs/common @nestjs/core reflect-metadata rxjs
    ```
    *(Consider adding these to `peerDependencies` in `package.json` later)*.

---

## Step 2: Create Basic Configuration and Structure

Now, set up the essential configuration files and the basic folder layout.

1.  **Create `manifest.json`:** This is the most important file for SSM to recognize your plugin. Create `manifest.json` in the root of your plugin folder (`my-stats-plugin/manifest.json`).

    ```json
    {
      "id": "my-stats-plugin",   frequenteREQUIRED: Unique ID (kebab-case). MUST match folder name ideally.
      "name": "My Stats Plugin",   frequenteREQUIRED: Human-readable name.
      "version": "0.0.1",          frequenteREQUIRED: Initial version (SemVer).
      "description": "Displays server statistics.", // REQUIRED: Brief description.
      "entryPoint": "dist/index.js" // REQUIRED: Path to compiled server entry point.
    }
    ```
    *   **`id`:** Critical for URLs and identification. Use the same kebab-case name as your folder.
    *   We'll add `database` and `client` sections later if needed.

2.  **Create `tsconfig.json`:** This configures the TypeScript compiler. Create `tsconfig.json` in the root.

    ```json
    {
      "compilerOptions": {
        "module": "CommonJS",
        "target": "ES2017",
        "outDir": "./dist",     // Output compiled JS here
        "rootDir": "./src",     // Look for TS source files here
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "experimentalDecorators": true, // Often needed if using NestJS decorators
        "emitDecoratorMetadata": true   // Often needed if using NestJS decorators
      },
      "include": ["src/**/*"], // Compile files inside src
      "exclude": ["node_modules", "dist"] // Ignore these folders
    }
    ```

3.  **Create Directory Structure:** Set up the basic folders.
    ```bash
    mkdir src public dist
    touch src/index.ts # Create the main server entry file
    ```

4.  **Create `.gitignore`:** Prevent unnecessary files from being committed to Git. Create `.gitignore` in the root.
    ```
    node_modules
    dist
    public/client
    *.tsbuildinfo
    *.tar.gz
    *.sha256
    .DS_Store
    ```

---

## Step 3: Implement the Server-Side (Backend)

Let's create the minimum backend logic. Every plugin needs a server-side entry point.

1.  **Edit `src/index.ts`:** This file must export an object named `Plugin`. Start with the basic `register` method.

    ```typescript
    // src/index.ts
    import { INestApplication } from '@nestjs/common';

    // Define the context interfaces expected from the host
    interface PluginLogger {
      info: (message: string, ...meta: any[]) => void;
      warn: (message: string, ...meta: any[]) => void;
      error: (message: string, ...meta: any[]) => void;
      debug: (message: string, ...meta: any[]) => void;
    }

    interface PluginContext {
      logger: PluginLogger;
      dbConnection?: any; // Define more specifically if using database (e.g., mongoose.Connection)
    }

    const pluginImplementation = {
      loggerInstance: null as PluginLogger | null,

      /**
       * Called by the host when the plugin loads. Use for initialization.
       */
      async register(app: INestApplication, context: PluginContext): Promise<void> {
        // Store the logger provided by the host
        this.loggerInstance = context.logger;
        if (!this.loggerInstance) {
            // Fallback if context doesn't provide logger (shouldn't happen)
            this.loggerInstance = console as any;
            this.loggerInstance.warn('Logger not found in context, using console.');
        }

        this.loggerInstance.info('Registering My Stats Plugin...');

        // --- Add any plugin-specific initialization logic here ---
        // Example: Setup internal services, read config, etc.

        this.loggerInstance.info('My Stats Plugin registered successfully!');
      }

      // We will add registerRoutes later if needed
    };

    // Export the implementation object AS 'Plugin' for the host to find
    export const Plugin = pluginImplementation;
    ```
    *   We define the `PluginContext` and `PluginLogger` interfaces to know what the host will give us.
    *   The `register` method receives the NestJS `app` instance (rarely needed) and the `context`.
    *   We grab the `logger` from the context and store it. **Always use `this.loggerInstance.info(...)` etc., instead of `console.log`**.

2.  **Add API Routes (Optional):** If your plugin needs to provide backend API endpoints:
    *   **Define `RouteDefinition`:** Add this interface definition in `src/index.ts` (or a shared types file).
        ```typescript
        // Add near other interface definitions
        interface RouteDefinition {
          path: string; // Relative path (e.g., '/', '/data')
          method: 'get' | 'post' | 'put' | 'delete' | 'patch'; // HTTP method
          handler: (req: any, res: any, logger: PluginLogger) => void; // Handler function
          description?: string;
        }
        ```
    *   **Implement Route Handlers:** Write functions to handle requests.
        ```typescript
        // Add before the pluginImplementation object
        const getStatsHandler = (req: any, res: any, logger: PluginLogger) => {
          logger.info('Handling GET /stats request');
          res.json({
            cpu: Math.random(),
            memoryUsed: Math.random() * 1024,
          });
        };
        ```
    *   **Implement `registerRoutes`:** Add this method to the `pluginImplementation` object.
        ```typescript
        // Inside pluginImplementation object
        registerRoutes(): RouteDefinition[] {
          if (!this.loggerInstance) {
              console.error("Cannot register routes: logger not initialized!");
              return [];
          }
          const logger = this.loggerInstance; // Closure to pass logger to handlers
          this.loggerInstance.info('Providing API routes...');
          return [
            {
              path: '/stats', // Becomes GET /plugins/my-stats-plugin/stats
              method: 'get',
              handler: (req, res) => getStatsHandler(req, res, logger), // Pass logger
              description: 'Get current server stats.'
            }
            // Add more routes...
          ];
        }
        ```

3.  **Use Database (Optional):**
    *   **Add `"database"` to `manifest.json`:** Specify a *unique* database name (e.g., `"database": "stats_plugin_db"`). **Cannot be the main SSM database name.**
    *   **Modify `PluginContext`:** Define `dbConnection` more specifically if you use Mongoose: `dbConnection?: mongoose.Connection;`. Install Mongoose types: `npm install --save-dev @types/mongoose`. Install Mongoose itself if using it directly: `npm install mongoose`.
    *   **Use `context.dbConnection` in `register`:** The host will provide an isolated Mongoose connection if you requested a database. Use it to create your models.
        ```typescript
        // Example in register method:
        import { createStatsModel, IStats } from './models/stats'; // Assume model defined elsewhere
        import mongoose from 'mongoose'; // If using the type
        // ...
        private statsModel: mongoose.Model<IStats> | null = null;
        // ...
        async register(app: INestApplication, context: PluginContext): Promise<void> {
           // ... logger setup ...
           if (context.dbConnection) {
               this.loggerInstance.info('Initializing stats model...');
               this.statsModel = createStatsModel(context.dbConnection);
           } else {
               this.loggerInstance.warn('Database connection not provided, DB features disabled.');
           }
           // ... rest of register ...
        }
        ```
    *   **Use Model in Handlers:** Access the initialized model in your route handlers (e.g., `this.statsModel.find(...)`).

---

## Step 4: Implement the Client-Side (Frontend UI - Optional)

Follow these steps *only* if your plugin needs to display a user interface within SSM.

1.  **Install Frontend Dependencies:**
    ```bash
    npm install react react-dom antd
    npm install --save-dev @types/react @types/react-dom webpack webpack-cli ts-loader copy-webpack-plugin @babel/core babel-loader @babel/preset-react @babel/preset-typescript
    # Add react, react-dom, antd to peerDependencies in package.json
    ```
2.  **Create `webpack.config.js`:** Create this file in the root of your plugin folder. This configuration is *very specific*.

    ```javascript
    const path = require("path");
    const webpack = require("webpack");
    const { ModuleFederationPlugin } = webpack.container;
    const CopyPlugin = require("copy-webpack-plugin");

    // ---!!! MUST CONFIGURE THESE !!!---
    const pluginKebabCaseId = "my-stats-plugin"; // Must match manifest.json 'id'
    const pluginCamelCaseName = "myStatsPlugin"; // Convert kebab-case to camelCase
    const exposedComponentPath = "./src/client/MyStatsComponent.tsx"; // Path to your main React component
    const exposedComponentKey = "./MyStatsComponent"; // Key for exposes (MUST match manifest.json 'client.exposedModule')
    // ------------------------------------

    const sharedConfig = {
      react: { singleton: true, requiredVersion: false },
      "react-dom": { singleton: true, requiredVersion: false },
      antd: { singleton: true, requiredVersion: false },
    };

    module.exports = {
      mode: "production",
      entry: "./src/client/index.tsx", // Client entry point
      output: {
        path: path.resolve(__dirname, "public/client"), // MUST be public/client
        publicPath: `/static-plugins/client/${pluginKebabCaseId}/`, // MUST match this structure
        clean: true,
      },
      resolve: { extensions: [".tsx", ".ts", ".js", ".jsx"] },
      module: { rules: [ { test: /\.(ts|tsx)$/, exclude: /node_modules/, use: ["ts-loader"] } ] },
      plugins: [
        new ModuleFederationPlugin({
          name: pluginCamelCaseName, // MUST be camelCase ID
          library: { type: "window", name: pluginCamelCaseName }, // MUST match name
          filename: "remoteEntry.js", // MUST be remoteEntry.js
          exposes: {
            [exposedComponentKey]: exposedComponentPath,
          },
          shared: sharedConfig,
        }),
        new CopyPlugin({
          patterns: [
            // Copies src: public/icon.svg -> dest: public/client/icon.svg
            // Build will fail if icon.svg is missing in public/.
            { from: "public/icon.svg", to: "icon.svg", noErrorOnMissing: false },
            // Add more patterns for other assets...
          ],
        }),
      ],
      devtool: "source-map",
    };
    ```
    *   **CRITICAL:** You **must** correctly set `pluginKebabCaseId`, `pluginCamelCaseName`, `exposedComponentPath`, and `exposedComponentKey`.
    *   The `CopyPlugin` is used here to copy your required `public/icon.svg` to the `public/client/` output directory. Ensure the icon exists.

3.  **Create Client Source Files:**
    *   **`src/client/MyStatsComponent.tsx`** (Example component):
        ```typescript
        import React, { useState, useEffect } from 'react';
        import { Spin, message, Card, Descriptions } from 'antd';

        const API_BASE_URL = '/plugins/my-stats-plugin'; // Use your plugin ID

        const MyStatsComponent: React.FC = () => {
            const [stats, setStats] = useState<any>(null);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                const fetchStats = async () => {
                    setLoading(true);
                    try {
                        const response = await fetch(`${API_BASE_URL}/stats`);
                        if (!response.ok) throw new Error('Failed to fetch stats');
                        const data = await response.json();
                        setStats(data);
                    } catch (error: any) {
                        message.error(`Error: ${error.message}`);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchStats();
                // Optional: Set up interval to refresh stats
                // const intervalId = setInterval(fetchStats, 5000);
                // return () => clearInterval(intervalId);
            }, []);

            if (loading) {
                return <Spin tip="Loading stats..." />;
            }

            if (!stats) {
                return <p>Could not load stats.</p>;
            }

            return (
                <Card title="Server Stats">
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="CPU Usage">{stats.cpu?.toFixed(2)}%</Descriptions.Item>
                        <Descriptions.Item label="Memory Used">{stats.memoryUsed?.toFixed(0)} MB</Descriptions.Item>
                        {/* Add more stats */}
                    </Descriptions>
                </Card>
            );
        };

        export default MyStatsComponent;
        ```
    *   **`src/client/index.tsx`** (Entry point, just exports the component):
        ```typescript
        // src/client/index.tsx
        import MyStatsComponent from './MyStatsComponent';
        export default MyStatsComponent;
        ```

4.  **Update `manifest.json`:** Add the `client` section.
    ```json
    {
      "id": "my-stats-plugin",
      "name": "My Stats Plugin",
      "version": "1.0.0",
      "description": "Displays server statistics.",
      "entryPoint": "dist/index.js",
      "client": {
        "remoteEntryRelativePath": "public/client/remoteEntry.js", // REQUIRED: Use this exact value
        "exposedModule": "./MyStatsComponent", // REQUIRED: Must match key in webpack exposes
        "componentName": "MyStatsComponent",   // REQUIRED: Must match the component's export name
        "hasDedicatedPage": true              // Optional: Set true for /plugins/my-stats-plugin page
      }
    }
    ```

5.  **Add Plugin Icon (Required):** Create `public/icon.svg` with your plugin's icon (SVG format is recommended). The `CopyPlugin` in `webpack.config.js` will copy it to `public/client/icon.svg` during the build. **The build will fail if this file is missing.**

---

## Step 5: Build the Plugin

1.  **Add Build Scripts to `package.json`:** Make sure you have the `build:server`, `build:client` (if applicable), and `build` scripts defined (see [package.json](#packagejson) section above).
2.  **Run Build:**
    ```bash
    npm run build
    ```
    This compiles `src/` to `dist/` (server) and bundles `src/client/` to `public/client/` (client). Verify these output folders are created correctly.

---

## Step 6: Package the Plugin

1.  **Add Package Scripts to `package.json`:** Ensure you have the `clean`, `prepackage`, `package`, and `postpackage` scripts (see [package.json](#packagejson) section). Remember to customize the plugin name in the `clean` script.
2.  **Run Packaging:**
    ```bash
    npm run package
    ```
    This creates `my-stats-plugin-vX.X.X.tar.gz` and `my-stats-plugin-vX.X.X.tar.gz.sha256`. The `.tar.gz` file is your distributable plugin archive.

---

## Step 7: Testing During Development

Once you have some basic server or client code, you need to make the plugin available to the running SSM host application for testing. Here are the common ways to do this:

### Method 1: Using `npm link` (Recommended)

This method creates a symbolic link, allowing the host application to use your plugin code directly from its development directory. Changes are reflected quickly after rebuilding.

1.  **Build:** `npm run build` in your *separate* plugin project directory.
2.  **Link Globally:** In your plugin directory (`my-stats-plugin/`), run:
    ```bash
    npm link
    ```
3.  **Link in Host:** Navigate to the main SSM server's root directory in your terminal and run:
    ```bash
    npm link my-stats-plugin # Use your plugin's package name from package.json
    ```
4.  **Restart SSM Server:** Stop and start the main SSM server process. It should now load your plugin via the symbolic link.

### Method 2: Direct Development in Host Plugins Folder (Alternative)

Alternatively, you can choose to create and develop your plugin directly within the host's plugin directory. This avoids the linking step but mixes your source code with the host's runtime files.

1.  **Create Directory:** Directly create your plugin's folder inside the host's development plugins directory:
    ```bash
    mkdir <path_to_ssm_project>/.data.dev/plugins/my-stats-plugin
    cd <path_to_ssm_project>/.data.dev/plugins/my-stats-plugin
    ```
2.  **Initialize & Setup:** Inside this directory, run `npm init -y`, create your `manifest.json`, `tsconfig.json`, `src/`, `public/`, etc., as outlined in Steps 2-4.
3.  **Install Dependencies:** Run `npm install`.
4.  **Develop & Build:** Write your code in `src/`. After making changes, run the build command *inside this directory*:
    ```bash
    npm run build
    ```
5.  **Restart SSM Server:** Stop and start the main SSM server process. It will scan and load the plugin directly from this location.

**Note:** While this method might feel more direct, be mindful that your source code now resides within the SSM runtime environment, which can complicate version control and separation of concerns.

### Method 3: Manually Copying Built Files

This is less convenient for frequent changes but works if linking is problematic.

1.  **Build:** `npm run build` in your *separate* plugin project directory.
2.  **Copy:** Manually copy the entire built plugin folder (including `dist/`, `public/client/`, `manifest.json`, `package.json`, and production `node_modules/` if needed) into the SSM server's `.data.dev/plugins/` directory, replacing any existing version.
3.  **Restart SSM Server:** Stop and start the main SSM server process.

### Testing Steps (After Choosing a Method)

Once the plugin is loaded by the SSM server (using one of the methods above):

1.  **Check Server Logs:** Watch the SSM server's startup logs for messages confirming your plugin was found and registered (or for any errors).
2.  **Test Frontend:** Open the SSM frontend in your browser.
    *   Go to the "Plugins" page. Verify your plugin is listed, and its icon appears.
    *   If you set `hasDedicatedPage: true`, navigate to `/plugins/<your-plugin-id>` (e.g., `/plugins/my-stats-plugin`). Check if your UI component loads and functions correctly.
    *   Use browser developer tools (Network tab, Console tab) to debug API calls and frontend errors.
3.  **Test Backend:** Trigger any API endpoints your plugin provides (either via the UI or tools like `curl` or Postman) and check the server logs for output from your handlers.

---

## Step 8: Next Steps & Troubleshooting

*   **Review Examples:** Look at the `sample-plugin` and `todo-tasks-manager` provided with SSM for more complete examples.
*   **Refine:** Add more features, error handling, styling, etc.
*   **Troubleshooting:** Refer to the [Troubleshooting](#troubleshooting) section in the `README.md` or the end of the original `DEVELOPER_GUIDE.md` for common issues.

---

Happy Plugin Development! 