import { createConsola } from 'consola';

// Create different logger instances for different modules
const loggers = {
  dashboard: createConsola({
    defaults: {
      tag: 'dashboard',
    },
    formatOptions: {
      date: true,
      colors: true,
      compact: true,
    },
  }),
  widgets: createConsola({
    defaults: {
      tag: 'widgets',
    },
    formatOptions: {
      date: true,
      colors: true,
      compact: true,
    },
  }),
  api: createConsola({
    defaults: {
      tag: 'api',
    },
    formatOptions: {
      date: true,
      colors: true,
      compact: true,
    },
  }),
  default: createConsola({
    formatOptions: {
      date: true,
      colors: true,
      compact: true,
    },
  }),
};

// Development vs Production configuration
const isDev = process.env.NODE_ENV === 'development';

// Configure log levels based on environment
if (!isDev) {
  Object.values(loggers).forEach(logger => {
    logger.level = 3; // Show only warnings and errors in production
  });
}

// Export individual loggers
export const dashboardLogger = loggers.dashboard;
export const widgetLogger = loggers.widgets;
export const apiLogger = loggers.api;

// Export default logger for general use
export default loggers.default;