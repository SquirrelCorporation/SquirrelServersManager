import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import mongoose from 'mongoose';
import {
  IPrometheusService,
  PROMETHEUS_SERVICE,
} from '../../../../infrastructure/prometheus/prometheus.interface';
import { IInformationService } from '../../domain/interfaces/information-service.interface';

@Injectable()
export class InformationService implements IInformationService {
  private readonly logger = new Logger(InformationService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(PROMETHEUS_SERVICE)
    private readonly prometheusService: IPrometheusService,
  ) {}

  /**
   * Get MongoDB server stats
   */
  async getMongoDBStats(): Promise<any> {
    try {
      const serverStatus = await mongoose.connection.db?.admin().serverStatus();

      return {
        // Memory metrics
        memory: {
          resident: serverStatus?.mem?.resident, // Resident memory in MB
          virtual: serverStatus?.mem?.virtual, // Virtual memory in MB
          mapped: serverStatus?.mem?.mapped, // Memory mapped size
        },

        // Connections
        connections: serverStatus?.connections, // Current, available, total connections

        // CPU metrics
        cpu: {
          userPercent: serverStatus?.cpu?.user,
          systemPercent: serverStatus?.cpu?.sys,
          idlePercent: serverStatus?.cpu?.idle,
        },

        // Operations metrics
        operations: serverStatus?.opcounters, // Insert, query, update, delete counts
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting MongoDB stats: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get Redis server stats (Method required by interface)
   */
  async getRedisStats(): Promise<any> {
    try {
      // Try accessing the first store in the 'stores' array
      const store = (this.cacheManager as any).stores as any;
      // Get client from the first store
      const client = store?.[0]?.getClient?.();

      if (!client || typeof client.info !== 'function') {
        this.logger.warn('Could not get Redis client or client does not support INFO command.');
        return {
          status: 'error',
          error: 'Could not access Redis INFO command sections.',
        };
      }

      const [
        memoryInfo,
        cpuInfo,
        statsInfo,
        serverInfo,
        clientsInfo,
        replicationInfo,
        keyspaceInfo,
      ] = await Promise.all([
        client.info('memory').catch((e) => {
          this.logger.error(e, 'Failed to get Redis memory info');
          return null;
        }),
        client.info('cpu').catch((e) => {
          this.logger.error(e, 'Failed to get Redis cpu info');
          return null;
        }),
        client.info('stats').catch((e) => {
          this.logger.error(e, 'Failed to get Redis stats info');
          return null;
        }),
        client.info('server').catch((e) => {
          this.logger.error(e, 'Failed to get Redis server info');
          return null;
        }),
        client.info('clients').catch((e) => {
          this.logger.error(e, 'Failed to get Redis clients info');
          return null;
        }),
        client.info('replication').catch((e) => {
          this.logger.error(e, 'Failed to get Redis replication info');
          return null;
        }),
        client.info('keyspace').catch((e) => {
          this.logger.error(e, 'Failed to get Redis keyspace info');
          return null;
        }),
      ]);

      const data = {
        server: this.parseRedisInfo(serverInfo),
        clients: this.parseRedisInfo(clientsInfo),
        memory: this.parseRedisInfo(memoryInfo),
        cpu: this.parseRedisInfo(cpuInfo),
        stats: this.parseRedisInfo(statsInfo),
        replication: this.parseRedisInfo(replicationInfo),
        keyspace: this.parseRedisInfo(keyspaceInfo),
      };

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting Redis stats: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get Prometheus server stats
   */
  async getPrometheusStats(): Promise<any> {
    try {
      return this.prometheusService.prometheusServerStats();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting Prometheus stats: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Parse Redis info string into an object (Handles null/undefined input)
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const parts = line.split(':');
        if (parts.length === 2) {
          result[parts[0]] = parts[1];
        }
      }
    }
    return result;
  }
}
