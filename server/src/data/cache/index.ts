import { RedisClientType, createClient } from 'redis';
import { redisConf } from '../../config';
import logger from '../../logger';

let redisClient: RedisClientType;
let isReady: boolean = false;

export const dbURI = `redis://${redisConf.host}:${redisConf.port}`;
const childLogger = logger.child({ module: 'Cache' }, { msgPrefix: '[CACHE] - ' });

async function createRedisClient(): Promise<any> {
  logger.info(`createRedisClient - Connecting to ${dbURI}`);
  const redisClient = createClient({
    url: dbURI,
  });
  redisClient
    .on('error', (err) => childLogger.error(`createRedisClient- Client error: ${err.message}`))
    .on('connect', () => childLogger.info('createRedisClient - Successfully connected to cache'))
    .on('ready', () => {
      isReady = true;
      childLogger.info('createRedisClient - Cache ready');
    });

  await redisClient.connect();

  return redisClient;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (!isReady) {
    redisClient = await createRedisClient();
  }

  return redisClient;
}

export async function getFromCache(key: string): Promise<string | null> {
  const client = await getRedisClient();
  return await client.get(key);
}

export async function getConfFromCache(key: string): Promise<string> {
  const value = await getFromCache(key);
  if (!value) {
    throw new Error(`[REDIS] Configuration key ${key} doesnt exist`);
  }
  return value;
}

export async function getIntConfFromCache(key: string): Promise<number> {
  const value = await getConfFromCache(key);
  return parseInt(value);
}

export async function setToCache(
  key: string,
  value: string,
  options?: any,
): Promise<void | string | null> {
  const client = await getRedisClient();
  return (await client.set(key, value, options)) as unknown as Promise<void | string | null>;
}
