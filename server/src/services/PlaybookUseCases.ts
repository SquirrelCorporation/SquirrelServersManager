import { API, SsmAnsible } from 'ssm-shared-lib';
import { setToCache } from '../data/cache';
import Playbook, { PlaybookModel } from '../data/database/model/Playbook';
import User from '../data/database/model/User';
import ExtraVars from '../modules/ansible/extravars/ExtraVars';
import Shell from '../modules/shell';
import { Playbooks } from '../types/typings';

async function completeExtraVar(
  playbook: Playbook,
  target: string[] | undefined,
  extraVarsForcedValues?: API.ExtraVars,
) {
  let substitutedExtraVars: API.ExtraVars | undefined = undefined;
  if (playbook.extraVars && playbook.extraVars.length > 0) {
    substitutedExtraVars = await ExtraVars.findValueOfExtraVars(
      playbook.extraVars,
      [...(extraVarsForcedValues || [])],
      false,
      target,
    );
  }
  return substitutedExtraVars;
}

async function executePlaybook(
  playbook: Playbook,
  user: User,
  target: string[] | undefined,
  extraVarsForcedValues?: API.ExtraVars,
  mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
) {
  const substitutedExtraVars: API.ExtraVars | undefined = await completeExtraVar(
    playbook,
    target,
    extraVarsForcedValues,
  );
  return await Shell.AnsibleShellCommandsManager.executePlaybook(
    playbook.path,
    user,
    target,
    substitutedExtraVars,
    mode,
  );
}

async function executePlaybookOnInventory(
  playbook: Playbook,
  user: User,
  inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
  extraVarsForcedValues?: API.ExtraVars,
  execUuid?: string,
) {
  const substitutedExtraVars: API.ExtraVars | undefined = await completeExtraVar(
    playbook,
    undefined,
    extraVarsForcedValues,
  );
  return await Shell.AnsibleShellCommandsManager.executePlaybookOnInventory(
    playbook.path,
    user,
    inventoryTargets,
    substitutedExtraVars,
    undefined,
    undefined,
    execUuid,
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
      type: extraVar.type,
    },
  ];
  await PlaybookModel.updateOne(
    { name: playbook.name },
    {
      extraVars: concatExtra,
      playableInBatch: !concatExtra.find((e) => e.type === SsmAnsible.ExtraVarsType.CONTEXT),
    },
  )
    .lean()
    .exec();
  if (extraVar.type === SsmAnsible.ExtraVarsType.SHARED) {
    await setToCache(extraVar.extraVar, extraVar.value || '');
  }
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
