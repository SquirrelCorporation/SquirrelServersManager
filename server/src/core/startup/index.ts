import { DefaultValue, GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { Vault } from 'ansible-vault';
import { getFromCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import logger from '../../logger';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';

async function needConfigurationInit() {
  logger.info(`[CONFIGURATION] - needInit`);

  const vault = `$ANSIBLE_VAULT;1.1;AES256
65333839653535376466616231373932373636303038353635333466616231363464636662373261
3733356361326263366235326663626663396265646333300a616139363032316564306536653836
32636232326237626461653537366562306634656162636530333933646339376239353434633765
3764323861613266360a663362303738633834383632633662393262383132316533353234613966
6335`;

  const v = new Vault({ password: 'test' });
  v.decrypt(vault, undefined).then((e) => logger.info(e));
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
