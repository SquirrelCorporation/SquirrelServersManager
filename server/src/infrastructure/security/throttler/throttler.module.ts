import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule as NestThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// Using direct Redis client instead of specific storage service that might not be available
import Redis from 'ioredis';
import { redisConf } from '../../../config';

@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      useFactory: async () => ({
        throttlers: [
          {
            ttl: 60, // Time-to-live - how long to keep record of requests in seconds
            limit: 60, // Max number of requests within the TTL
          },
        ],
        // Using the built-in store mechanism instead of custom redis service
        ignoreUserAgents: [
          // Don't throttle requests from health check services
          /health/i,
          /monitoring/i,
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottlerModule {}
