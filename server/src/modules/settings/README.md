  ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     `"=\_  )_"`
          ``'"`
Squirrel Servers Manager 🐿️
---
# Settings Module

The Settings module is responsible for managing application settings and configurations within the Squirrel Servers Manager application. It provides a comprehensive set of features for settings management, including CRUD operations, default values, and caching.

## Features

- Settings management
- Default settings initialization
- Settings caching
- Settings validation
- Settings persistence

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer
- **Entities**: Defines the core business entities like `Setting`
- **Repository Interfaces**: Defines interfaces for data access like `ISettingRepository`

### Application Layer
- **Service Interfaces**: Defines interfaces for business logic like `ISettingsService`
- **Services**: Implements the business logic for settings management

### Infrastructure Layer
- **Repositories**: Implements the repository interfaces for data access
- **Cache Integration**: Integrates with the cache system for settings storage

### Presentation Layer
- **Controllers**: Handles HTTP requests and responses
- **DTOs**: Defines the data transfer objects for request/response validation

## API Endpoints

### POST /settings/dashboard/:key
Updates a dashboard setting.

### POST /settings/devices/:key
Updates a devices setting.

### POST /settings/logs/:key
Updates a logs setting.

### POST /settings/device-stats/:key
Updates a device stats setting.

### POST /settings/keys/master-node-url
Updates the master node URL.

### POST /settings/advanced/restart
Restarts the server.

### DELETE /settings/advanced/logs
Deletes logs.

### DELETE /settings/advanced/ansible-logs
Deletes Ansible logs.

### DELETE /settings/advanced/playbooks-and-resync
Deletes playbooks and initiates a resync.

### GET /settings/information/mongodb
Gets MongoDB server stats.

### GET /settings/information/redis
Gets Redis server stats.

### GET /settings/information/prometheus
Gets Prometheus server stats. 