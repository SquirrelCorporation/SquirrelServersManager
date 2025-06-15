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
# Smart Failure Module

The Smart Failure module analyzes Ansible execution logs to identify common failure patterns, providing detailed error messages and resolution steps to help users quickly diagnose and fix issues in their Ansible deployments.

## Features

- **Pattern Matching**: Uses regex patterns to detect known failure scenarios in log outputs
- **Actionable Resolution Steps**: Provides specific troubleshooting guidance for each detected issue
- **Docker Integration**: Specialized patterns for Docker-related failures with container-specific resolutions
- **Error Categorization**: Organizes failures by type (network, permission, system, Docker, Ansible)
- **Efficient Processing**: Processes logs line-by-line with duplicate detection to avoid redundant results

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer

- **Entities and Interfaces**:
  - `FailurePattern`: Defines structure for failure detection patterns
  - `SmartFailure`: Interface for the structured response
  - Service interfaces defining the business logic contracts

- **Constants**:
  - `FAILURE_PATTERNS`: Collection of predefined regex patterns with causes and resolutions

### Application Layer

- **Services**:
  - `SmartFailureService`: Implements core log analysis and pattern matching logic
  - Processes log data line-by-line against defined patterns
  - Uses duplicate detection to prevent redundant results

### Infrastructure Layer

- **Repositories**:
  - Implementations to access log data from storage
  - Integration with the logs module for data access

### Presentation Layer

- **Controller**:
  - REST API endpoints for requesting smart failure analysis
  - Validation and response formatting

## Failure Categories

The module detects failures across several categories:

### Network Issues
- Host unreachability
- Connection timeouts
- SSL certificate validation problems

### Permission Issues
- SSH authentication failures
- Permission denied errors
- User not found errors

### System Issues
- Disk space problems
- Package management errors
- Service availability issues

### Docker-Specific Issues
- Docker daemon connectivity problems
- Container not found errors
- Image pull failures
- Container execution errors

### Ansible-Specific Issues
- Syntax errors
- Module not found errors
- Variable undefined errors

## Usage

### API Endpoint

#### GET /ansible/smart-failure
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

## Recent Enhancements

- Added Docker-specific failure patterns for container management issues
- Improved log processing efficiency with pattern caching
- Enhanced duplicate detection to prevent redundant results
- Added detailed step-by-step resolution guidance for Docker failures

## Future Development

- Machine learning-based pattern detection
- Custom user-defined failure patterns
- Real-time log analysis capabilities
- Severity classification for detected issues
- Resolution success tracking