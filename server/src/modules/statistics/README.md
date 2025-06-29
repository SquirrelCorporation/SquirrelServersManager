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
# Statistics Module

## Overview

The Statistics Module provides comprehensive functionality for collecting, analyzing, and presenting system statistics within the Squirrel Servers Manager application. It follows Clean Architecture principles to ensure separation of concerns and maintainability.

## Features

- Device statistics collection and analysis
- Device downtime tracking and reporting
- Dashboard metrics and visualization
- Prometheus metrics integration
- Real-time device monitoring
- Historical data analysis
- Performance metrics collection
- System health monitoring

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and interfaces:

- **Entities**
  - `device-downtime-event.entity.ts`: Device downtime tracking
- **Repository Interfaces**
  - `device-downtime-event-repository.interface.ts`: Downtime data access contract
- **Service Interfaces**
  - `metrics-service.interface.ts`: Metrics service contract
  - `device-stats-service.interface.ts`: Device statistics contract
  - `dashboard-service.interface.ts`: Dashboard data contract

### Application Layer

Contains the business logic and services:

- **Core Services**
  - `metrics.service.ts`: Core metrics management
  - `device-stats.service.ts`: Device statistics handling
  - `device-downtime.service.ts`: Downtime tracking
  - `dashboard.service.ts`: Dashboard data management

### Infrastructure Layer

Contains implementations of repositories and external integrations:

- **Repositories**
  - `device-downtime-event.repository.ts`: MongoDB repository for downtime events
- **Schemas**
  - `device-downtime-event.schema.ts`: Mongoose schema for downtime events
- **Mappers**
  - `device-downtime-event-repository.mapper.ts`: Maps between domain and database models
- **External Integration**
  - `prometheus.provider.ts`: Prometheus metrics integration

### Presentation Layer

Contains controllers for API endpoints:

- **Controllers**
  - `metrics.controller.ts`: Metrics endpoints
  - `device-stats.controller.ts`: Device statistics endpoints
  - `dashboard.controller.ts`: Dashboard data endpoints

## Module Structure

```
statistics/
├── domain/
│   ├── entities/
│   │   └── device-downtime-event.entity.ts
│   ├── repositories/
│   │   └── device-downtime-event-repository.interface.ts
│   └── interfaces/
│       ├── metrics-service.interface.ts
│       ├── device-stats-service.interface.ts
│       └── dashboard-service.interface.ts
├── application/
│   └── services/
│       ├── metrics.service.ts
│       ├── device-stats.service.ts
│       ├── device-downtime.service.ts
│       └── dashboard.service.ts
├── infrastructure/
│   ├── repositories/
│   │   └── device-downtime-event.repository.ts
│   ├── schemas/
│   │   └── device-downtime-event.schema.ts
│   ├── mappers/
│   │   └── device-downtime-event-repository.mapper.ts
│   └── prometheus/
│       └── prometheus.provider.ts
├── presentation/
│   └── controllers/
│       ├── metrics.controller.ts
│       ├── device-stats.controller.ts
│       └── dashboard.controller.ts
├── __tests__/
├── statistics.module.ts
├── index.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: DEVICE_DOWNTIME_EVENT, schema: DeviceDownTimeEventSchema },
    ]),
    DevicesModule,
    forwardRef(() => ContainersModule),
  ],
  controllers: [
    DashboardController,
    DeviceStatsController,
    MetricsController,
  ],
  providers: [
    // Core services
    PrometheusProvider,
    DashboardService,
    DeviceStatsService,
    DeviceDownTimeService,
    {
      provide: METRICS_SERVICE,
      useClass: MetricsService,
    },
    
    // Mappers and Repositories
    DeviceDownTimeEventRepositoryMapper,
    {
      provide: DEVICE_DOWNTIME_EVENT_REPOSITORY,
      useClass: DeviceDownTimeEventRepository,
    },
  ],
  exports: [
    DashboardService,
    DeviceStatsService,
    DeviceDownTimeService,
    {
      provide: METRICS_SERVICE,
      useClass: MetricsService,
    },
    PrometheusProvider,
  ],
})
```

## API Endpoints

### Dashboard

- `GET /statistics/dashboard`: Get dashboard overview
- `GET /statistics/dashboard/devices`: Get device statistics
- `GET /statistics/dashboard/performance`: Get performance metrics
- `GET /statistics/dashboard/history`: Get historical data

### Device Statistics

- `GET /statistics/devices/:id`: Get device statistics
- `GET /statistics/devices/:id/downtime`: Get device downtime history
- `GET /statistics/devices/:id/performance`: Get device performance metrics
- `GET /statistics/devices/:id/history`: Get device historical data

### Metrics

- `GET /statistics/metrics`: Get all metrics
- `GET /statistics/metrics/prometheus`: Get Prometheus metrics
- `GET /statistics/metrics/system`: Get system metrics
- `GET /statistics/metrics/devices`: Get device metrics

## Recent Changes

- Enhanced metrics collection system
- Improved device downtime tracking
- Added dashboard visualizations
- Enhanced Prometheus integration
- Improved historical data analysis
- Added comprehensive test coverage
