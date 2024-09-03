import { API, SsmAnsible } from 'ssm-shared-lib';
import { getFromCache } from '../../../data/cache';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import pinoLogger from '../../../logger';

class ExtraVars {
  private logger = pinoLogger.child(
    { module: 'ExtraVars' },
    { msgPrefix: '[VARIABLE_MANAGER] - ' },
  );

  async findValueOfExtraVars(
    extraVars: API.ExtraVars,
    forcedValues?: API.ExtraVars,
    emptySubstitute?: boolean,
    targets?: string[],
  ): Promise<API.ExtraVars> {
    const substitutedExtraVars: API.ExtraVars = [];

    for (const e of extraVars) {
      this.logger.info(`findValueOfExtraVars - ${e.extraVar} (${e.type})`);
      const value = await this.getSubstitutedExtraVar(e, forcedValues, targets);

      if (!value && !emptySubstitute) {
        this.logger.error(`findValueOfExtraVars - ExtraVar not found : ${e.extraVar}`);
        if (e.required) {
          throw new Error('ExtraVar value not found !');
        }
      } else {
        substitutedExtraVars.push({ ...e, value: value || undefined });
      }
    }
    this.logger.debug(substitutedExtraVars);
    return substitutedExtraVars;
  }

  private async getSubstitutedExtraVar(
    extraVar: API.ExtraVar,
    forcedValues?: API.ExtraVars,
    targets?: string[],
  ) {
    this.logger.debug(
      `getSubstitutedExtraVar extraVar ${extraVar.extraVar} (${extraVar.type}) - ${targets?.join('\n')}`,
    );
    this.logger.debug('getSubstitutedExtraVar ' + JSON.stringify(forcedValues));

    const forcedValue = this.getForcedValue(extraVar, forcedValues);
    if (forcedValue) {
      return forcedValue;
    }

    if (extraVar.type === SsmAnsible.ExtraVarsType.SHARED) {
      return await getFromCache(extraVar.extraVar);
    }

    if (extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT) {
      return await this.getContextExtraVarValue(extraVar, targets);
    }
  }

  private getForcedValue(extraVar: API.ExtraVar, forcedValues?: API.ExtraVars) {
    const forcedValue = forcedValues?.find((e) => e.extraVar === extraVar.extraVar)?.value;
    this.logger.debug(`forcedValue found ${forcedValue}`);
    return forcedValue;
  }

  private async getContextExtraVarValue(extraVar: API.ExtraVar, targets?: string[]) {
    this.logger.debug(`getContextExtraVarValue '${extraVar.extraVar}'`);
    if (!targets) {
      return;
    }
    if (targets.length > 1) {
      throw new Error('Cannot use CONTEXT variable with multiple targets');
    }
    const device = await DeviceRepo.findOneByUuid(targets[0]);
    if (!device) {
      throw new Error('Targeted device not found');
    }
    switch (extraVar.extraVar) {
      case SsmAnsible.DefaultContextExtraVarsList.DEVICE_ID:
        return targets[0];
      case SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP:
        return device.ip;
    }
    this.logger.error(`Context variable not found: '${extraVar.extraVar}'`);
  }
}

export default new ExtraVars();
