import path from 'path';
import logger from '../../../logger';
import shellWrapper from '../ShellWrapper';
import { AbstractShellCommander } from '../AbstractShellCommander';

class SshPrivateKeyFileManager extends AbstractShellCommander {
  constructor() {
    super(logger.child({ module: 'Authentication' }), 'Authentication');
  }

  async saveSshKey(key: string, uuid: string) {
    try {
      this.logger.info('vaultSshKey Starting...');

      const keyFilePath = path.join('/tmp', `${uuid}.key`);

      this.executeCommand(shellWrapper.to, key, keyFilePath);

      if (this.executeCommand(shellWrapper.chmod, '600', keyFilePath).code !== 0) {
        throw new Error('vaultSshKey - Error chmoding file');
      }
    } catch (error) {
      this.logger.error('vaultSshKey');
      throw error;
    }
  }
}

export default new SshPrivateKeyFileManager();
