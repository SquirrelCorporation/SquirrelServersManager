import logger from '../../logger';
import { setToCache } from '../index';
import Keys from './keys';

const REDIS_DEFAULT_VALUES: { key: string; value: string; nx: boolean }[] = [
  {
    key: Keys.GeneralSettingsKeys.SCHEME_VERSION,
    value: Keys.GeneralSettingsDefaultValue.SCHEME_VERSION,
    nx: false,
  },
  {
    key: Keys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
    value: Keys.GeneralSettingsDefaultValue.SERVER_LOG_RETENTION_IN_DAYS,
    nx: true,
  },
  {
    key: Keys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
    value: Keys.GeneralSettingsDefaultValue.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
    nx: true,
  },
  {
    key: Keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    value: Keys.GeneralSettingsDefaultValue.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    nx: true,
  },
  {
    key: Keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    value: Keys.GeneralSettingsDefaultValue.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    nx: true,
  },
  {
    key: Keys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
    value: Keys.GeneralSettingsDefaultValue.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
    nx: true,
  },
  {
    key: Keys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
    value: Keys.GeneralSettingsDefaultValue.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
    nx: true,
  },
];

async function initRedisValues(force?: boolean) {
  for (const value of REDIS_DEFAULT_VALUES) {
    logger.info(
      `[REDIS] - initRedisValues - Setting default configuration ${value.key} to ${value.value}`,
    );
    await setToCache(value.key, value.value, {
      NX: force ? false : value.nx,
    });
  }
}

export default initRedisValues;
