import { API } from 'ssm-shared-lib';
import { setToCache } from '../data/cache';
import Playbook, { PlaybookModel } from '../data/database/model/Playbook';
import User from '../data/database/model/User';
import ExtraVars from '../integrations/ansible/utils/ExtraVars';
import Shell from '../integrations/shell';
import { Playbooks } from '../types/typings';

async function completeExtraVar(
  playbook: Playbook,
  target: string[] | undefined,
  extraVarsForcedValues?: API.ExtraVars,
) {
  let substitutedExtraVars: API.ExtraVars | undefined = undefined;
  if (playbook.extraVars && playbook.extraVars.length > 0) {
    const defaultExtraVars = ExtraVars.getDefaultExtraVars(playbook, target);
    substitutedExtraVars = await ExtraVars.findValueOfExtraVars(playbook.extraVars, [
      ...(extraVarsForcedValues || []),
      ...(defaultExtraVars || []),
    ]);
  }
  return substitutedExtraVars;
}

async function executePlaybook(
  playbook: Playbook,
  user: User,
  target: string[] | undefined,
  extraVarsForcedValues?: API.ExtraVars,
) {
  const substitutedExtraVars: API.ExtraVars | undefined = await completeExtraVar(
    playbook,
    target,
    extraVarsForcedValues,
  );
  return await Shell.AnsibleShell.executePlaybook(
    playbook.path,
    user,
    target,
    substitutedExtraVars,
  );
}

async function executePlaybookOnInventory(
  playbook: Playbook,
  user: User,
  inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
  extraVarsForcedValues?: API.ExtraVars,
) {
  const substitutedExtraVars: API.ExtraVars | undefined = await completeExtraVar(
    playbook,
    undefined,
    extraVarsForcedValues,
  );
  return await Shell.AnsibleShell.executePlaybookOnInventory(
    playbook.path,
    user,
    inventoryTargets,
    substitutedExtraVars,
  );
}

async function addExtraVarToPlaybook(playbook: Playbook, extraVar: API.ExtraVar) {
  playbook.extraVars?.forEach((e) => {
    if (e.extraVar === extraVar.extraVar) {
      throw new Error('ExtraVar already exists');
    }
  });
  const concatExtra = [
    ...(playbook.extraVars || []),
    {
      extraVar: extraVar.extraVar,
      required: extraVar.required || false,
      canBeOverride: extraVar.canBeOverride || true,
    },
  ];
  await PlaybookModel.updateOne({ name: playbook.name }, { extraVars: concatExtra }).lean().exec();
  await setToCache(extraVar.extraVar, extraVar.value || '');
}

async function deleteExtraVarFromPlaybook(playbook: Playbook, extraVarName: string) {
  const removedVar = playbook.extraVars?.filter((e) => {
    return e.extraVar !== extraVarName;
  });
  await PlaybookModel.updateOne({ name: playbook.name }, { extraVars: removedVar }).lean().exec();
}

export default {
  executePlaybook,
  executePlaybookOnInventory,
  addExtraVarToPlaybook,
  deleteExtraVarFromPlaybook,
};
