import { DefaultValue, GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import logger from '../logger';
import initRedisValues from '../redis/defaults';
import { getFromCache } from '../redis';
import PlaybookUseCases from '../use-cases/PlaybookUseCases';

async function needConfigurationInit() {
  logger.info(`[CONFIGURATION] - needInit`);
  return await getFromCache(GeneralSettingsKeys.SCHEME_VERSION).then(async (version) => {
    logger.info(`[CONFIGURATION] - needInit - Scheme Version: ${version}`);
    if (version !== DefaultValue.SCHEME_VERSION + 1) {
      await initRedisValues();
      await PlaybookUseCases.initPlaybook();
    }
  });
}

export default {
  needConfigurationInit,
};
