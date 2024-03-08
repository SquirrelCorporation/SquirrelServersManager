import { AnsibleReservedExtraVarsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { getConfFromCache, getFromCache } from '../../redis';
import { Ansible } from '../../typings';

enum ExtraVars {
  MASTER_NODE_URL = '_ssm_masterNodeUrl',
  DEVICE_ID = '_ssm_deviceId',
}

export type ForcedValues = {
  extraVarName?: string;
  extraVarValue?: string;
}[];

async function substitutedExtraVar(extraVar: string, forcedValues?: ForcedValues) {
  const forcedValue = forcedValues?.find((e) => e.extraVarName)?.extraVarValue;
  switch (extraVar) {
    case ExtraVars.DEVICE_ID:
      return forcedValue;
    case ExtraVars.MASTER_NODE_URL:
      return forcedValue
        ? forcedValue
        : await getConfFromCache(AnsibleReservedExtraVarsKeys.MASTER_NODE_URL);
    default:
      return await getFromCache(extraVar);
  }
}

async function findValueOfExtraVars(
  extraVars: string[],
  forcedValues?: ForcedValues,
): Promise<Ansible.ExtraVars> {
  const substitutedExtraVars: Ansible.ExtraVars = [];
  for (const e of extraVars) {
    const value = await substitutedExtraVar(e, forcedValues);
    if (!value) {
      throw new Error('ExtraVars value not found !');
    }
    substitutedExtraVars.push({
      extravar: e,
      value: value,
    });
  }
  return substitutedExtraVars;
}

export default { ReservedExtraVars: ExtraVars, findValueOfExtraVars };
