# E2E Testing Implementation Checklist for SSM Server

This document provides a step-by-step checklist for implementing end-to-end testing for the SSM Server.

## Critical Requirements

**IMPORTANT: The server build process MUST be identical to production.**

- The E2E test environment MUST use the exact same build configuration for the server as in `docker-compose.prod.yml`
- DO NOT create a new Dockerfile for the server
- DO NOT modify the existing server build process in any way
- The test environment should only differ in:
  - Environment variables and configuration
  - Database setup (in-memory if possible)
  - Port mappings to avoid conflicts
  - Additional test-specific services

This ensures we're testing the exact same server code that runs in production.

## Phase 1: Directory Structure and Entry Point Setup

- [ ] **1.1. Create Directory Structure**
  - [ ] Create `tests/e2e/` directory for all E2E test code
  - [ ] Create subdirectories for utilities and test files:
      ```
      tests/
      ├── e2e/
      │   ├── utils/        # API client and helper functions
      │   ├── tests/        # Test files organized by feature
      │   └── run.sh        # Main entry point script
      ```
  - [ ] **VERIFICATION**: Confirm directories exist with correct permissions

- [ ] **1.2. Create Single Entry Point Script**
  - [ ] Create `tests/e2e/run.sh` script that handles the entire test lifecycle
  - [ ] Make script executable with `chmod +x tests/e2e/run.sh`
  - [ ] Configure script to handle setup, test execution, and cleanup
  - [ ] **VERIFICATION**: Verify script syntax with `bash -n tests/e2e/run.sh`

- [ ] **1.3. Add NPM Script Entry Point**
  - [ ] Add script entry to main package.json
      ```json
      "scripts": {
        "test:e2e": "tests/e2e/run.sh"
      }
      ```
  - [ ] **VERIFICATION**: Test script path resolution with `npm run test:e2e -- --help` 
        (implement --help flag in the script)

## Phase 2: Docker Compose Configuration

- [ ] **2.1. Create Docker Compose Test Configuration**
  - [ ] Create `tests/e2e/docker-compose.test.yml` file
  - [ ] **CRITICAL**: Copy the server build configuration exactly as it appears in `docker-compose.prod.yml`:
      ```yaml
      server:
        build:
          context: ../../server
          additional_contexts:
            - shared-lib=../../shared-lib
          target: production
      ```
  - [ ] Configure server with test environment variables (only change `NODE_ENV` and connection strings)
  - [ ] Add in-memory MongoDB service (or use regular MongoDB with tmpfs volume)
  - [ ] Add in-memory Redis service (or use regular Redis with tmpfs volume)
  - [ ] Configure SSH test server service
  - [ ] Set up test runner container
  - [ ] Map all services to non-conflicting ports to allow parallel execution with production
  - [ ] **VERIFICATION**: Compare server build configuration with `docker-compose.prod.yml` to ensure they match
  - [ ] **VERIFICATION**: Run `docker-compose -f tests/e2e/docker-compose.test.yml config` to validate configuration

- [ ] **2.2. Configure Test Server**
  - [ ] Verify existing `tests/server/Dockerfile` has SSH daemon correctly set up
  - [ ] Ensure test user credentials are properly configured
  - [ ] **VERIFICATION**: Build and run test server container to confirm SSH access
      ```bash
      docker build -t ssm-test-server tests/server/
      docker run -d -p 2222:22 ssm-test-server
      ssh testuser@localhost -p 2222  # Should connect with password: testpassword
      ```

## Phase 3: Test Framework Setup

- [ ] **3.1. Create Test Runner**
  - [ ] Create `tests/e2e/Dockerfile.test-runner`
  - [ ] Configure Node.js environment for test execution
  - [ ] **VERIFICATION**: Build test runner image to ensure it compiles
      ```bash
      docker build -t ssm-test-runner -f tests/e2e/Dockerfile.test-runner tests/e2e/
      ```

- [ ] **3.2. Set Up Vitest Configuration**
  - [ ] Create `tests/e2e/vitest.config.ts`
  - [ ] Configure test environment, timeouts, and reporters
  - [ ] **VERIFICATION**: Run Vitest with empty test to verify configuration
      ```bash
      cd tests/e2e && npx vitest run --config vitest.config.ts
      ```

- [ ] **3.3. Create API Client Utilities**
  - [ ] Create `tests/e2e/utils/api-client.ts` for interacting with API endpoints
  - [ ] Implement authentication helpers in `tests/e2e/utils/test-helpers.ts`
  - [ ] Create common test setup/teardown in `tests/e2e/setup.ts`
  - [ ] **VERIFICATION**: Import utilities in a test file to check for syntax errors

## Phase 4: Test Implementation

- [ ] **4.1. User Authentication Tests**
  - [ ] Create `tests/e2e/tests/auth.test.ts`
  - [ ] Implement user creation test
  - [ ] Implement login test
  - [ ] Implement token validation test
  - [ ] **MANDATORY TESTING**: Run authentication tests to ensure they pass
      ```bash
      cd tests/e2e && npx vitest run tests/auth.test.ts
      ```

- [ ] **4.2. Device Management Tests**
  - [ ] Create `tests/e2e/tests/devices.test.ts`
  - [ ] Implement device creation via SSH
  - [ ] Implement device retrieval test
  - [ ] Implement device status verification
  - [ ] Implement device removal test
  - [ ] **MANDATORY TESTING**: Run device tests to ensure they pass
      ```bash
      cd tests/e2e && npx vitest run tests/devices.test.ts
      ```

- [ ] **4.3. Complete Test Suite**
  - [ ] Create `tests/e2e/index.test.ts` that imports all test files
  - [ ] **VERIFICATION**: Run complete test suite using the script
      ```bash
      ./tests/e2e/run.sh --no-docker
      ```

## Phase 5: Integrated Testing

- [ ] **5.1. Run Full E2E Test Environment**
  - [ ] Use the entry point script to start all containers
      ```bash
      ./tests/e2e/run.sh
      ```
  - [ ] **VERIFICATION**: Check all containers are running
      ```bash
      docker ps | grep ssm-test
      ```
  - [ ] **VERIFICATION**: Inspect server container to confirm it was built with the same process as production
      ```bash
      docker inspect ssm-test-server
      ```
  
- [ ] **5.2. Execute Tests in Container Environment**
  - [ ] Ensure entry point script correctly handles test execution
  - [ ] **MANDATORY TESTING**: Verify all tests pass in the containerized environment
  - [ ] **VERIFICATION**: Check test output for any failed assertions or errors

- [ ] **5.3. Clean Up Test Environment**
  - [ ] Verify the entry point script properly cleans up after tests
  - [ ] **VERIFICATION**: Ensure all containers are removed after script execution
      ```bash
      docker ps -a | grep ssm-test  # Should return nothing after script completes
      ```

## Phase 6: CI Integration

- [ ] **6.1. Create GitHub Actions Workflow**
  - [ ] Create `.github/workflows/e2e-tests.yml`
  - [ ] Configure workflow to run on pull requests and pushes to main branch
  - [ ] Use the single entry point script for test execution
  - [ ] **VERIFICATION**: Make a small commit to trigger the workflow

- [ ] **6.2. Test Report Integration**
  - [ ] Configure Vitest to generate JUnit/XML reports
  - [ ] Add step in GitHub Actions to publish test results
  - [ ] **VERIFICATION**: Check that test results appear in GitHub Actions

## Docker Compose Template

Below is a starter template for your `tests/e2e/docker-compose.test.yml` file with non-conflicting ports and identical server build configuration:

```yaml
version: '3.8'

services:
  # SERVER CONFIGURATION - IDENTICAL TO PRODUCTION
  server:
    # CRITICAL: Build configuration identical to production
    build:
      context: ../../server
      additional_contexts:
        - shared-lib=../../shared-lib
      target: production
    ports:
      - "13000:3000"  # Only change: Map to different external port
    environment:
      # Only configuration changes - not build changes
      NODE_ENV: test
      MONGODB_URI: mongodb://mongo:27017/ssm-test
      REDIS_URI: redis://redis:6379
      SERVER_PORT: 3000
    healthcheck:
      test: curl --fail http://localhost:3000/ping || exit 1
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    depends_on:
      - mongo
      - redis
    volumes:
      - ../../tests/e2e/fixtures:/data/fixtures

  # Testing-specific services below
  mongo:
    image: mongo:latest
    ports:
      - "27018:27017"
    command: --quiet --dbpath /data/db
    tmpfs:
      - /data/db:exec,rw

  redis:
    image: redis:alpine
    ports:
      - "16379:6379"
    command: redis-server --save ""
    tmpfs:
      - /data:exec,rw

  test-server:
    build:
      context: ../../tests/server
    ports:
      - "2222:22"

  test-runner:
    build:
      context: ../../tests/e2e
      dockerfile: Dockerfile.test-runner
    depends_on:
      server:
        condition: service_healthy
      test-server:
        condition: service_started
    environment:
      API_URL: http://server:3000
      TEST_SERVER_HOST: test-server
      TEST_SERVER_PORT: 22
      TEST_SERVER_USERNAME: testuser
      TEST_SERVER_PASSWORD: testpassword
    volumes:
      - ../../tests/e2e:/app/tests/e2e
```

## Test Runner Dockerfile Template

Below is a starter template for your `tests/e2e/Dockerfile.test-runner`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Install testing dependencies
RUN npm install -g vitest

# Set working directory for tests
WORKDIR /app/tests/e2e

# Command to run tests
CMD ["vitest", "run", "--config", "vitest.config.ts"]
```

## Shell Script Template

Below is a starter template for your `tests/e2e/run.sh` script:

```bash
#!/bin/bash
set -e

# Define directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_COMPOSE_FILE="$SCRIPT_DIR/docker-compose.test.yml"

# Parse arguments
NO_DOCKER=false
HELP=false

for arg in "$@"; do
  case $arg in
    --no-docker)
      NO_DOCKER=true
      shift
      ;;
    --help)
      HELP=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Display help
if [ "$HELP" = true ]; then
  echo "Usage: run.sh [options]"
  echo ""
  echo "Options:"
  echo "  --no-docker    Run tests without Docker (assumes services are already running)"
  echo "  --help         Display this help message"
  exit 0
fi

echo "===== Starting E2E Test Suite ====="

# Skip Docker if requested
if [ "$NO_DOCKER" = false ]; then
  # Clean up any existing test containers
  echo "Cleaning up any existing test environment..."
  cd "$SCRIPT_DIR"
  docker-compose -f "$DOCKER_COMPOSE_FILE" down -v 2>/dev/null || true

  # Start the test environment
  echo "Starting test environment..."
  docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build

  # Wait for server to be ready
  echo "Waiting for server to be ready..."
  attempts=0
  max_attempts=30
  until $(curl --output /dev/null --silent --fail http://localhost:13000/ping); do
    attempts=$((attempts+1))
    if [ $attempts -gt $max_attempts ]; then
      echo "Server failed to start after $max_attempts attempts"
      docker-compose -f "$DOCKER_COMPOSE_FILE" logs server
      docker-compose -f "$DOCKER_COMPOSE_FILE" down -v
      exit 1
    fi
    echo "Waiting for server... ($attempts/$max_attempts)"
    sleep 2
  done

  echo "Server is ready!"

  # Run the tests
  echo "Running tests in Docker environment..."
  docker-compose -f "$DOCKER_COMPOSE_FILE" run --rm test-runner
  TEST_EXIT_CODE=$?

  # Clean up
  echo "Cleaning up test environment..."
  docker-compose -f "$DOCKER_COMPOSE_FILE" down -v
else
  # Run tests directly without Docker
  echo "Running tests locally (--no-docker specified)..."
  cd "$SCRIPT_DIR"
  npx vitest run
  TEST_EXIT_CODE=$?
fi

# Exit with the test result
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "===== E2E Tests PASSED ====="
  exit 0
else
  echo "===== E2E Tests FAILED ====="
  exit 1
fi
```

## Progress Tracking

Mark each step as you complete it to track your progress. After completing each verification or mandatory testing step, note any issues encountered and resolved to document your implementation journey.

## Port Assignments

For reference, here are the port mappings for the test environment:

| Service       | Internal Port | External Port | Notes                         |
|---------------|---------------|---------------|-------------------------------|
| SSM Server    | 3000          | 13000         | API access for external tools |
| MongoDB       | 27017         | 27018         | Database access               |
| Redis         | 6379          | 16379         | Cache access                  |
| Test SSH      | 22            | 2222          | SSH server for device tests   |

These port assignments ensure there are no conflicts with production services running on standard ports.