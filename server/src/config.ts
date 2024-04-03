export const db = {
  name: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  port: process.env.DB_PORT || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_USER_PWD || '',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
};

export const redisConf = {
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const SECRET = process.env.SECRET || '';
export const VAULT_PWD = process.env.VAULT_PWD || '';
export const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400000');
