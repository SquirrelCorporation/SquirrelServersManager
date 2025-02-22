import shell from 'shelljs';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { SSM_INSTALL_PATH } from '../../../config';
import { AnsibleVault } from '../../../data/database/model/AnsibleVault';
import User from '../../../data/database/model/User';
import AnsibleTaskRepo from '../../../data/database/repository/AnsibleTaskRepo';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import logger from '../../../logger';
import { Playbooks } from '../../../types/typings';
import ansibleCmd from '../../ansible/AnsibleCmd';
import AnsibleGalaxyCmd from '../../ansible/AnsibleGalaxyCmd';
import Inventory from '../../ansible/utils/InventoryTransformer';
import { AbstractShellCommander } from '../AbstractShellCommander';
import SshPrivateKeyFileManager from './SshPrivateKeyFileManager';

class AnsibleShellCommandsManager extends AbstractShellCommander {
  constructor() {
    super(
      logger.child({ module: 'AnsibleShellCommandsManager' }, { msgPrefix: '[ANSIBLE] - ' }),
      'Ansible',
    );
  }
  private readonly ANSIBLE_PATH = `${SSM_INSTALL_PATH}/server/src/ansible/`;

  static timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executePlaybook(
    playbookPath: string,
    user: User,
    target?: string[],
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    execUuid?: string,
    vaults?: AnsibleVault[],
  ) {
    this.logger.info(`executePlaybook - Starting... (playbook: ${playbookPath})`);
    execUuid = execUuid || uuidv4();

    let inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined;
    if (target) {
      this.logger.info(
        `executePlaybook - Called with specific device: ${target} - (playbook: ${playbookPath})`,
      );
      const devicesAuth = await DeviceAuthRepo.findManyByDevicesUuid(target);
      if (!devicesAuth || devicesAuth.length === 0) {
        this.logger.error(`executePlaybook - Device Authentication not found (device: ${target})`);
        throw new Error(
          `Exec failed, no matching target - (Device Authentication not found for device ${target})`,
        );
      }
      inventoryTargets = await Inventory.inventoryBuilderForTarget(devicesAuth, execUuid as string);
    }
    return await this.executePlaybookOnInventory(
      playbookPath,
      user,
      inventoryTargets,
      extraVars,
      mode,
      target,
      execUuid,
      vaults,
    );
  }

  async executePlaybookOnInventory(
    playbookPath: string,
    user: User,
    inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    target?: string[],
    execUuid?: string,
    vaults?: AnsibleVault[],
  ) {
    execUuid = execUuid || uuidv4();

    try {
      shell.cd(this.ANSIBLE_PATH);
      shell.rm(`${SSM_INSTALL_PATH}/server/src/ansible/inventory/hosts.json`);
      shell.rm(`${SSM_INSTALL_PATH}/server/src/ansible/env/extravars`);

      const result = await new Promise<string | null>((resolve) => {
        const cmd = ansibleCmd.buildAnsibleCmd(
          playbookPath,
          execUuid as string,
          inventoryTargets,
          user,
          extraVars,
          mode,
          vaults,
        );
        this.logger.info(`executePlaybook - Executing "${cmd}"`);
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
      this.logger.info('executePlaybook - launched');
      if (result) {
        this.logger.info(`executePlaybook - ExecId is ${execUuid}`);
        await AnsibleTaskRepo.create({
          ident: execUuid as string,
          status: 'created',
          cmd: `playbook ${playbookPath}`,
          target: target,
        });
        return result;
      } else {
        this.logger.error('executePlaybook - Result was not properly set');
        throw new Error('Exec failed');
      }
    } catch (error: any) {
      if (target) {
        target?.map((e) =>
          SshPrivateKeyFileManager.removeAnsibleTemporaryPrivateKey(e, execUuid as string),
        );
      } else {
        SshPrivateKeyFileManager.removeAllAnsibleExecTemporaryPrivateKeys(execUuid as string);
      }
      throw error;
    }
  }

  async getAnsibleVersion() {
    try {
      this.logger.info('getAnsibleVersion - Starting...');
      return shell.exec('ansible --version').toString();
    } catch {
      this.logger.error('[SHELL]- - getAnsibleVersion');
    }
  }

  async getAnsibleRunnerVersion() {
    try {
      this.logger.info('getAnsibleRunnerVersion - Starting...');
      return shell.exec('ansible-runner --version').toString();
    } catch {
      this.logger.error('[SHELL]- - getAnsibleRunnerVersion');
    }
  }

  async installAnsibleGalaxyCollection(name: string, namespace: string) {
    try {
      this.logger.info('installAnsibleGalaxyCollection Starting...');
      const result = shell.exec(AnsibleGalaxyCmd.getInstallCollectionCmd(name, namespace));
      if (result.code !== 0) {
        throw new Error('installAnsibleGalaxyCollection has failed');
      }
      let collectionList = '';
      let i = 0;
      while (!collectionList.includes(`${namespace}.${name}`) && i++ < 60) {
        await AnsibleShellCommandsManager.timeout(2000);
        shell.exec(
          AnsibleGalaxyCmd.getListCollectionsCmd(name, namespace) +
            ' > /tmp/ansible-collection-output.tmp.txt',
        );
        await AnsibleShellCommandsManager.timeout(2000);
        collectionList = shell.cat('/tmp/ansible-collection-output.tmp.txt').toString();
      }
      if (!collectionList.includes(`${namespace}.${name}`)) {
        throw new Error('installAnsibleGalaxyCollection has failed');
      }
    } catch (error) {
      this.logger.error('installAnsibleGalaxyCollection');
      throw error;
    }
  }
}

export default new AnsibleShellCommandsManager();
