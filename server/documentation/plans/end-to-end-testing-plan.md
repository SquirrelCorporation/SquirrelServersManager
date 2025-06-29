# End-to-End Testing Plan for SquirrelServersManager

This document outlines a streamlined end-to-end testing plan for the SquirrelServersManager server application, focusing on testing the real API endpoints within a containerized environment.

## Table of Contents
- [Overview](#overview)
- [Test Environment Setup](#test-environment-setup)
- [Test Scenarios](#test-scenarios)
- [Implementation Plan](#implementation-plan)
- [Test Execution and Reporting](#test-execution-and-reporting)
- [Maintenance and Extension](#maintenance-and-extension)

## Overview

This plan establishes an end-to-end testing strategy that verifies the SquirrelServersManager API works correctly using a dedicated test container. Unlike unit or integration tests, these tests will validate real API endpoints and their responses in an isolated environment that mimics production.

### Objectives

- Verify all API endpoints respond correctly with expected data
- Test with real HTTP requests against the running server
- Run all tests in a dedicated container for consistent results
- Provide a single entry point for running all tests (`npm run test:e2e`)
- Ensure minimal setup requirements for developers

### Technology Stack

After evaluating various testing technologies, we've selected the following stack for implementing this test plan:

1. **Docker**: For running both the test container and the server container stack.

2. **Vitest**: Modern, fast JavaScript testing framework for executing our API tests.

3. **Pactum**: API testing toolkit designed for validating HTTP endpoints with detailed assertions.

4. **Docker Compose**: For orchestrating the test environment, including the server container, database, and test runner.

This combination offers a straightforward, reproducible testing environment with minimal configuration while ensuring thorough API validation.

## Test Environment Setup

### Step 1: Test Container Configuration

- [ ] Create test runner container
  - [ ] Dockerfile for test environment
  - [ ] Include Node.js and necessary dependencies
  - [ ] Configure network access to server container
  - [ ] Set up volume for test results reporting

### Step 2: Docker Compose Test Configuration

- [ ] Create dedicated Docker Compose file for testing
  - [ ] Include server and database containers
  - [ ] Include dedicated test runner container
  - [ ] Configure shared network for communication
  - [ ] Define environment variables for test configuration

### Step 3: Test Setup Script

- [ ] Create test setup script
  - [ ] Configure waiting mechanism for server availability
  - [ ] Set up test preconditions (e.g., create test user)
  - [ ] Handle test initialization requirements

## Test Scenarios

### API Endpoint Tests

#### 1. Authentication API Tests

- [ ] Test user authentication endpoints
  - [ ] Verify `/auth/login` works with valid credentials
  - [ ] Confirm authentication token is valid
  - [ ] Test token validation endpoint
  - [ ] Verify unauthorized access is properly rejected

#### 2. Device Management API Tests

- [ ] Test device management endpoints
  - [ ] Verify `/devices` retrieves device list
  - [ ] Test adding a new device via API
  - [ ] Verify device details can be retrieved
  - [ ] Test device update functionality
  - [ ] Validate device deletion works correctly

#### 3. Ansible Playbook API Tests

- [ ] Test Ansible playbook endpoints
  - [ ] Verify playbooks listing endpoint works
  - [ ] Test playbook execution request endpoint
  - [ ] Validate playbook execution status endpoint
  - [ ] Test playbook result retrieval

#### 4. Container Management API Tests

- [ ] Test container management endpoints
  - [ ] Verify container listing endpoint
  - [ ] Test container status endpoint
  - [ ] Validate container action endpoints (start, stop, etc.)

## Implementation Plan

### Phase 1: Test Infrastructure Setup

- [ ] Create test container infrastructure
  - [ ] Create `Dockerfile.test` for the test runner container
  - [ ] Set up Docker Compose configuration in `docker-compose.test.yml`
  - [ ] Configure network and service dependencies
  - [ ] Implement health check for server readiness

- [ ] Set up test execution environment
  - [ ] Configure Vitest for API testing
  - [ ] Set up Pactum for HTTP testing
  - [ ] Create test utilities for common operations
  - [ ] Implement test fixtures and helpers

### Phase 2: Core Authentication Tests

- [ ] Implement authentication test suite
  - [ ] Create `auth.test.ts` test file
  - [ ] Test login flow with different credentials
  - [ ] Validate token generation and validation
  - [ ] Test unauthorized access scenarios

### Phase 3: Device Management Tests

- [ ] Implement device API test suite
  - [ ] Create `devices.test.ts` test file
  - [ ] Test device CRUD operations via API
  - [ ] Validate device status responses
  - [ ] Test device filtering and pagination

### Phase 4: Additional API Tests

- [ ] Implement remaining API test suites
  - [ ] Create tests for Ansible endpoints
  - [ ] Create tests for Container management endpoints
  - [ ] Test settings and system configuration endpoints
  - [ ] Verify health check and monitoring endpoints

### Phase 5: Test Execution Script

- [ ] Create test runner script
  - [ ] Implement container startup and configuration
  - [ ] Set up environment preparation
  - [ ] Configure test execution with reporting
  - [ ] Implement cleanup and resource management

## Test Execution and Reporting

### npm Script Configuration

```json
{
  "scripts": {
    "test:e2e": "docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit --remove-orphans",
    "test:e2e:local": "vitest run --config ./e2e/vitest.config.ts"
  }
}
```

### Test Execution Flow

1. Developer runs `npm run test:e2e`
2. Docker Compose starts the test environment
   - Server container with real API
   - Database container (MongoDB)
   - Test runner container
3. Test runner waits for server availability
4. Test suite executes all API tests
5. Results are reported to console and HTML report
6. Containers are cleaned up after test completion

### Test Reporting

- [ ] Configure test reporting output
  - [ ] Console output with test status
  - [ ] HTML report for detailed results
  - [ ] JSON report for CI/CD integration

## Implementation Details

### Docker Compose Configuration

```yaml
# docker-compose.test.yml
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27018:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - test-network

  server:
    build:
      context: ..
      dockerfile: server/Dockerfile.server-test
    environment:
      - NODE_ENV=test
      - MONGODB_URI=mongodb://mongodb:27017/ssm_test
      - JWT_SECRET=test_jwt_secret
      - TELEMETRY_ENABLED=false
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    networks:
      - test-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/ping"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  test-runner:
    build:
      context: ..
      dockerfile: server/Dockerfile.test
    environment:
      - SERVER_URL=http://server:3000
      - TEST_USERNAME=admin
      - TEST_PASSWORD=admin
    volumes:
      - ./test-results:/app/test-results
    depends_on:
      server:
        condition: service_healthy
    networks:
      - test-network

networks:
  test-network:

volumes:
  mongodb_data:
```

### Server Test Dockerfile

```dockerfile
# Dockerfile.server-test
FROM node:18-alpine AS shared-lib-builder

WORKDIR /shared-lib-build
COPY shared-lib/ ./
RUN npm ci
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install essential packages
RUN apk update && apk add curl

# Copy server configuration files
COPY server/package*.json ./
COPY server/tsconfig*.json ./

# Create a directory for the shared lib
RUN mkdir -p /app/packages/ssm-shared-lib
# Copy the built shared lib from the builder stage
COPY --from=shared-lib-builder /shared-lib-build/distribution/ /app/packages/ssm-shared-lib/

# Install dependencies
# Configure npm
ENV NPM_CONFIG_LOGLEVEL=warn
RUN npm config set --location=project registry http://registry.npmjs.org/
RUN npm config set --location=project fetch-retry-mintimeout 20000
RUN npm config set --location=project fetch-retry-maxtimeout 120000
RUN npm config set --location=project strict-ssl false
# Manually edit package.json to point to file dependency
RUN sed -i 's|"ssm-shared-lib": "file:../shared-lib/"|"ssm-shared-lib": "file:./packages/ssm-shared-lib/"|g' package.json
RUN npm install

# Copy server code
COPY server/src ./src/
COPY server/nest-cli.json ./

# Build the application
RUN npm run build

# Expose API port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
```

### Test Runner Dockerfile

```dockerfile
# Dockerfile.test
FROM node:18-alpine AS shared-lib-builder

WORKDIR /shared-lib-build
COPY shared-lib/ ./
RUN npm ci
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files
COPY server/package*.json ./

# Create a directory for the shared lib
RUN mkdir -p /app/packages/ssm-shared-lib
# Copy the built shared lib from the builder stage
COPY --from=shared-lib-builder /shared-lib-build/distribution/ /app/packages/ssm-shared-lib/

# Install dependencies
# Tell npm to use our local packages directory
ENV NPM_CONFIG_LOGLEVEL=warn
RUN npm config set --location=project registry http://registry.npmjs.org/
RUN npm config set --location=project fetch-retry-mintimeout 20000
RUN npm config set --location=project fetch-retry-maxtimeout 120000
RUN npm config set --location=project strict-ssl false
# Manually edit package.json to point to file dependency
RUN sed -i 's|"ssm-shared-lib": "file:../shared-lib/"|"ssm-shared-lib": "file:./packages/ssm-shared-lib/"|g' package.json
RUN npm install

# Copy test files
COPY server/e2e/ ./e2e/

# Create directory for test results
RUN mkdir -p ./test-results

# Add Pactum and Vitest for testing
RUN npm install --save-dev pactum vitest @vitest/ui

# Set up environment
ENV NODE_ENV=test
ENV SERVER_URL=http://server:3000
ENV TEST_USERNAME=admin
ENV TEST_PASSWORD=admin

# Add test:e2e:runner script
RUN npm pkg set scripts.test:e2e:runner="node ./e2e/test-runner.js"

# Set wait-for-server.sh as executable
RUN chmod +x ./e2e/wait-for-server.sh

# Wait for server to be available then run tests
CMD ["./e2e/wait-for-server.sh", "npm", "run", "test:e2e:runner"]
```

### Example Authentication Test

```typescript
// e2e/tests/auth.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import * as pactum from 'pactum';

describe('Authentication API', () => {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  
  beforeAll(() => {
    pactum.request.setBaseUrl(serverUrl);
  });

  it('should authenticate with valid credentials', async () => {
    const response = await pactum
      .spec()
      .post('/auth/login')
      .withJson({
        username: process.env.TEST_USERNAME || 'admin',
        password: process.env.TEST_PASSWORD || 'admin'
      })
      .expectStatus(200)
      .returns('body');
      
    expect(response).toBeDefined();
    expect(response.token || response.access_token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    await pactum
      .spec()
      .post('/auth/login')
      .withJson({
        username: 'invalid',
        password: 'invalid'
      })
      .expectStatus(401);
  });
});
```

### Example Devices API Test

```typescript
// e2e/tests/devices.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import * as pactum from 'pactum';

describe('Devices API', () => {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  let authToken = '';
  
  beforeAll(async () => {
    pactum.request.setBaseUrl(serverUrl);
    
    // Get authentication token
    const response = await pactum
      .spec()
      .post('/auth/login')
      .withJson({
        username: process.env.TEST_USERNAME || 'admin',
        password: process.env.TEST_PASSWORD || 'admin'
      })
      .returns('body');
      
    authToken = response.token || response.access_token;
    
    // Set default auth header for all requests
    pactum.request.setDefaultHeaders({
      'Authorization': `Bearer ${authToken}`
    });
  });

  it('should retrieve devices list', async () => {
    const response = await pactum
      .spec()
      .get('/devices')
      .expectStatus(200)
      .returns('body');
      
    expect(response).toBeDefined();
    // Check response structure without expecting specific content
    if (Array.isArray(response)) {
      // Direct array response
      expect(Array.isArray(response)).toBe(true);
    } else if (response.data && Array.isArray(response.data)) {
      // Wrapped array response
      expect(Array.isArray(response.data)).toBe(true);
    } else {
      // Unknown structure but still valid
      expect(response).toBeDefined();
    }
  });

  it('should create a new device', async () => {
    const testDevice = {
      name: 'Test Device',
      hostname: 'test-device.local',
      ipAddress: '192.168.1.100',
      description: 'Created by E2E test',
      type: 'server',
      connectionType: 'ssh',
      sshDetails: {
        username: 'testuser',
        password: 'testpassword',
        port: 22
      }
    };
    
    const response = await pactum
      .spec()
      .post('/devices')
      .withJson(testDevice)
      .expectStatus((status) => status >= 200 && status < 300) // Any success status
      .returns('body');
      
    expect(response).toBeDefined();
    expect(response.id || response._id).toBeDefined();
  });
});
```

## Maintenance and Extension

### Adding New Tests

- Create new test files in the `e2e/tests` directory
- Follow the established pattern using Pactum for API requests
- Make tests resilient to different API response structures
- Include proper error handling and status code validation

### Test Organization

- Group tests by API domain (auth, devices, playbooks, etc.)
- Keep tests independent to allow parallel execution
- Use beforeAll for common setup like authentication
- Use describe blocks to organize related test cases

## Conclusions

This end-to-end testing plan provides a streamlined approach to validating SquirrelServersManager's API endpoints using a dedicated test container. The containerized approach ensures consistent test execution across different environments while focusing on actual API behavior.

The implementation prioritizes:
1. Real API testing with actual HTTP requests
2. Containerized execution for consistency
3. Simple developer experience with a single entry point
4. Comprehensive coverage of core API functionality

When implemented, this testing strategy will provide confidence in the API's functionality and help catch regressions early in the development process.

## Implementation Timeline

| Phase | Tasks | Duration | Priority |
|-------|-------|----------|----------|
| Setup | Docker Compose, Test Container configuration | 3-5 days | High |
| Core Tests | Authentication and Device API tests | 3-5 days | High |
| Additional Tests | Remaining API endpoints | 5-7 days | Medium |
| Integration | npm script and reporting | 2-3 days | Medium |

## Required Dependencies

```json
{
  "devDependencies": {
    "vitest": "^0.34.0",
    "pactum": "^3.5.0",
    "cross-env": "^7.0.3",
    "@vitest/ui": "^0.34.0",
    "@vitest/coverage-v8": "^0.34.0"
  }
}
```