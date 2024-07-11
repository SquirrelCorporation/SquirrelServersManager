import { RedisClientType, createClient } from 'redis';
import { redisConf } from '../../config';
import logger from '../../logger';

let redisClient: RedisClientType;
let isReady: boolean = false;

export const dbURI = `redis://${redisConf.host}:${redisConf.port}`;
const childLogger = logger.child({ module: 'redis' }, { msgPrefix: '[REDIS] - ' });

async function createRedisClient(): Promise<any> {
  const redisClient = createClient({
    url: dbURI,
  });
  redisClient
    .on('error', (err) => childLogger.error('Redis Client Error', err))
    .on('connect', () => childLogger.info('Successfully connected to Redis'))
    .on('ready', () => {
      isReady = true;
      childLogger.info(' Redis ready');
    });

  await redisClient.connect();

  return redisClient;
}

async function getRedisClient(): Promise<RedisClientType> {
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
