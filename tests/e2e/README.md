# End-to-End Testing Suite for SSM Server

This directory contains the E2E testing infrastructure for testing the SSM Server API endpoints. The tests validate critical user flows from user creation through device management.

## Architecture

The E2E testing environment replicates the production setup with the following components:

1. **Server Container**: Uses identical build configuration as in production
2. **Database Containers**:
   - MongoDB with in-memory storage
   - Redis with in-memory storage
3. **Virtual Test Device**: Contains SSH daemon for device testing
4. **Test Runner Container**: Executes the test suite against the running services

## Key Implementation Details

- **Identical Server Build**: The server container uses the exact same build configuration as in `docker-compose.prod.yml`
- **Testing Environment**: All services run in Docker containers with non-conflicting ports
- **Test Context**: Utilizes Vitest for running tests and Pactum for API testing
- **Test Flows**: Tests user authentication, device management, and container APIs
- **Flexible Test Fixtures**: Handles various API response formats for compatibility
- **Test Data Initialization**: Automatically sets up test users and devices

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 16.x or higher

### Running Tests

```bash
# Run from project root
npm run test:e2e

# Or directly from the e2e directory
cd tests/e2e
./run.sh
```

This command will:
1. Start all containers needed for testing
2. Wait for the server to be healthy
3. Run the test suite
4. Display test results
5. Clean up containers

## Tests Implemented

The E2E test suite currently covers:

1. **Health & Ping**: Server health and availability
2. **Authentication**: User login with different credential formats
3. **Device Management**: Listing, creating, and getting device details
4. **Container Operations**: Listing containers, images, networks, and volumes

## Directory Structure

```
tests/e2e/
├── fixtures/          # Test initialization and fixture data
│   ├── e2e-main.js    # Custom main.js for testing
│   ├── init-mongo.js  # MongoDB initialization script
│   └── init-test-data.js # Test data initialization script
├── tests/             # Test files organized by feature
│   ├── setup.ts       # Test environment setup
│   ├── test-utils.ts  # Testing utilities 
│   ├── auth.test.ts   # Authentication tests
│   ├── devices.test.ts # Device management tests
│   ├── containers.test.ts # Container operations tests
│   └── health.test.ts # Server health tests
├── docker-compose.test.yml  # Test environment definition
├── Dockerfile.test-runner   # Test runner container definition
├── run.sh             # Main entry point script
├── wait-for-server.sh # Server health check script
└── vitest.config.ts   # Vitest configuration
```

## Test Environment Configuration

The E2E test environment uses the following port mappings to avoid conflicts with production:

| Service       | Internal Port | External Port | Notes                         |
|---------------|---------------|---------------|-------------------------------|
| SSM Server    | 3000          | 13000         | API access for external tools |
| MongoDB       | 27017         | 27018         | Database access               |
| Redis         | 6379          | 16379         | Cache access                  |
| Test Device   | 22            | 2222          | SSH server for device tests   |

## Test Response Compatibility

The tests are designed to work with different API response formats:

1. Standard API response: `{ success: true, data: {...} }`
2. Direct data response: `{...}`
3. Array responses: `[...]`

This flexibility ensures the tests can adapt to changes in the API response format.

## Adding New Tests

To add new tests:

1. Create a new test file in the `tests/` directory with a `.test.ts` extension
2. Import required test utilities from `setup.ts` and `test-utils.ts`
3. Follow the existing test patterns for authentication and API calls
4. Use Pactum.js for API testing (see https://pactumjs.github.io/)
5. Use Vitest as the test runner (see https://vitest.dev/)

## Environment Variables

You can configure the tests using environment variables:

- `SERVER_URL`: URL of the server to test (default: http://server:3000)
- `API_URL`: URL of the API (default: http://server:3000)
- `TEST_DEVICE_HOST`: Hostname of the test device (default: test-device)
- `TEST_DEVICE_PORT`: Port of the test device (default: 22)
- `TEST_DEVICE_USERNAME`: Username for the test device (default: testuser)
- `TEST_DEVICE_PASSWORD`: Password for the test device (default: testpassword)
- `TEST_USERNAME`: Username for authentication tests (default: test@example.com)
- `TEST_PASSWORD`: Password for authentication tests (default: admin)