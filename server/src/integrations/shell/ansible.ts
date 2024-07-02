import shell from 'shelljs';
import { v4 as uuidv4 } from 'uuid';
import { API } from 'ssm-shared-lib';
import User from '../../data/database/model/User';
import AnsibleTaskRepo from '../../data/database/repository/AnsibleTaskRepo';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import logger from '../../logger';
import { Playbooks } from '../../types/typings';
import ansibleCmd from '../ansible/AnsibleCmd';
import AnsibleGalaxyCmd from '../ansible/AnsibleGalaxyCmd';
import Inventory from '../ansible/utils/InventoryTransformer';

export const ANSIBLE_PATH = '/server/src/ansible/';

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executePlaybook(
  playbookPath: string,
  user: User,
  target?: string[],
  extraVars?: API.ExtraVars,
) {
  logger.info('[SHELL] - executePlaybook - Starting...');

  let inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined;
  if (target) {
    logger.info(`[SHELL] - executePlaybook - called with target: ${target}`);
    const devicesAuth = await DeviceAuthRepo.findManyByDevicesUuid(target);
    if (!devicesAuth || devicesAuth.length === 0) {
      logger.error(`[SHELL] - executePlaybook - Target not found (Authentication not found)`);
      throw new Error('Exec failed, no matching target (Authentication not found)');
    }
    inventoryTargets = Inventory.inventoryBuilderForTarget(devicesAuth);
  }
  return await executePlaybookOnInventory(playbookPath, user, inventoryTargets, extraVars);
}

async function executePlaybookOnInventory(
  playbookPath: string,
  user: User,
  inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
  extraVars?: API.ExtraVars,
) {
  shell.cd(ANSIBLE_PATH);
  shell.rm('/server/src/playbooks/inventory/hosts');
  shell.rm('/server/src/playbooks/env/_extravars');
  const uuid = uuidv4();
  const result = await new Promise<string | null>((resolve) => {
    const cmd = ansibleCmd.buildAnsibleCmd(playbookPath, uuid, inventoryTargets, user, extraVars);
    logger.info(`[SHELL] - executePlaybook - Executing ${cmd}`);
    const child = shell.exec(cmd, {
      async: true,
    });
    child.stdout?.on('data', function (data) {
      resolve(data);
    });
    child.on('exit', function () {
      resolve(null);
    });
  });
  logger.info('[SHELL] - executePlaybook - launched');
  if (result) {
    logger.info(`[SHELL] - executePlaybook - ExecId is ${uuid}`);
    await AnsibleTaskRepo.create({
      ident: uuid,
      status: 'created',
      cmd: `playbook ${playbookPath}`,
    });
    return result;
  } else {
    logger.error('[SHELL] - executePlaybook - Result was not properly set');
    throw new Error('Exec failed');
  }
}

async function getAnsibleVersion() {
  try {
    logger.info('[SHELL] - getAnsibleVersion - Starting...');
    return shell.exec('ansible --version').toString();
  } catch (error) {
    logger.error('[SHELL]- - getAnsibleVersion');
  }
}

async function installAnsibleGalaxyCollection(name: string, namespace: string) {
  try {
    logger.info('[SHELL] - installAnsibleGalaxyCollection Starting...');
    const result = shell.exec(AnsibleGalaxyCmd.getInstallCollectionCmd(name, namespace));
    if (result.code !== 0) {
      throw new Error('[SHELL] - installAnsibleGalaxyCollection has failed');
    }
    let collectionList = '';
    let i = 0;
    while (!collectionList.includes(`${namespace}.${name}`) && i++ < 60) {
      await timeout(2000);
      shell.exec(
        AnsibleGalaxyCmd.getListCollectionsCmd(name, namespace) +
          ' > /tmp/ansible-collection-output.tmp.txt',
      );
      await timeout(2000);
      collectionList = shell.cat('/tmp/ansible-collection-output.tmp.txt').toString();
    }
    if (!collectionList.includes(`${namespace}.${name}`)) {
      throw new Error('[SHELL] - installAnsibleGalaxyCollection has failed');
    }
  } catch (error) {
    logger.error('[SHELL] - installAnsibleGalaxyCollection');
    throw error;
  }
}

export {
  executePlaybook,
  getAnsibleVersion,
  executePlaybookOnInventory,
  installAnsibleGalaxyCollection,
};
