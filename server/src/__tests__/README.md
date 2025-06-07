# SquirrelServersManager Tests

This directory contains tests for the SquirrelServersManager server application.

## Structure

- **integration/** - Integration tests that test how multiple components work together
  - **controllers/** - Tests for REST API controllers
  - **modules/** - Tests for specific NestJS modules

## Running Tests

### Run All Tests

```bash
cd server
npm run test
```

### Run Specific Test

```bash
cd server
npx vitest run src/__tests__/integration/modules/health/health.controller.test.ts
```

### Run Tests in Watch Mode

```bash
cd server
npm run test:dev
```

## Writing Tests

### Integration Tests

Integration tests should:

1. Test how components interact with each other
2. Use mocks or in-memory databases when appropriate
3. Follow the file naming pattern: `*.test.ts`
4. Be placed in a directory structure that mirrors the application structure

Example test structure:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../server';

describe('ModuleName (Integration)', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /endpoint', () => {
    it('should return expected result', async () => {
      const response = await request(app)
        .get('/endpoint')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      // More assertions...
    });
  });
});
```

## Test Databases

The tests use an in-memory MongoDB instance via `mongodb-memory-server`. This is set up in the `vitest.setup.ts` file and ensures tests don't affect any real databases.