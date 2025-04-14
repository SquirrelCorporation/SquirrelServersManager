import { INestApplication } from "@nestjs/common";
import { Model } from "mongoose";
import { ITodo, createTodoModel } from "./models/todo";
import { PluginContext, PluginLogger, RouteDefinition } from "./plugin-types";
import { createRoutes } from "./routes";

/**
 * Main class implementing the Todo Tasks Manager plugin logic.
 * This class handles initialization (database connection, model setup)
 * and provides the API route definitions to the host.
 */
class TodoPlugin {
  // Mongoose model instance for interacting with the 'todos' collection.
  // Initialized during registration.
  private todoModel: Model<ITodo> | null = null;
  // Logger instance provided by the host application via the context.
  private logger: PluginLogger | null = null;

  /**
   * The `register` method is called by the host during plugin initialization.
   * It receives the main NestJS application instance and a plugin context object.
   * @param app The main NestJS application instance (may not be needed by all plugins).
   * @param context An object provided by the host containing shared resources like
   *                a database connection (`dbConnection`) and a logger (`logger`).
   */
  async register(app: INestApplication, context: PluginContext): Promise<void> {
    // Store the logger instance from the context for use within the plugin.
    const { logger } = context;
    this.logger = logger;
    logger.info("Initializing Todo Tasks Manager Plugin...");

    // Check if a database connection was provided in the context.
    if (context.dbConnection) {
      logger.info("Using provided database connection for Todo plugin");
      // Create the Mongoose model using the provided connection.
      this.todoModel = createTodoModel(context.dbConnection);

      // Optional: Set up event handlers for the database connection.
      context.dbConnection.on("connected", () => {
        logger.info("Todo plugin connected to MongoDB");
      });

      context.dbConnection.on("error", (err: Error) => {
        logger.error(`Todo plugin MongoDB connection error: ${err.message}`);
      });

      logger.info("Todo Tasks Manager Plugin initialized successfully");
    } else {
      // If no database connection is provided, log an error and stop initialization.
      logger.error("No database connection provided for Todo plugin");
      throw new Error("Database connection is required for Todo plugin");
    }
  }

  /**
   * The `registerRoutes` method is called by the host to get the API routes
   * provided by this plugin.
   * It ensures the model and logger are initialized before creating routes.
   * @returns A Promise resolving to an array of RouteDefinition objects.
   */
  async registerRoutes(): Promise<RouteDefinition[]> {
    // Ensure the Mongoose model is available before defining routes that use it.
    if (!this.todoModel) {
      throw new Error("Todo model not initialized");
    }
    // Ensure the logger is available before defining routes that use it.
    if (!this.logger) {
      throw new Error("Logger not initialized");
    }

    // Call the function (likely in ./routes.ts) that generates the route definitions,
    // passing the initialized model and logger.
    return createRoutes(this.todoModel, this.logger);
  }
}

// --- Exports ---

// Export an instance of the plugin class using the named export `Plugin`.
// This specific export name is likely expected by the host loading mechanism.
export const Plugin = new TodoPlugin();
