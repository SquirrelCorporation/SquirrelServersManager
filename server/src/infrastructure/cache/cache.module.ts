import { DynamicModule, Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { redisConf } from '../../config';
import { CacheService } from './cache.service';
import { CACHE_MODULE_OPTIONS } from './cache.constants';
import { CacheModuleOptions } from './interfaces/cache-options.interface';
import { CacheDefaultService } from './cache-default.service';

@Global()
@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions = {}): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        NestCacheModule.registerAsync({
          useFactory: async () => {
            const store = await redisStore({
              socket: {
                host: redisConf.host,
                port: redisConf.port,
              },
              ttl: options.ttl || 0, // 0 = no expiration
            });

            return {
              store,
              ttl: options.ttl,
            };
          },
        }),
      ],
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options,
        },
        CacheService,
        {
          provide: 'ICacheService',
          useExisting: CacheService,
        },
        CacheDefaultService,
      ],
      exports: [CacheService, 'ICacheService'],
    };
  }
}