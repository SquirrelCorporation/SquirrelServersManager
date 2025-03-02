# Smart Failure Module

The SmartFailure module is a NestJS implementation of the Ansible smart failure detection system. It analyzes Ansible execution logs to identify common failure patterns and provides helpful error messages and resolution steps.

## Features

- Analyzes Ansible logs for common failure patterns
- Provides detailed error messages and resolution steps
- Securely authenticates requests using JWT
- Validates input parameters
- Comprehensive error handling

## Architecture

The module follows the NestJS architecture with the following components:

- **Controller**: Handles HTTP requests and responses
- **Service**: Implements the business logic for log analysis
- **DTO**: Defines the data transfer objects for request validation
- **Interfaces**: Defines the data structures for failure patterns and responses
- **Constants**: Defines the failure patterns to detect

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

The module includes comprehensive tests for both the controller and service. See [TESTING.md](./TESTING.md) for more details.

## Manual Testing

A standalone test script is provided for manual testing:

```bash
npx ts-node src/modules/smart-failure/test-smart-failure.ts
```

## Future Improvements

- Add more failure patterns
- Implement machine learning for more accurate failure detection
- Add support for different log formats
- Improve performance for large log files
