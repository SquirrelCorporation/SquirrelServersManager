```
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
# Update Module

The Update module is a NestJS implementation that manages version checking and update notifications for the Squirrel Servers Manager. It provides automated version comparison between the local installation and the latest available version from the official repository.

## Features

- **Automated Version Checking**
  - Periodic version checks (every 30 minutes)
  - Semantic versioning comparison
  - Remote version fetching from GitHub
  - Update notification caching

- **Version Management**
  - Local version tracking
  - Remote version fetching
  - Version comparison using semver
  - Update availability status

- **Scheduling**
  - Cron-based version checks
  - Dynamic job management
  - Configurable check intervals

- **Error Handling**
  - Graceful failure handling
  - Invalid version format detection
  - Network error management
  - Comprehensive logging

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Interfaces**
  - `IUpdateService`: Core update service contract
  - Version checking and comparison contracts
  - Module initialization requirements

### Application Layer
- **Services**
  - `UpdateService`: Core update management
    - Version comparison logic
    - Remote version fetching
    - Update status caching
    - Scheduled checks management

### Infrastructure Layer
- **External Services**
  - GitHub repository integration
  - Cache management
  - HTTP client configuration

### Presentation Layer
- Service-only module (no controllers)
- Consumed by other modules for update status

## Service Methods

### Version Checking
```typescript
checkVersion(): Promise<void>
// Checks for available updates by comparing local and remote versions
// Stores result in cache using SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE
```

### Version Retrieval
```typescript
getLocalVersion(): string
// Returns the current local version of the application
```

### Version Comparison
```typescript
private compareVersions(localVersion: string, remoteVersion: string): number | null
// Compares versions using semver
// Returns: 
//   0: versions are identical
//   1: local is newer
//  -1: remote is newer
// null: invalid version format
```

### Remote Version Fetching
```typescript
private async fetchRemoteVersion(): Promise<string | undefined>
// Fetches the latest version from GitHub repository
// Returns undefined if fetch fails
```

## Configuration

### Release URL
```typescript
private readonly RELEASE_URL = 'https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/release.json'
```

### Cron Schedule
```typescript
@Cron(CronExpression.EVERY_30_MINUTES, { name: 'checkVersion' })
// Runs version check every 30 minutes
```

## Integration

Import the module into your NestJS application:

```typescript
import { UpdateModule } from './modules/update';

@Module({
  imports: [UpdateModule],
})
export class AppModule {}
```

## Recent Changes

- Implemented semantic versioning comparison
- Added caching for update status
- Enhanced error handling and logging
- Improved scheduled job management
- Added comprehensive version comparison logic

## Future Improvements

- Configurable check intervals
- Multiple release channels support
- Automated update installation
- Update progress tracking
- Release notes fetching
- Update rollback capability
