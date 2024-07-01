import shell from 'shelljs';
import logger from '../../logger';

async function saveSshKey(key: string, uuid: string) {
  try {
    logger.info('[SHELL] - vaultSshKey Starting...');
    if (shell.exec(`echo '${key}' > /tmp/${uuid}.key`).code !== 0) {
      throw new Error('[SHELL] - vaultSshKey - Error creating tmp file');
    }
    if (shell.chmod(600, `/tmp/${uuid}.key`).code !== 0) {
      throw new Error('[SHELL] - vaultSshKey - Error chmoding file');
    }
  } catch (error) {
    logger.error('[SHELL] - vaultSshKey');
    throw error;
  }
}

export { saveSshKey };
