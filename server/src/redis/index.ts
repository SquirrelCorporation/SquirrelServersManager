import { RedisClientType, createClient } from 'redis';
import { redisConf } from '../config';
import logger from '../logger';
import keys from './defaults/keys';
import initRedisValues from './defaults';

let redisClient: RedisClientType;
let isReady: boolean = false;

export const dbURI = `redis://${redisConf.host}:${redisConf.port}`;

async function createRedisClient(): Promise<any> {
  const redisClient = createClient({
    url: dbURI,
  });
  redisClient
    .on('error', (err) => logger.error('[REDIS] - Redis Client Error', err))
    .on('connect', () => logger.info('[REDIS] - Successfully connected to Redis'))
    .on('ready', () => {
      isReady = true;
      logger.info('[REDIS] - Redis ready');
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

export async function redisInit() {
  logger.info(`[REDIS] - redisInit`);
  return await getFromCache(keys.GeneralSettingsKeys.SCHEME_VERSION).then(async (version) => {
    logger.info(`[REDIS] - redisInit - Scheme Version: ${version}`);
    if (version !== keys.GeneralSettingsDefaultValue.SCHEME_VERSION) {
      await initRedisValues();
    }
  });
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
