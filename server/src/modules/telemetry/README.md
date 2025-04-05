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
The Telemetry Module provides anonymous usage tracking capabilities for the Squirrel Servers Manager application. It implements PostHog integration for event tracking, with respect for user privacy through opt-out capabilities and configurable telemetry settings.

## Features
- Anonymous usage tracking
- Event-based telemetry capture
- Privacy-first approach with opt-out support
- Installation-specific tracking
- Configurable telemetry settings
- Graceful shutdown handling
- Error handling and logging
- Integration with application settings
- Singleton pattern implementation
- Asynchronous initialization

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

## Dependencies
- `posthog-node`: PostHog Node.js client
- `ssm-shared-lib`: Shared settings and types
- Application configuration
- Application logger

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