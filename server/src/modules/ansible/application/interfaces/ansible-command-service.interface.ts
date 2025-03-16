import { API, SsmAnsible } from 'ssm-shared-lib';
import { IUser } from '../../../users';
import { IAnsibleVault } from '../../../ansible-vault';

export const ANSIBLE_COMMAND_SERVICE = 'ANSIBLE_COMMAND_SERVICE';

/**
 * Interface for the Ansible Command Service
 */
export interface IAnsibleCommandService {
  /**
   * Execute a simple command
   * @param command Command to execute
   * @returns Result of execution
   */
  executeCommand(command: string): { stdout: string; stderr: string };

  /**
   * Execute an Ansible command
   * @param command Ansible command to execute
   * @returns Result of execution with exit code
   */
  executeAnsibleCommand(command: string): { stdout: string; stderr: string; exitCode: number };

  /**
   * Execute a simple playbook command
   * @param command Playbook command
   * @returns Result of execution
   */
  executePlaybookCommand(command: string): any;

  /**
   * Execute a simple playbook command
   * @param command Playbook command
   * @returns Result of execution
   */
  executePlaybookSimple(command: string): any;

  /**
   * Get the Ansible version
   * @returns The Ansible version
   */
  getAnsibleVersion(): Promise<string>;

  /**
   * Get the Ansible Runner version
   * @returns The Ansible Runner version
   */
  getAnsibleRunnerVersion(): Promise<string>;

  /**
   * Install an Ansible Galaxy collection
   * @param name Collection name
   * @param namespace Collection namespace
   * @returns Result of installation
   */
  installAnsibleGalaxyCollection(name: string, namespace: string): Promise<void>;

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
  executePlaybookFull(
    playbookPath: string,
    user: IUser,
    target?: string[],
    extraVars?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
    execUuid?: string,
    vaults?: IAnsibleVault[]
  ): Promise<any>;
}