```ascii
   ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     `"=\_  )_"`
          ``'"`
```
Squirrel Servers Manager 🐿️
---

# Telemetry Module

## Overview

The `TelemetryModule` provides anonymous usage data collection capabilities for the application using [PostHog](https://posthog.com/). It ensures user privacy by allowing telemetry to be disabled and by using a persistent, anonymous installation ID.

## Features

- **NestJS Integration:** Implemented as a standard NestJS module (`TelemetryModule`) and service (`TelemetryService`).
- **Automatic Initialization:** Utilizes `OnModuleInit` to initialize the PostHog client and identify the installation when the application starts.
- **Graceful Shutdown:** Uses `OnApplicationShutdown` to ensure the PostHog client is properly shut down.
- **Anonymous Identification:**
    - Fetches a unique `INSTALL_ID` from the cache (`CacheManager`).
    - If no ID exists, generates a new UUID v4 and stores it in the cache.
    - Uses this `INSTALL_ID` as the `distinctId` for all telemetry events.
- **Configurable:** Telemetry collection can be enabled or disabled via the `TELEMETRY_ENABLED` environment variable (read via `ConfigService`). If disabled, the module opts out of PostHog tracking.
- **Event Capture:** Provides a `capture(payload: TelemetryEventPayload)` method in `TelemetryService` to send events to PostHog. The `TelemetryEventPayload` interface is exported from `dto/telemetry-event-payload.dto` for type safety and to follow best practices (DTOs are always kept in their own files).

## Configuration

- **`TELEMETRY_ENABLED`**: Set this environment variable to `true` to enable telemetry collection or `false` (or omit) to disable it.

## Usage

1.  **Import the Module:** Ensure `TelemetryModule` is imported into your main application module (`AppModule`) or a relevant feature module.

    ```typescript
    // app.module.ts
    import { Module } from '@nestjs/common';
    import { TelemetryModule } from './modules/telemetry';
    // ... other imports

    @Module({
      imports: [
        // ... other modules
        TelemetryModule,
      ],
      // ... controllers, providers
    })
    export class AppModule {}
    ```

2.  **Inject the Service:** Inject `TelemetryService` into any service or controller where you need to capture telemetry events.

    ```typescript
    import { Injectable } from '@nestjs/common';
    import { TelemetryService, TelemetryEventPayload } from '@modules/telemetry'; // Adjust path if necessary

    @Injectable()
    export class MyService {
      constructor(private readonly telemetryService: TelemetryService) {}

      doSomethingImportant() {
        // ... perform action ...

        // Capture a telemetry event using the interface
        this.telemetryService.capture({
          eventName: 'important_action_completed',
          properties: {
            userId: 'some-user-id', // Optional properties
            durationMs: 500,
          }
        });
      }
    }
    ```

## Initialization Flow

1.  Application starts.
2.  `TelemetryModule` is initialized.
3.  `TelemetryService.onModuleInit()` is called.
4.  `ConfigService` is checked for `TELEMETRY_ENABLED`.
5.  If `false`, PostHog client is initialized and immediately opted out. No further action.
6.  If `true`:
    - PostHog client is initialized.
    - `CacheManager` is checked for `SettingsKeys.GeneralSettingsKeys.INSTALL_ID`.
    - If found, it's used as `distinctId`.
    - If not found, a new UUID is generated, stored in the cache under the `INSTALL_ID` key, and used as `distinctId`.
    - `client.identify()` is called with the `distinctId`.
7.  The service is now ready to `capture()` events.
8.  On application shutdown, `TelemetryService.onApplicationShutdown()` calls `client.shutdown()`.

## Clean Architecture Implementation

### Domain Layer
- **Entities**
  - `Telemetry`: Core entity managing telemetry functionality
  - Event tracking and management
  - Installation ID handling

### Application Layer
- **Services**
  - Event capture and tracking
  - Initialization and shutdown management
  - Privacy settings management

### Infrastructure Layer
- PostHog client integration
- Settings cache integration
- Configuration management

## Module Structure
```
telemetry/
├── index.ts        # Main module implementation
└── README.md       # Module documentation
```

## API Methods
### Telemetry Service
- **Initialization**
  - `init()`: Initialize telemetry service
    - Set up PostHog client
    - Configure installation ID
    - Handle opt-out settings

- **Event Tracking**
  - `capture(eventName: string)`: Track specific events
    - Respects telemetry enabled setting
    - Uses installation ID for tracking

- **Service Management**
  - `shutdown()`: Gracefully shut down telemetry service
    - Clean up PostHog client

## Testing Instructions
1. Configure test environment:
   ```bash
   # Set telemetry configuration
   TELEMETRY_ENABLED=true
   ```

2. Test event tracking:
   ```typescript
   // Initialize telemetry
   await telemetry.init();
   
   // Track event
   telemetry.capture('test_event');
   
   // Shutdown
   await telemetry.shutdown();
   ```

3. Test coverage should include:
   - Initialization scenarios
   - Event tracking
   - Privacy settings
   - Error handling

## Recent Changes
- Implemented PostHog integration
- Added privacy-first approach
- Enhanced error handling
- Added graceful shutdown
- Integrated with application settings
- Added installation ID tracking 