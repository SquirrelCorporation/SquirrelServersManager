// Sample plugin using the new route-based architecture
// This plugin demonstrates a simple way to define backend routes
// without using the full NestJS framework within the plugin itself.
import { INestApplication } from "@nestjs/common";

// --- Type Definitions (Redefined to match host expectations) ---

/**
 * Interface for the logger provided by the host application context.
 */
interface PluginLogger {
  info: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
  debug: (message: string, ...meta: any[]) => void;
}

/**
 * Interface for the context object provided by the host to the register method.
 */
interface PluginContext {
  logger: PluginLogger;
  // Add other context properties if the host provides them (e.g., dbConnection)
}

/**
 * Redefinition of the RouteDefinition interface expected by the host server.
 * This describes a single backend API route provided by the plugin.
 */
interface RouteDefinition {
  /**
   * The relative path for the route (e.g., '/', '/stats').
   * The server will automatically prefix this with `/plugins/<plugin-id>`.
   */
  path: string;
  /**
   * The HTTP method for the route.
   */
  method: "get" | "post" | "put" | "delete" | "patch" | "options" | "head";
  /**
   * The handler function to execute when the route is matched.
   * Receives Express-like request (req), response (res), and the logger instance.
   */
  handler: (req: any, res: any, logger: PluginLogger) => void; // Added logger argument
  /**
   * Optional description of the route's purpose.
   */
  description?: string;
}

// --- Route Handler Functions ---
// These functions implement the logic for each specific API endpoint.

/**
 * Handler for the GET / route.
 * Returns basic static information about the plugin.
 * @param logger Logger instance provided by the plugin system.
 */
const getInfo = (req: any, res: any, logger: PluginLogger) => {
  logger.info("Handling GET / request for sample-plugin");
  res.json({
    name: "Sample Plugin",
    version: "1.0.0",
    status: "active",
  });
};

/**
 * Handler for the GET /stats route.
 * Returns randomly generated statistics as an example.
 * @param logger Logger instance provided by the plugin system.
 */
const getStats = (req: any, res: any, logger: PluginLogger) => {
  logger.info("Handling GET /stats request for sample-plugin");
  res.json({
    cpu: Math.round(Math.random() * 100),
    memory: Math.round(Math.random() * 1024),
    uptime: Math.round(Date.now() / 1000),
    connections: Math.round(Math.random() * 100),
  });
};

/**
 * Handler for the GET /config route.
 * Returns a sample configuration object.
 * @param logger Logger instance provided by the plugin system.
 */
const getConfig = (req: any, res: any, logger: PluginLogger) => {
  logger.info("Handling GET /config request for sample-plugin");
  res.json({
    features: {
      monitoring: true,
      notifications: true,
      reporting: false,
    },
    settings: {
      interval: 5000,
      retention: "30d",
      threshold: 90,
    },
  });
};

// --- Plugin Implementation ---
// This object defines the plugin's behavior and interaction points with the host.
const plugin = {
  // Store logger instance when registered
  loggerInstance: null as PluginLogger | null,

  /**
   * The `register` method is called by the host during plugin initialization.
   * It receives the main NestJS application instance and the plugin context.
   * @param app The main NestJS application instance.
   * @param context Object containing shared resources like the logger.
   */
  async register(app: INestApplication, context: PluginContext): Promise<void> {
    // Added context parameter
    // Store logger instance from context
    this.loggerInstance = context.logger;
    if (!this.loggerInstance) {
      console.error("Sample Plugin: Logger was not provided in the context!");
      // Fallback to console if logger is missing (shouldn't happen in prod)
      this.loggerInstance = console as any;
    }

    this.loggerInstance.info("Registering Sample Plugin...");

    // Example: Perform custom initialization here if needed.
    // const myService = new MyPluginService(this.loggerInstance);
    // await myService.connectToDatabase();

    this.loggerInstance.info("Sample Plugin registered successfully!");
  },

  /**
   * The `registerRoutes` method is called by the host to get the API routes
   * provided by this plugin.
   * @returns An array of RouteDefinition objects.
   */
  registerRoutes(): RouteDefinition[] {
    // Ensure logger is available before registering routes
    if (!this.loggerInstance) {
      console.error(
        "Cannot register routes for Sample Plugin: Logger not initialized!"
      );
      return [];
    }
    const logger = this.loggerInstance; // Use the stored logger instance

    logger.info("Registering Sample Plugin routes...");

    // Return an array defining each route the plugin exposes.
    return [
      {
        path: "/", // Becomes GET /plugins/sample-plugin/
        method: "get",
        // Wrap original handler to pass the logger instance
        handler: (req, res) => getInfo(req, res, logger),
        description: "Get basic information about the sample plugin",
      },
      {
        path: "/stats", // Becomes GET /plugins/sample-plugin/stats
        method: "get",
        handler: (req, res) => getStats(req, res, logger),
        description: "Get random statistics from the sample plugin",
      },
      {
        path: "/config", // Becomes GET /plugins/sample-plugin/config
        method: "get",
        handler: (req, res) => getConfig(req, res, logger),
        description: "Get configuration options for the sample plugin",
      },
      // Add more routes here following the same structure.
    ];
  },
};

// --- Exports ---

// Export the plugin object using a named export `Plugin`.
// This specific export name might be expected by the host loading mechanism.
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Plugin = plugin;

// Provide a default export as well for compatibility or alternative loading methods.
export default plugin;
