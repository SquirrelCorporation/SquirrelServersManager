import logger from '../../logger';

export const REDIS_SCHEME_VERSION = '2';

const REDIS_DEFAULT_VALUES = [
  { key: 'scheme-version', value: REDIS_SCHEME_VERSION, nx: false },
  { key: 'clean', value: 30, nx: true },
  { key: 'def', value: 'test', nx: true },
];

async function initRedisValues(client) {
  for (const value of REDIS_DEFAULT_VALUES) {
    logger.info(
      `[REDIS] - initRedisValues - Setting default configuration ${value.key} to ${value.value}`,
    );
    await client.set(value.key, value.value, {
      NX: value.nx,
    });
  }
}

export default initRedisValues;
