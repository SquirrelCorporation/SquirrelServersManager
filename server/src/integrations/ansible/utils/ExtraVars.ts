import { SettingsKeys } from 'ssm-shared-lib';
import { API } from 'ssm-shared-lib';
import { SsmAnsible } from 'ssm-shared-lib';
import Playbook from '../../../data/database/model/Playbook';
import { getFromCache } from '../../../data/cache';
import logger from '../../../logger';

function getDefaultExtraVars(playbook: Playbook, target?: string[]) {
  const defaultExtraVars = target
    ? (JSON.parse(
        `[{"extraVar": "${SsmAnsible.SSMReservedExtraVars.DEVICE_ID}", "value": "${target}"}]`,
      ) as [API.ExtraVar])
    : [];
  logger.debug(JSON.stringify(playbook.extraVars));
  return defaultExtraVars;
}

async function substitutedExtraVar(extraVar: string, forcedValues?: API.ExtraVars) {
  const forcedValue = forcedValues?.find((e) => e.extraVar === extraVar)?.value;
  switch (extraVar) {
    case SsmAnsible.SSMReservedExtraVars.DEVICE_ID:
      return forcedValue;
    case SsmAnsible.SSMReservedExtraVars.MASTER_NODE_URL:
      return forcedValue
        ? forcedValue
        : await getFromCache(SettingsKeys.AnsibleReservedExtraVarsKeys.MASTER_NODE_URL);
    default:
      return await getFromCache(extraVar);
  }
}

async function findValueOfExtraVars(
  extraVars: API.ExtraVars,
  forcedValues?: API.ExtraVars,
  emptySubstitute?: boolean,
): Promise<API.ExtraVars> {
  const substitutedExtraVars: API.ExtraVars = [];
  for (const e of extraVars) {
    logger.info(`[INTEGRATION][ANSIBLE] - findValueOfExtraVars - ${e.extraVar}`);
    const value = await substitutedExtraVar(e.extraVar, forcedValues);
    if (!value && !emptySubstitute) {
      logger.error(
        `[INTEGRATION][ANSIBLE] - findValueOfExtraVars - ExtraVar not found : ${e.extraVar}`,
      );
      throw new Error('ExtraVars value not found !');
    }
    substitutedExtraVars.push({
      extraVar: e.extraVar,
      value: value || undefined,
      required: e.required,
      canBeOverride: e.canBeOverride,
    });
  }
  logger.debug(substitutedExtraVars);
  return substitutedExtraVars;
}

export default { findValueOfExtraVars, getDefaultExtraVars };
