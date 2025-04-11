import { Inject, Injectable, Logger } from '@nestjs/common';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { SSM_INSTALL_PATH } from '../../../../config';
import { Playbooks } from '../../../../types/typings';
import { IAnsibleVault } from '../../../ansible-vaults';
import { DEVICE_AUTH_SERVICE, IDeviceAuthService } from '../../../devices';
import {
  IShellWrapperService,
  ISshKeyService,
  SHELL_WRAPPER_SERVICE,
  SSH_KEY_SERVICE,
} from '../../../shell';
import { IUser } from '../../../users';
import { IAnsibleCommandService } from '../../domain/interfaces/ansible-command-service.interface';
import {
  ANSIBLE_TASK_REPOSITORY,
  IAnsibleTaskRepository,
} from '../../domain/repositories/ansible-task.repository.interface';
import { AnsibleCommandBuilderService } from './ansible-command-builder.service';
import { AnsibleGalaxyCommandService } from './ansible-galaxy-command.service';
import { InventoryTransformerService } from './inventory-transformer.service';

/**
 * AnsibleCommandService provides a NestJS injectable service for executing Ansible commands.
 */
@Injectable()
export class AnsibleCommandService implements IAnsibleCommandService {
  private readonly logger = new Logger(AnsibleCommandService.name);
  private readonly ANSIBLE_PATH = `${SSM_INSTALL_PATH}/server/src/ansible/`;

  constructor(
    @Inject(SHELL_WRAPPER_SERVICE) private readonly shellWrapper: IShellWrapperService,
    @Inject(SSH_KEY_SERVICE) private readonly sshKeyService: ISshKeyService,
    @Inject(DEVICE_AUTH_SERVICE) private readonly deviceAuthService: IDeviceAuthService,
    @Inject(ANSIBLE_TASK_REPOSITORY) private readonly ansibleTaskRepository: IAnsibleTaskRepository,
    private readonly ansibleCommandBuilder: AnsibleCommandBuilderService,
    private readonly ansibleGalaxyCommand: AnsibleGalaxyCommandService,
    private readonly inventoryTransformer: InventoryTransformerService,
  ) {}

  /**
   * Creates a timeout promise
   * @param ms Timeout in milliseconds
   * @returns Promise that resolves after the timeout
   */
  private static timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute a simple command
   * @param command Command to execute
   * @returns Result of execution
   */
  executeCommand(command: string): { stdout: string; stderr: string } {
    try {
      this.logger.log(`executeCommand - Starting (command: ${command})`);
      const result = this.shellWrapper.exec(command);
      return {
        stdout: result.stdout,
        stderr: result.stderr,
      };
    } catch (error) {
      this.logger.error(`executeCommand failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute an Ansible command
   * @param command Ansible command to execute
   * @returns Result of execution with exit code
   */
  executeAnsibleCommand(command: string): { stdout: string; stderr: string; exitCode: number } {
    try {
      this.logger.log(`executeAnsibleCommand - Starting (command: ${command})`);
      const result = this.shellWrapper.exec(command);
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.code,
      };
    } catch (error) {
      this.logger.error(`executeAnsibleCommand failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute a simple playbook command
   * @param command Playbook command
   * @returns Result of execution
   */
  executePlaybookCommand(command: string) {
    try {
      this.logger.log(`executePlaybookCommand - Starting (command: ${command})`);
      return this.shellWrapper.exec(command);
    } catch (error) {
      this.logger.error(`executePlaybookCommand failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute a simple playbook command
   * @param command Playbook command
   * @returns Result of execution
   */
  executePlaybookSimple(command: string) {
    try {
      this.logger.log(`executePlaybookSimple - Starting... (playbook: ${command})`);
      return this.executePlaybookCommand(command);
    } catch (error) {
      this.logger.error(`executePlaybookSimple failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get the Ansible version
   * @returns The Ansible version
   */
  async getAnsibleVersion() {
    try {
      this.logger.debug(`getAnsibleVersion - Starting...`);
      return this.shellWrapper.exec('ansible --version').toString();
    } catch (error) {
      this.logger.error(`getAnsibleVersion failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get the Ansible Runner version
   * @returns The Ansible Runner version
   */
  async getAnsibleRunnerVersion() {
    try {
      this.logger.debug(`getAnsibleRunnerVersion - Starting...`);
      return this.shellWrapper.exec('ansible-runner --version').toString();
    } catch (error) {
      this.logger.error(`getAnsibleRunnerVersion failed: ${error}`);
      throw error;
    }
  }

  /**
   * Install an Ansible Galaxy collection
   * @param name Collection name
   * @param namespace Collection namespace
   * @returns Result of installation
   */
  async installAnsibleGalaxyCollection(name: string, namespace: string) {
    try {
      this.logger.log('installAnsibleGalaxyCollection Starting...');
      const result = this.shellWrapper.exec(
        this.ansibleGalaxyCommand.getInstallCollectionCmd(name, namespace),
      );
      if (result.code !== 0) {
        throw new Error('installAnsibleGalaxyCollection has failed');
      }

      let collectionList = '';
      let i = 0;
      while (!collectionList.includes(`${namespace}.${name}`) && i++ < 60) {
        await AnsibleCommandService.timeout(2000);
        this.shellWrapper.exec(
          this.ansibleGalaxyCommand.getListCollectionsCmd() +
            ' > /tmp/ansible-collection-output.tmp.txt',
        );
        await AnsibleCommandService.timeout(2000);
        collectionList = this.shellWrapper.exec(
          'cat /tmp/ansible-collection-output.tmp.txt',
        ).stdout;
      }

      if (!collectionList.includes(`${namespace}.${name}`)) {
        throw new Error('installAnsibleGalaxyCollection has failed');
      }
    } catch (error) {
      this.logger.error(`installAnsibleGalaxyCollection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute a full Ansible playbook with target hosts, extra vars, and execution mode
   *
   * @param playbookPath Path to the playbook file
   * @param user User executing the playbook
   * @param target Target hosts for execution
   * @param extraVars Extra variables to pass to Ansible
   * @param mode Execution mode (apply/check)
   * @param execUuid Execution UUID (generated if not provided)
   * @param vaults Ansible vaults to use
   * @returns Result of playbook execution
   */
  async executePlaybookFull(
    playbookPath: string,
    user: IUser,
    target?: string[],
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    execUuid?: string,
    vaults?: IAnsibleVault[],
  ) {
    this.logger.log(`executePlaybookFull - Starting... (playbook: ${playbookPath})`);
    execUuid = execUuid || uuidv4();

    let inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined;
    if (target) {
      this.logger.log(
        `executePlaybookFull - Called with specific device: ${target} - (playbook: ${playbookPath})`,
      );
      const devicesAuth = await this.deviceAuthService.findManyByDevicesUuid(target);
      if (!devicesAuth || devicesAuth.length === 0) {
        this.logger.error(
          `executePlaybookFull - Device Authentication not found (device: ${target})`,
        );
        throw new Error(
          `Exec failed, no matching target - (Device Authentication not found for device ${target})`,
        );
      }
      inventoryTargets = await this.inventoryTransformer.inventoryBuilderForTarget(
        devicesAuth,
        execUuid as string,
      );
    }

    return await this.executePlaybookOnInventoryFull(
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

  /**
   * Execute a full Ansible playbook with target hosts, extra vars, and execution mode
   * This method is an alias for executePlaybookFull to maintain compatibility with tests
   *
   * @param playbookPath Path to the playbook file
   * @param user User executing the playbook
   * @param target Target hosts for execution
   * @param extraVars Extra variables to pass to Ansible
   * @param mode Execution mode (apply/check)
   * @param execUuid Execution UUID (generated if not provided)
   * @param vaults Ansible vaults to use
   * @returns Result of playbook execution
   */
  async executeAnsiblePlaybook(
    playbookPath: string,
    user: IUser,
    target?: string[],
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    execUuid?: string,
    vaults?: IAnsibleVault[],
  ) {
    this.logger.log(`executeAnsiblePlaybook - Starting... (playbook: ${playbookPath})`);
    execUuid = execUuid || uuidv4();

    if (target) {
      this.logger.log(
        `executeAnsiblePlaybook - Called with specific device: ${target} - (playbook: ${playbookPath})`,
      );
      const devicesAuth = await this.deviceAuthService.findManyByDevicesUuid(target);
      if (!devicesAuth || devicesAuth.length === 0) {
        this.logger.error(
          `executeAnsiblePlaybook - Device Authentication not found (device: ${target})`,
        );
        throw new Error(
          `Exec failed, no matching target - (Device Authentication not found for device ${target})`,
        );
      }
    }

    return this.executePlaybookFull(playbookPath, user, target, extraVars, mode, execUuid, vaults);
  }

  /**
   * Executes an Ansible playbook on a specific inventory
   * @param playbookPath Path to the playbook
   * @param user Current user
   * @param inventoryTargets Optional inventory targets
   * @param extraVars Optional extra variables
   * @param mode Execution mode (APPLY or CHECK)
   * @param target Optional target devices
   * @param execUuid Optional execution UUID
   * @param vaults Optional Ansible vaults
   * @returns Result of playbook execution
   */
  async executePlaybookOnInventory(
    playbookPath: string,
    user: IUser,
    inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    target?: string[],
    execUuid?: string,
    vaults?: IAnsibleVault[],
  ) {
    try {
      this.logger.log(`executePlaybookOnInventory - Starting (playbook: ${playbookPath})`);
      return await this.executePlaybookOnInventoryFull(
        playbookPath,
        user,
        inventoryTargets,
        extraVars,
        mode,
        target,
        execUuid,
        vaults,
      );
    } catch (error) {
      this.logger.error(`executePlaybookOnInventory failed: ${error}`);
      throw error;
    }
  }

  /**
   * Executes a playbook on inventory with full configuration
   * @param playbookPath Path to the playbook
   * @param user Current user
   * @param inventoryTargets Inventory targets
   * @param extraVars Extra variables
   * @param mode Execution mode
   * @param target Target devices
   * @param execUuid Execution UUID
   * @param vaults Ansible vaults
   * @returns Execution ID
   */
  async executePlaybookOnInventoryFull(
    playbookPath: string,
    user: IUser,
    inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    target?: string[],
    execUuid?: string,
    vaults?: IAnsibleVault[],
  ) {
    execUuid = execUuid || uuidv4();

    try {
      this.shellWrapper.cd(this.ANSIBLE_PATH);
      this.shellWrapper.rm(`${SSM_INSTALL_PATH}/server/src/ansible/inventory/hosts.json`);
      this.shellWrapper.rm(`${SSM_INSTALL_PATH}/server/src/ansible/env/extravars`);

      const result = await new Promise<string | null>((resolve) => {
        const cmd = this.ansibleCommandBuilder.buildAnsibleCmd(
          playbookPath,
          execUuid as string,
          inventoryTargets,
          user,
          extraVars,
          mode,
          vaults,
        );
        this.logger.log(`executePlaybook - Executing "${cmd}"`);
        const child = this.shellWrapper.exec(cmd, {
          async: true,
        });
        child.stdout?.on('data', function (data) {
          resolve(data);
        });
        child.on('exit', function () {
          resolve(null);
        });
      });
      this.logger.log('executePlaybook - launched');
      if (result) {
        this.logger.log(`executePlaybook - ExecId is ${execUuid}`);
        await this.ansibleTaskRepository.create({
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
          this.sshKeyService.removeAnsibleTemporaryPrivateKey(e, execUuid as string),
        );
      } else {
        this.sshKeyService.removeAllAnsibleExecTemporaryPrivateKeys(execUuid as string);
      }
      throw error;
    }
  }
}
