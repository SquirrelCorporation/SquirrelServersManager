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

The Statistics Module provides a NestJS implementation for device statistics and dashboard metrics functionality.

## Overview

This module handles:
- Device performance metrics (CPU, memory, disk usage)
- Dashboard statistics (system performance, availability)
- Historical and real-time statistics

## Components

### Controllers

1. **DashboardController**
   - Endpoints for dashboard-related statistics
   - Performance metrics
   - Availability metrics
   - Aggregated statistics

2. **DeviceStatsController**
   - Device-specific statistics
   - Historical and current metrics

### Services

1. **DashboardService**
   - System performance calculations
   - Availability statistics
   - Aggregated metrics across devices

2. **DeviceStatsService**
   - Device-specific metrics retrieval
   - Historical data querying
   - Metric aggregation

3. **DeviceDownTimeService**
   - Device availability calculations
   - Downtime tracking

## Infrastructure Dependencies

The module uses the PrometheusService from the infrastructure layer to query metrics data. This service is injected as a provider rather than being part of the module itself.

## Usage

Import the StatisticsModule into your AppModule:

```typescript
import { Module } from '@nestjs/common';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    StatisticsModule,
    // other modules...
  ],
})
export class AppModule {}
```

## API Endpoints

### Dashboard Statistics

- `GET /dashboard/stats/performances` - Get system performance metrics
- `GET /dashboard/stats/availability` - Get system availability metrics
- `POST /dashboard/stats/averaged/:type` - Get averaged stats for specific devices
- `POST /dashboard/stats/:type` - Get dashboard stats by type

### Device Statistics

- `GET /devices/:uuid/stats/:type` - Get device stats by type
- `GET /devices/:uuid/stat/:type` - Get latest device stat by type

## Testing

Tests for this module are located in the `__tests__` directory. Run them using:

```bash
npm test -- modules/statistics
```
