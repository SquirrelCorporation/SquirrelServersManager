# Update Module

## Overview
The Update Module is responsible for checking if a new version of the Squirrel Servers Manager (SSM) is available. It compares the current installed version with the latest version available in the GitHub repository.

## Architecture
The Update Module follows the NestJS component-based design pattern, similar to other modules in the application. It consists of:

- **UpdateModule**: The main NestJS module that provides the UpdateService.
- **UpdateService**: The core service that handles version checking and comparison.
- **Legacy UpdateChecker**: A backward compatibility layer that redirects calls to the new UpdateService.

## Components

### UpdateService
The UpdateService is responsible for:
- Fetching the latest version from the GitHub repository
- Comparing local and remote versions using semver
- Storing update information in the cache
- Providing version information to other parts of the application

### Integration Points
The Update Module integrates with:
- **Cron Jobs**: Scheduled to check for updates every 30 minutes
- **Startup Process**: Checks for updates during application startup
- **Cache**: Stores update information for other components to access

## Usage
The Update Module is designed to work automatically in the background. It's initialized when the application starts and runs periodically to check for updates.

### Accessing Update Information
Other parts of the application can access update information through the cache:
```typescript
import { getFromCache } from '../../data/cache';
import { SettingsKeys } from 'ssm-shared-lib';

// Get update information
const updateAvailable = await getFromCache(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE);
```

## Testing
The Update Module includes unit tests that verify:
- Version comparison logic
- Remote version fetching
- Update checking process

## Dependencies
- axios: For HTTP requests to fetch the latest version
- semver: For semantic version comparison
- ssm-shared-lib: For shared enums and constants
