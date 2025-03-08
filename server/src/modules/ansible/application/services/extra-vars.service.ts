import * as fs from 'fs/promises';
import * as path from 'path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { API, SsmAgent, SsmAnsible } from 'ssm-shared-lib';
import { SSM_INSTALL_PATH } from '../../../../config';

/**
 * Service for managing Ansible extra-vars files
 */
@Injectable()
export class ExtraVarsService {
  private readonly logger = new Logger(ExtraVarsService.name);
  private readonly extraVarsDir: string;

  constructor(
    @Inject('DEVICE_REPOSITORY') private readonly deviceRepository: any,
    @Inject('USER_REPOSITORY') private readonly userRepository: any,
    @Inject('CACHE_SERVICE') private readonly cacheService: { getFromCache: (key: string) => Promise<string | undefined> }
  ) {
    // Directory for storing extra-vars files
    this.extraVarsDir = path.join(SSM_INSTALL_PATH, 'ansible', 'extra-vars');
    this.initializeExtraVarsDir();
  }

  /**
   * Initialize the extra-vars directory if it doesn't exist
   */
  private async initializeExtraVarsDir(): Promise<void> {
    try {
      await fs.mkdir(this.extraVarsDir, { recursive: true });
      this.logger.log(`ExtraVars directory initialized at ${this.extraVarsDir}`);
    } catch (error: any) {
      this.logger.error(`Failed to initialize extra-vars directory: ${error.message}`);
    }
  }

  /**
   * Create a new extra-vars file or update an existing one
   * @param name - The name of the extra-vars file
   * @param content - The content for the extra-vars file
   * @returns The path to the created/updated file
   */
  async createOrUpdateExtraVarsFile(
    name: string,
    content: API.ExtraVars,
  ): Promise<string> {
    // Validate name to prevent directory traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('Invalid extra-vars name. Use only alphanumeric characters, dash, and underscore.');
    }

    const filePath = path.join(this.extraVarsDir, `${name}.json`);

    try {
      // Create the JSON content for the file
      const jsonContent = JSON.stringify(content, null, 2);

      // Write the file
      await fs.writeFile(filePath, jsonContent, 'utf8');

      this.logger.log(`Extra-vars file ${name} created/updated successfully`);
      return filePath;
    } catch (error: any) {
      this.logger.error(`Failed to create/update extra-vars file ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get an extra-vars file by name
   * @param name - The name of the extra-vars file
   * @returns The content of the file as an ExtraVars object
   */
  async getExtraVarsFile(name: string): Promise<API.ExtraVars> {
    // Validate name to prevent directory traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('Invalid extra-vars name. Use only alphanumeric characters, dash, and underscore.');
    }

    const filePath = path.join(this.extraVarsDir, `${name}.json`);

    try {
      // Read and parse the file
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content) as API.ExtraVars;
    } catch (error: any) {
      this.logger.error(`Failed to read extra-vars file ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an extra-vars file
   * @param name - The name of the extra-vars file to delete
   * @returns True if deletion was successful
   */
  async deleteExtraVarsFile(name: string): Promise<boolean> {
    // Validate name to prevent directory traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('Invalid extra-vars name. Use only alphanumeric characters, dash, and underscore.');
    }

    const filePath = path.join(this.extraVarsDir, `${name}.json`);

    try {
      await fs.unlink(filePath);
      this.logger.log(`Extra-vars file ${name} deleted successfully`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to delete extra-vars file ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all available extra-vars files
   * @returns An array of extra-vars file names (without extensions)
   */
  async listExtraVarsFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.extraVarsDir);

      // Filter for JSON files and remove the extension
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error: any) {
      this.logger.error(`Failed to list extra-vars files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find values for a list of extra vars
   */
  async findValueOfExtraVars(
    extraVars: API.ExtraVars,
    forcedValues?: API.ExtraVars,
    emptySubstitute?: boolean,
    targets?: string[],
  ): Promise<API.ExtraVars> {
    const substitutedExtraVars: API.ExtraVars = [];

    for (const e of extraVars) {
      this.logger.log(`findValueOfExtraVars - ${e.extraVar} (${e.type})`);
      const value = await this.getSubstitutedExtraVar(e, forcedValues, targets);

      if (!value && !emptySubstitute) {
        this.logger.error(`findValueOfExtraVars - ExtraVar not found : ${e.extraVar}`);
        if (e.required) {
          throw new Error(`ExtraVar value not found ! (${e.extraVar})`);
        }
      } else {
        substitutedExtraVars.push({ ...e, value: value || undefined });
      }
    }
    this.logger.debug(`Substituted extra vars: ${JSON.stringify(substitutedExtraVars)}`);
    return substitutedExtraVars;
  }

  /**
   * Get the substituted value for an extra var
   */
  private async getSubstitutedExtraVar(
    extraVar: API.ExtraVar,
    forcedValues?: API.ExtraVars,
    targets?: string[],
  ): Promise<string | undefined> {
    this.logger.debug(
      `getSubstitutedExtraVar extraVar ${extraVar.extraVar} (${extraVar.type}) - ${targets?.join('\n')}`,
    );
    this.logger.debug(`Forced values: ${JSON.stringify(forcedValues)}`);

    const forcedValue = this.getForcedValue(extraVar, forcedValues);
    if (forcedValue) {
      return forcedValue;
    }

    if (extraVar.type === SsmAnsible.ExtraVarsType.SHARED) {
      return await this.cacheService.getFromCache(extraVar.extraVar);
    }

    if (extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT) {
      return await this.getContextExtraVarValue(extraVar, targets);
    }

    return undefined;
  }

  /**
   * Get forced value for an extra var
   */
  private getForcedValue(extraVar: API.ExtraVar, forcedValues?: API.ExtraVars): string | undefined {
    const forcedValue = forcedValues?.find((e) => e.extraVar === extraVar.extraVar)?.value;
    this.logger.debug(`forcedValue found: ${forcedValue}`);
    return forcedValue;
  }

  /**
   * Get context-specific value for an extra var
   */
  private async getContextExtraVarValue(
    extraVar: API.ExtraVar,
    targets?: string[],
  ): Promise<string | undefined> {
    this.logger.debug(`getContextExtraVarValue - '${extraVar.extraVar}'`);
    if (!targets) {
      return undefined;
    }
    if (targets.length > 1) {
      throw new Error(`Cannot use CONTEXT variable with multiple targets - '${extraVar.extraVar}'`);
    }

    const device = await this.deviceRepository.findOneByUuid(targets[0]);
    const user = await this.userRepository.findFirst();

    if (!device) {
      throw new Error(`Targeted device not found - (device: ${targets?.[0]})`);
    }

    switch (extraVar.extraVar) {
      case SsmAnsible.DefaultContextExtraVarsList.DEVICE_ID:
        return targets[0];
      case SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP:
        return device.ip;
      case SsmAnsible.DefaultContextExtraVarsList.AGENT_LOG_PATH:
        return device.agentLogPath;
      case SsmAnsible.DefaultContextExtraVarsList.AGENT_TYPE:
        return device.agentType || SsmAgent.InstallMethods.NODE;
      case SsmAnsible.DefaultContextExtraVarsList.API_KEY:
        return user?.apiKey;
      default:
        this.logger.error(`Context variable not found: '${extraVar.extraVar}'`);
        return undefined;
    }
  }
}