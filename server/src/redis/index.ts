import { createClient } from 'redis';
import { redisConf } from '../config';
import logger from '../logger';
import initRedisValues, { REDIS_SCHEME_VERSION } from './defaults';

export const dbURI = `redis://${redisConf.host}:${redisConf.port}`;

async function connectRedis() {
  const client = await createClient({
    url: dbURI,
  })
    .on('error', (err) => logger.error('[REDIS] - Redis Client Error', err))
    .on('connect', () => logger.info('[REDIS] - Successfully connected to Redis'))
    .on('ready', () => logger.info('[REDIS] - Redis ready'))
    .connect();

  await client.get('scheme-version').then(async (e) => {
    if (e !== REDIS_SCHEME_VERSION) {
      await initRedisValues(client);
    }
  });
  // If the Node process ends, close the Redis connection
  process.on('SIGINT', () => {
    client.quit();
    logger.info('[REDIS] Redis default connection disconnected through app termination');
    process.exit(0);
  });
  return client;
}

export default connectRedis;
