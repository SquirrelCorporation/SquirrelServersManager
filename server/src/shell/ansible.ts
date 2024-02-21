import shell from 'shelljs';
import User from '../database/model/User';
import DeviceAuthRepo from '../database/repository/DeviceAuthRepo';
import logger from '../logger';
import AnsibleTaskRepo from '../database/repository/AnsibleTaskRepo';
import Inventory from '../transformers/Inventory';
import { Ansible } from '../transformers/typings';
import ansibleCmd from './ansibleCmd';

async function executePlaybook(playbook: string, user: User, target?: string[]) {
  logger.info('[SHELL]-[ANSIBLE] - executePlaybook - Starting...');
  if (!playbook.endsWith('.yml')) {
    playbook += '.yml';
  }
  let inventoryTargets: Ansible.All & Ansible.HostGroups;
  if (target) {
    logger.info(`[SHELL]-[ANSIBLE] - executePlaybook - called with target: ${target}`);
    const devicesAuth = await DeviceAuthRepo.findManyByDevicesUuid(target);
    if (!devicesAuth) {
      logger.error(`[SHELL]-[ANSIBLE] - executePlaybook - Target not found`);
      throw new Error('Exec failed, no matching target');
    }
    inventoryTargets = Inventory.inventoryBuilderForTarget(devicesAuth);
  }
  shell.cd('/server/src/ansible/');
  shell.rm('/server/src/ansible/inventory/hosts');
  const result = await new Promise<string | null>((resolve, reject) => {
    const cmd = ansibleCmd.buildAnsibleCmd(playbook, inventoryTargets, user);
    logger.info(`[SHELL]-[ANSIBLE] - executePlaybook - Executing ${cmd}`);
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
  logger.info('[SHELL]-[ANSIBLE] - executePlaybook - ended');
  if (result) {
    logger.info(`[SHELL]-[ANSIBLE] - executePlaybook - ExecId is ${result}`);
    await AnsibleTaskRepo.create({ ident: result, status: 'created', cmd: `playbook ${playbook}` });
    return result;
  } else {
    logger.error('[SHELL]-[ANSIBLE] - executePlaybook - Result was not properly set');
    throw new Error('Exec failed');
  }
}

async function listPlaybooks() {
  try {
    logger.info('[SHELL]-[ANSIBLE] - listPlaybook - Starting...');
    shell.cd('/server/src/ansible/');
    const listOfPlaybooks: string[] = [];
    shell.ls('*.yml').forEach(function (file) {
      listOfPlaybooks.push(file);
    });
    logger.info('[SHELL]-[ANSIBLE] - listPlaybook - ended');
    return listOfPlaybooks;
  } catch (error) {
    logger.error('[SHELL]-[ANSIBLE] - listPlaybook');
    throw new Error('Exec failed');
  }
}

async function readPlaybook(playbook: string) {
  try {
    logger.info('[SHELL]-[ANSIBLE] - readPlaybook - Starting...');
    shell.cd('/server/src/ansible/');
    return shell.cat(playbook).toString();
  } catch (error) {
    logger.error('[SHELL]-[ANSIBLE] - readPlaybook');
    throw new Error('Exec failed');
  }
}

async function editPlaybook(playbook: string, content: string) {
  try {
    logger.info('[SHELL]-[ANSIBLE] - editPlaybook - Starting...');
    shell.cd('/server/src/ansible/');
    shell.ShellString(content).to(playbook);
  } catch (error) {
    logger.error('[SHELL]-[ANSIBLE] - editPlaybook');
    throw new Error('Exec failed');
  }
}

async function newPlaybook(playbook: string) {
  try {
    logger.info('[SHELL]-[ANSIBLE] - newPlaybook - Starting...');
    shell.cd('/server/src/ansible/');
    shell.touch(playbook + '.yml');
  } catch (error) {
    logger.error('[SHELL]-[ANSIBLE] - newPlaybook');
    throw new Error('Exec failed');
  }
}

async function deletePlaybook(playbook: string) {
  try {
    logger.info('[SHELL]-[ANSIBLE] - newPlaybook - Starting...');
    shell.cd('/server/src/ansible/');
    shell.rm(playbook);
  } catch (error) {
    logger.error('[SHELL]-[ANSIBLE] - newPlaybook');
    throw new Error('Exec failed');
  }
}

export default {
  executePlaybook,
  listPlaybooks,
  readPlaybook,
  editPlaybook,
  newPlaybook,
  deletePlaybook,
};
