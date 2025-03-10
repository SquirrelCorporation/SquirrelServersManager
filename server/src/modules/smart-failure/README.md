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
# Smart Failure Module

The Smart Failure module is a NestJS implementation of the Ansible smart failure detection system. It analyzes Ansible execution logs to identify common failure patterns and provides helpful error messages and resolution steps.

## Features

- Analyzes Ansible logs for common failure patterns
- Provides detailed error messages and resolution steps
- Securely authenticates requests using JWT
- Validates input parameters
- Comprehensive error handling

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer
- **Entities**: Defines the core business entities like `FailurePattern`
- **Repository Interfaces**: Defines the `IAnsibleLogsRepository` interface
- **Constants**: Defines the failure patterns to detect

### Application Layer
- **Service Interfaces**: Defines the `ISmartFailureService` interface
- **Services**: Implements the business logic for log analysis in `SmartFailureService`

### Infrastructure Layer
- **Repositories**: Implements the `AnsibleLogsRepository` that uses the Logs module's repository

### Presentation Layer
- **Controllers**: Handles HTTP requests and responses in `SmartFailureController`
- **DTOs**: Defines the data transfer objects for request validation

## API Endpoints

### GET /ansible/smart-failure

Analyzes Ansible logs for a specific execution ID and returns any detected failure patterns.

#### Request Parameters

- `execId` (query parameter): The execution ID of the Ansible logs to analyze

#### Authentication

This endpoint requires a valid JWT token.

#### Response

```json
{
  "status": "success",
  "message": "May got Ansible SmartFailure",
  "data": {
    "id": "unreachable",
    "message": "UNREACHABLE! The host is not responding",
    "cause": "The device may be down or unreachable.",
    "resolution": "Check the device network connectivity and ensure you entered the right IP."
  }
}
```

If no failure pattern is detected, the `data` field will be `undefined`.

## Failure Patterns

The module detects the following failure patterns:

- Unreachable hosts
- Permission denied
- Command not found
- Package not found
- Timeout
- Disk space issues
- Syntax errors
- User not found
- Service not found
- SSL certificate issues
- Module not found
- Variable undefined
- Docker-related issues
- And more...

## Usage

To use the SmartFailure module, import it into your NestJS application:

```typescript
import { SmartFailureModule } from './modules/smart-failure';

@Module({
  imports: [
    // ... other modules
    SmartFailureModule,
  ],
})
export class AppModule {}
```

## Testing

The module includes comprehensive tests that mirror the module structure:

- **Application Layer Tests**: Tests for the `SmartFailureService`
- **Infrastructure Layer Tests**: Tests for the `AnsibleLogsRepository`
- **Presentation Layer Tests**: Tests for the `SmartFailureController`

## Future Improvements

- Add more failure patterns
- Implement machine learning for more accurate failure detection
- Add support for different log formats
- Improve performance for large log files
