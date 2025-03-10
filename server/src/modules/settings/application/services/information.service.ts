import { Inject, Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class InformationService {
  private readonly logger = new Logger(InformationService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
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
   * Get Redis server stats
   */
  async getRedisStats(): Promise<any> {
    try {
      // For now, return a mock response
      // In a real implementation, we would use the Redis client to get the info
      return {
        memory: {},
        cpu: {},
        stats: {},
        server: {},
      };
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
      // For now, return a mock response
      // In a real implementation, we would use the Prometheus client to get the stats
      return {};
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting Prometheus stats: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Parse Redis info string into an object
   * @param info Redis info string
   * @returns Parsed Redis info object
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