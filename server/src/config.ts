export const db = {
  name: process.env.DB_NAME || 'ssm',
  host: process.env.DB_HOST || 'mongo',
  port: process.env.DB_PORT || '27017',
  user: process.env.DB_USER || '',
  password: process.env.DB_USER_PWD || '',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
};

export const redisConf = {
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const prometheusConf = {
  host: process.env.PROMETHEUS_HOST || `http://prometheus:9090`,
  baseURL: process.env.PROMETHEUS_BASE_URL || `/api/v1`,
};

export const SECRET = process.env.SECRET || '';
export const VAULT_PWD = process.env.VAULT_PWD || '';
export const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400000');
export const SSM_INSTALL_PATH = process.env.SSM_INSTALL_PATH || '/opt/squirrelserversmanager';
export const SSM_DATA_PATH = process.env.SSM_DATA_PATH || '/data';
export const TELEMETRY_ENABLED = process.env.TELEMETRY_ENABLED === 'true';
