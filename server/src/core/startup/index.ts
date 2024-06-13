import { SettingsKeys } from 'ssm-shared-lib';
import { getFromCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import providerConf from '../../integrations/docker/registries/providers/provider.conf';
import logger from '../../logger';
import ContainerRegistryUseCases from '../../use-cases/ContainerRegistryUseCases';
import DeviceAuthUseCases from '../../use-cases/DeviceAuthUseCases';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';
import { setAnsibleVersion } from '../system/version';

async function needConfigurationInit() {
  logger.info(`[CONFIGURATION] - needInit`);
  void DeviceAuthUseCases.saveAllDeviceAuthSshKeys();

  const version = await getFromCache(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);

  logger.info(`[CONFIGURATION] - needInit - Scheme Version: ${version}`);

  if (version !== SettingsKeys.DefaultValue.SCHEME_VERSION) {
    await initRedisValues();
    await PlaybookUseCases.initPlaybook();
    void setAnsibleVersion();

    providerConf
      .filter(({ persist }) => persist)
      .map((e) => {
        ContainerRegistryUseCases.addIfNotExists(e);
      });
  }
}

export default {
  needConfigurationInit,
};
