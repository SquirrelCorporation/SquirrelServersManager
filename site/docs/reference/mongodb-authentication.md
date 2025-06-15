---
layout: FeatureGuideLayout
title: MongoDB Authentication
icon: "📚" # Books/reference icon
time: "5 min read"
signetColor: '#23233e'
credits: true
feedbackSupport: true
---

# MongoDB Authentication Configuration

SquirrelServersManager supports both authenticated and non-authenticated MongoDB connections. This flexibility allows you to run SSM in development without authentication or in production with full security.

## Overview

SSM automatically detects whether to use authentication based on the presence of database credentials in your environment variables. When `DB_USER` and `DB_USER_PWD` are empty or not set, SSM connects without authentication. When they are provided, SSM uses them to authenticate.

## Configuration

### Environment Variables

The following environment variables control MongoDB authentication:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_USER` | MongoDB username | _(empty)_ | No |
| `DB_USER_PWD` | MongoDB password | _(empty)_ | No |
| `DB_AUTH_SOURCE` | Database to authenticate against | `admin` | No |

### Running Without Authentication

For development or trusted environments, you can run MongoDB without authentication:

1. Leave `DB_USER` and `DB_USER_PWD` empty or commented out in your `.env` file:
   ```env
   # MONGO
   DB_HOST=mongo
   DB_NAME=ssm
   DB_PORT=27017
   #DB_USER=
   #DB_USER_PWD=
   ```

2. Start SSM normally:
   ```bash
   docker-compose up -d
   ```

### Running With Authentication

For production environments, enable MongoDB authentication:

1. Set the authentication variables in your `.env` file:
   ```env
   # MONGO
   DB_HOST=mongo
   DB_NAME=ssm
   DB_PORT=27017
   DB_USER=ssm_user
   DB_USER_PWD=your_secure_password
   DB_AUTH_SOURCE=admin  # Optional, defaults to 'admin'
   ```

2. For Docker Compose deployments, add authentication to MongoDB:

   Create a `docker-compose.override.yml` file:
   ```yaml
   services:
     mongo:
       command: --quiet --auth
       environment:
         MONGO_INITDB_ROOT_USERNAME: ${DB_USER}
         MONGO_INITDB_ROOT_PASSWORD: ${DB_USER_PWD}
         MONGO_INITDB_DATABASE: ${DB_NAME}
   ```

3. Start SSM:
   ```bash
   docker-compose up -d
   ```

## MongoDB Initialization

When running with authentication for the first time, MongoDB needs to create the initial user. SSM handles this automatically through MongoDB's initialization process.

### Automatic Database Creation

SSM will automatically create:
- The main application database (specified by `DB_NAME`)
- Required collections (e.g., `logs`)
- Plugin databases (e.g., `todo_plugin`)

### Custom Initialization Script

If you need custom initialization, create a `mongo-init.js` file:

```javascript
// Switch to application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Create custom collections
db.createCollection("custom_collection");

// Create indexes
db.custom_collection.createIndex({ timestamp: -1 });

// Additional plugin databases
const pluginDatabases = ["custom_plugin_db"];
pluginDatabases.forEach(function(dbName) {
  var pluginDb = db.getSiblingDB(dbName);
  pluginDb.createCollection("_init");
});
```

Mount it in your `docker-compose.override.yml`:
```yaml
services:
  mongo:
    volumes:
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
```

## Understanding authSource

The `DB_AUTH_SOURCE` variable specifies which database MongoDB should use to authenticate the user credentials.

### Common Scenarios

1. **Default Setup** (`authSource=admin`)
   - Most common configuration
   - User credentials are stored in MongoDB's `admin` database
   - Recommended for standard deployments

2. **Application Database** (`authSource=ssm`)
   - User credentials stored in the application database itself
   - Useful for isolated deployments

3. **Dedicated Auth Database** (`authSource=auth_db`)
   - Separate database for all authentication
   - Common in enterprise environments

### Example Configurations

```env
# Standard setup - user in admin database
DB_USER=ssm_user
DB_USER_PWD=secure_password
DB_AUTH_SOURCE=admin

# User in application database
DB_USER=app_user
DB_USER_PWD=secure_password
DB_AUTH_SOURCE=ssm

# Enterprise setup with dedicated auth database
DB_USER=enterprise_user
DB_USER_PWD=secure_password
DB_AUTH_SOURCE=corporate_auth
```

## Switching Between Modes

### From No-Auth to Auth

1. Stop SSM:
   ```bash
   docker-compose down
   ```

2. Update your `.env` file with credentials

3. Add authentication configuration to `docker-compose.override.yml`

4. Start SSM:
   ```bash
   docker-compose up -d
   ```

### From Auth to No-Auth

1. Stop SSM:
   ```bash
   docker-compose down
   ```

2. Comment out or remove credentials from `.env`:
   ```env
   #DB_USER=
   #DB_USER_PWD=
   ```

3. Remove or comment out the authentication command in `docker-compose.override.yml`

4. Start SSM:
   ```bash
   docker-compose up -d
   ```

## Development Setup

For development, you can easily switch between authenticated and non-authenticated modes:

```bash
# Run without auth (using default .env.dev)
docker-compose -f docker-compose.dev.yml up -d

# Run with auth (using custom env file)
docker-compose --env-file .env.auth -f docker-compose.dev.yml up -d
```

<TroubleshootingSection
  :items="[
    {
      issue: 'Authentication failed errors',
      solutions: [
        'Verify DB_USER and DB_USER_PWD are correctly set in your .env file',
        'Check that MongoDB container has --auth flag when authentication is enabled',
        'Ensure DB_AUTH_SOURCE matches where the user was created (usually admin)',
        'Try connecting manually: docker exec mongo mongosh -u $DB_USER -p $DB_USER_PWD --authenticationDatabase $DB_AUTH_SOURCE'
      ]
    },
    {
      issue: 'Command insert requires authentication',
      solutions: [
        'MongoDB is running with --auth but credentials are not provided',
        'Check that all SSM services have access to the same .env file',
        'Verify environment variables are loaded: docker exec ssm-server env | grep DB_'
      ]
    },
    {
      issue: 'UserNotFound errors',
      solutions: [
        'The user might be in a different database than expected',
        'Check DB_AUTH_SOURCE value - it should match where the user was created',
        'For MongoDB initialized with MONGO_INITDB_ROOT_USERNAME, the user is in admin database'
      ]
    },
    {
      issue: 'Connection timeouts with authentication',
      solutions: [
        'MongoDB initialization might still be in progress',
        'Check MongoDB logs: docker logs mongo',
        'Ensure MongoDB healthcheck passes before starting SSM services'
      ]
    }
  ]"
/>

## Best Practices

1. **Always use authentication in production** - Never expose MongoDB without authentication in production environments

2. **Use strong passwords** - Generate secure passwords for database users

3. **Limit network exposure** - Don't expose MongoDB ports publicly unless necessary

4. **Regular backups** - Authentication doesn't replace the need for regular backups

5. **Monitor access** - Review MongoDB logs regularly for unauthorized access attempts

## Related Documentation

- [Environment Variables Reference](/docs/reference/environment-variables)
- [Troubleshooting Guide](/docs/troubleshoot)
- [Docker Configuration](/docs/reference/docker-configuration)