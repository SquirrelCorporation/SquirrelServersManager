import mongoose from 'mongoose';
import { API } from 'ssm-shared-lib';
import { getRedisClient } from '../../../data/cache';
import { prometheusServerStats } from '../../../data/statistics/server-stats';
import { parseRedisInfo } from '../../../helpers/redis/redis-info';
import logger from '../../../logger';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getMongoDBServerStats = async (req, res) => {
  const serverStatus = await mongoose.connection.db?.admin().serverStatus();
  try {
    const data: API.MongoDBServerStats = {
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
    new SuccessResponse(`Got MongoDB server stats`, data).send(res);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// Get detailed database storage stats
export const getStorageStats = async (req, res) => {
  const dbStats = await mongoose.connection.db?.stats();
  const data = {
    dataSize: dbStats?.dataSize, // Size of all documents
    storageSize: dbStats?.storageSize, // Total storage allocated
    indexSize: dbStats?.indexSize, // Total size of all indexes
    totalSize: dbStats?.totalSize, // Total size (data + indexes)
    scaleFactor: dbStats?.scaleFactor, // Scaling factor for sizes
  };
  new SuccessResponse(`Got MongoDB server storage stats`, data).send(res);
};

export const getRedisServerStats = async (req, res) => {
  const client = await getRedisClient();

  const memory = await client.info('memory');
  const cpu = await client.info('cpu');
  const stats = await client.info('stats');
  const server = await client.info('server');
  const data = {
    memory: parseRedisInfo(memory), // Memory usage, peak memory, etc.
    cpu: parseRedisInfo(cpu), // CPU statistics
    stats: parseRedisInfo(stats), // General statistics
    server: parseRedisInfo(server), // Server information
  };

  new SuccessResponse(`Got Redis server stats`, data).send(res);
};

export const getPrometheusServerStats = async (req, res) => {
  const data = await prometheusServerStats();
  new SuccessResponse(`Got Prometheus server stats`, data).send(res);
};
