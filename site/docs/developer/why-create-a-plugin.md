# Why Create a Plugin?

:::info Latest Documentation
Please note that while this page outlines the benefits, the most up-to-date technical details and guides for plugin development reside in the [SquirrelServersManager-Plugins repository](https://github.com/SquirrelCorporation/SquirrelServersManager-Plugins).
:::

Squirrel Servers Manager (SSM) is designed to be extensible through a plugin system. While the core application provides a robust set of features for managing servers and infrastructure, plugins offer a powerful way to tailor SSM to specific needs, integrate external tools, or introduce entirely new functionalities.

## Key Benefits of Developing an SSM Plugin

Creating a plugin for SSM allows you to:

1.  **Leverage Existing SSM Infrastructure:**
    *   **Access Core APIs:** Your plugin's backend code runs within the main SSM server environment. While direct access to internal services isn't the primary mechanism, you can interact with the core SSM features through its existing REST API endpoints just like the main frontend does. This allows you to fetch data about devices, playbooks, users, logs, etc., and trigger actions managed by SSM.
    *   **Utilize Authentication:** Plugins can benefit from SSM's existing user authentication and authorization mechanisms.

2.  **Manage Dedicated Data:**
    *   **Isolated Database:** By declaring a `database` field in your `manifest.json`, SSM will automatically provision a dedicated, isolated MongoDB database space specifically for your plugin. This ensures your plugin's data doesn't interfere with the core application data or other plugins.
    *   **Data Persistence:** Store and retrieve configuration, state, or any other data relevant to your plugin's functionality securely.

3.  **Integrate Custom User Interfaces:**
    *   **Seamless Frontend Integration:** If your plugin requires a user interface, you can build it using React and Ant Design. Using Webpack Module Federation, your plugin's UI components are dynamically loaded and displayed within the main SSM application, providing a consistent user experience.
    *   **Dedicated Plugin Pages:** You can configure your plugin to have its own dedicated page within the SSM interface (accessible via `/plugins/<your-plugin-id>`), giving your feature a distinct space.
    *   **Custom Design:** Implement custom layouts, components, and styles within your plugin's UI to best present its features.

4.  **Extend Backend Functionality:**
    *   **Custom API Endpoints:** Expose your own REST API endpoints under the `/plugins/<your-plugin-id>/` path. This allows your plugin's frontend (or external applications) to interact with your custom backend logic.
    *   **Background Tasks:** Implement custom server-side logic, data processing, or integrations that run within the SSM environment.

## How Plugins are Packaged

To ensure easy distribution and installation, SSM plugins are packaged as simple TAR archives compressed with Gzip (`.tar.gz`).

A valid plugin archive contains:

*   `manifest.json`: The core metadata file describing the plugin.
*   `package.json`: Standard Node.js package information.
*   `dist/`: Directory containing the compiled JavaScript code for the server-side logic.
*   `public/`: Directory containing static assets, including the bundled client-side code in `public/client/` (if applicable).
*   `node_modules/`: Directory containing the plugin's *production* runtime dependencies.

Optionally, a `.sha256` checksum file can be provided alongside the archive for integrity verification during installation.

## Ready to Build?

If extending SSM with custom functionality sounds like the right approach for your needs, dive into the technical details:

➡️ **[Developing Plugins Guide](./plugins.md)** 