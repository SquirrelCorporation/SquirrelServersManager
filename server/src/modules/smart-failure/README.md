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

The Smart Failure module is a sophisticated NestJS implementation that analyzes Ansible execution logs to identify common failure patterns. It provides detailed error messages and resolution steps to help users quickly diagnose and fix issues in their Ansible deployments.

## Features

- **Pattern-Based Analysis**: Analyzes Ansible logs using predefined regex patterns to identify common failure scenarios
- **Detailed Error Information**: Provides comprehensive error messages with:
  - Root cause analysis
  - Step-by-step resolution instructions
  - Context-specific troubleshooting tips
- **Docker-Specific Detection**: Specialized patterns for Docker-related issues including:
  - Docker daemon connectivity
  - Container management
  - Image pulling problems
  - Container configuration issues
- **Efficient Log Processing**: Processes logs line by line with duplicate detection
- **Comprehensive Error Coverage**: Detects over 20 common failure patterns
- **Clean Architecture Implementation**: Follows SOLID principles and Clean Architecture patterns

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**: 
  - `IFailurePattern`: Defines the structure of failure patterns
- **Constants**: 
  - `FAILURE_PATTERNS`: Contains all predefined failure patterns with regex, causes, and resolutions
- **Interfaces**: 
  - Repository interfaces for data access abstraction
  - Service interfaces defining the business logic contract

### Application Layer
- **Services**: 
  - `SmartFailureService`: Implements log analysis logic
  - Pattern matching and failure detection algorithms
  - Duplicate detection to prevent redundant results

### Infrastructure Layer
- **Repositories**: 
  - Implementation of repository interfaces
  - Integration with the Logs module for data access

### Presentation Layer
- **Controllers**: 
  - REST endpoints for log analysis
  - Request validation and response formatting

## Failure Pattern Categories

The module detects failures in the following categories:

1. **Network Issues**
   - Unreachable hosts
   - Connection timeouts
   - SSL certificate problems

2. **Permission Issues**
   - SSH authentication failures
   - Permission denied errors
   - User not found errors

3. **System Issues**
   - Disk space problems
   - Package management errors
   - Service availability issues

4. **Docker-Specific Issues**
   - Daemon connectivity problems
   - Container not found errors
   - Image pull failures
   - Container execution errors
   - Configuration problems

5. **Ansible-Specific Issues**
   - Syntax errors
   - Module not found errors
   - Variable undefined errors
   - Playbook execution failures

## API Endpoints

### GET /ansible/smart-failure
Analyzes Ansible logs for a specific execution ID.

**Query Parameters:**
- `execId` (string, required): The execution ID of the Ansible logs to analyze

**Response:**
```typescript
{
  status: "success",
  message: "May got Ansible SmartFailure",
  data?: {
    id: string;          // Unique identifier for the failure pattern
    message: string;     // The actual error message from logs
    cause: string;       // Root cause analysis
    resolution: string;  // Step-by-step resolution steps
  }
}
```

## Integration

Import the module into your NestJS application:

```typescript
import { SmartFailureModule } from './modules/smart-failure';

@Module({
  imports: [SmartFailureModule],
})
export class AppModule {}
```

## Recent Changes

- Added specialized Docker failure detection patterns
- Improved log processing efficiency with duplicate detection
- Enhanced error messages with more detailed resolution steps
- Added comprehensive Docker-related troubleshooting guidance

## Future Improvements

- Machine learning-based pattern detection
- Support for custom failure patterns
- Real-time log analysis capabilities
- Integration with external monitoring systems
- Pattern effectiveness tracking and optimization
