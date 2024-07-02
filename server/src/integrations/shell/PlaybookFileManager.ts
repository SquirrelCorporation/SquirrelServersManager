import logger from '../../logger';
import shellWrapper from './ShellWrapper';
import { shellCmdWrapper } from './utils';

const childLogger = logger.child({ module: 'PlaybookManager' });

class PlaybookFileManager {
  readPlaybook = shellCmdWrapper(shellWrapper.cat, childLogger, 'readPlaybook');
  editPlaybook = shellCmdWrapper(shellWrapper.touch, childLogger, 'editPlaybook');
  newPlaybook = shellCmdWrapper(shellWrapper.touch, childLogger, 'newPlaybook');
  deletePlaybook = shellCmdWrapper(shellWrapper.rm, childLogger, 'deletePlaybook');

  readConfigIfExists(path: string) {
    try {
      childLogger.info('readPlaybookConfiguration - Starting...');
      if (!shellWrapper.test('-f', `${path}`)) {
        childLogger.info('readPlaybookConfiguration - Not found');
        return undefined;
      }
      return shellWrapper.cat(`${path}`);
    } catch (error) {
      childLogger.error('readPlaybookConfiguration - Failed');
      throw new Error('readPlaybookConfiguration failed');
    }
  }
}

export default new PlaybookFileManager();
