import shell from 'shelljs';
import logger from '../../logger';

async function readPlaybook(playbook: string) {
  try {
    logger.info(`[SHELL] - readPlaybook - ${playbook}  - Starting...`);
    return shell.cat(playbook).toString();
  } catch (error) {
    logger.error('[SHELL] - readPlaybook');
    throw new Error('readPlaybook failed');
  }
}

async function readPlaybookConfigurationFileIfExists(path: string) {
  try {
    logger.info(`[SHELL] - readPlaybookConfiguration - ${path} - Starting...`);
    if (!shell.test('-f', `${path}`)) {
      logger.info(`[SHELL] - readPlaybookConfiguration - not found`);
      return undefined;
    }
    return shell.cat(`${path}`).toString();
  } catch (error) {
    logger.error('[SHELL] - readPlaybookConfiguration');
    throw new Error('readPlaybookConfiguration failed');
  }
}

async function editPlaybook(playbookPath: string, content: string) {
  try {
    logger.info('[SHELL] - editPlaybook - Starting...');
    shell.ShellString(content).to(playbookPath);
  } catch (error) {
    logger.error('[SHELL] - editPlaybook');
    throw new Error('editPlaybook failed');
  }
}

async function newPlaybook(fullFilePath: string) {
  try {
    logger.info('[SHELL] - newPlaybook - Starting...');
    shell.touch(fullFilePath);
  } catch (error) {
    logger.error('[SHELL] - newPlaybook');
    throw new Error('newPlaybook failed');
  }
}

async function deletePlaybook(playbookPath: string) {
  try {
    logger.info('[SHELL] - deletePlaybook - Starting...');
    shell.rm(playbookPath);
  } catch (error) {
    logger.error('[SHELL] - deletePlaybook');
    throw new Error('deletePlaybook failed');
  }
}

export {
  readPlaybookConfigurationFileIfExists,
  readPlaybook,
  editPlaybook,
  newPlaybook,
  deletePlaybook,
};
