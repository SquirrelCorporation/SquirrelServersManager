# MongoDB Authentication Fix Documentation

## Problem Summary
Users reported authentication failures when using MongoDB with custom `authSource` settings. The issue occurred because:
1. The MongooseModule configuration in `app.module.ts` was hardcoding `authSource: 'admin'`
2. The pino-mongodb logger configuration was missing the `authSource` parameter entirely

When users had MongoDB users created in custom databases (e.g., `mash-ssm`), the authentication would fail because the code was looking for users in the wrong database.

## Root Cause
MongoDB authentication works by looking for users in a specific database (the `authSource`). When not specified:
- MongoDB defaults to using the connection database name as the authSource
- Our code was overriding this with hardcoded `authSource: 'admin'`

### User's Scenario
```bash
# User created in 'mash-ssm' database
DB_AUTH_SOURCE=mash-ssm
DB_USER=mash-ssm
DB_NAME=mash-ssm

# But code was looking in 'admin' database → Authentication failed
```

## Fix Applied

### 1. Fixed MongooseModule Configuration
**File**: `src/app.module.ts` (line 203)

**Before**:
```typescript
...(db.user && db.password && { authSource: 'admin' }),
```

**After**:
```typescript
...(db.user && db.password && { authSource: db.authSource }),
```

### 2. Fixed Pino MongoDB Logger Configuration
**File**: `src/app.module.ts` (line 79)

**Before**:
```typescript
mongoOptions: {
  auth: {
    username: db.user,
    password: db.password,
  },
  // authSource was missing!
},
```

**After**:
```typescript
mongoOptions: {
  auth: {
    username: db.user,
    password: db.password,
  },
  authSource: db.authSource,
},
```

## Tests Created

### 1. Unit Tests (`app-module-mongodb-config.spec.ts`)
- Verifies configuration building logic
- Tests edge cases (special characters, missing auth)
- Regression test to prevent hardcoding

### 2. Integration Tests (`mongodb-connection.spec.ts`)
- Tests connection string building
- Verifies both Mongoose and pino-mongodb patterns
- Tests the exact user scenario

### 3. Behavior Tests (`mongodb-auth-behavior.spec.ts`)
- Tests with real MongoDB instances (mongodb-memory-server)
- Demonstrates why hardcoding fails
- Verifies the fix works with actual authentication

## How MongoDB Authentication Works

1. **Default Behavior**: When `authSource` is not specified in the connection string, MongoDB uses the database name as the authSource
2. **Options Override**: When `authSource` is specified in connection options, it overrides any default
3. **Our Issue**: We were hardcoding `authSource: 'admin'`, ignoring user configuration

## Testing the Fix

Run the tests:
```bash
npm run test -- src/__tests__/unit/app-module-mongodb-config.spec.ts
npm run test -- src/__tests__/integration/infrastructure/mongodb-connection.spec.ts  
npm run test -- src/__tests__/integration/infrastructure/mongodb-auth-behavior.spec.ts
```

## Environment Configuration

Users can now properly configure authentication:
```env
DB_HOST=mongodb-host
DB_PORT=27017
DB_NAME=mydb
DB_USER=myuser
DB_USER_PWD=mypassword
DB_AUTH_SOURCE=myauthdb  # This is now respected!
```

If `DB_AUTH_SOURCE` is not set, it defaults to `'admin'` (MongoDB standard).

## Verification Steps

1. Both MongoDB connections now use the configured `authSource`
2. Pino logger can authenticate to MongoDB with custom auth databases
3. All existing functionality remains intact
4. Tests prevent regression to hardcoded values