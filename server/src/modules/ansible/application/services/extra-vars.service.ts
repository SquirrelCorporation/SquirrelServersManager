import { IExtraVarsService } from '@modules/ansible/doma../../domain/interfaces/extra-vars-service.interface';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { IUserRepository, USER_REPOSITORY } from '@modules/users';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { API, SsmAgent, SsmAnsible } from 'ssm-shared-lib';

/**
 * Service for managing Ansible extra-vars files
 */
@Injectable()
export class ExtraVarsService implements IExtraVarsService {
  private readonly logger = new Logger(ExtraVarsService.name);

  constructor(
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
      this.logger.debug(`findValueOfExtraVars - ${JSON.stringify(e.extraVar)} (${e.type})`);
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
      return (await this.cacheManager.get(extraVar.extraVar)) || '';
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

    const device = await this.devicesService.findOneByUuid(targets[0]);
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
