import { DefaultValue, GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { getFromCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import providerConf from '../../integrations/docker/registries/providers/provider.conf';
import logger from '../../logger';
import ContainerRegistryUseCases from '../../use-cases/ContainerRegistryUseCases';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';
import { setAnsibleVersion } from '../system/version';

async function needConfigurationInit() {
  logger.info(`[CONFIGURATION] - needInit`);
  return await getFromCache(GeneralSettingsKeys.SCHEME_VERSION).then(async (version) => {
    logger.info(`[CONFIGURATION] - needInit - Scheme Version: ${version}`);
    if (version !== DefaultValue.SCHEME_VERSION + 1) {
      await initRedisValues();
      await PlaybookUseCases.initPlaybook();
      await setAnsibleVersion();
      providerConf
        .filter((e) => e.persist)
        .map((e) => {
          ContainerRegistryUseCases.addIfNotExists(e);
        });
    }
  });
}

export default {
  needConfigurationInit,
};
