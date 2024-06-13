import { API } from 'ssm-shared-lib';
import { setToCache } from '../data/cache';
import Playbook, { PlaybookModel } from '../data/database/model/Playbook';
import User from '../data/database/model/User';
import PlaybookRepo from '../data/database/repository/PlaybookRepo';
import ExtraVars from '../integrations/ansible/utils/ExtraVars';
import shell from '../integrations/shell';
import logger from '../logger';
import { Ansible } from '../types/typings';

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
  let substitutedExtraVars: API.ExtraVars | undefined = await completeExtraVar(
    playbook,
    target,
    extraVarsForcedValues,
  );
  return await shell.executePlaybook(playbook.name, user, target, substitutedExtraVars);
}

async function executePlaybookOnInventory(
  playbook: Playbook,
  user: User,
  inventoryTargets?: Ansible.All & Ansible.HostGroups,
  extraVarsForcedValues?: API.ExtraVars,
) {
  let substitutedExtraVars: API.ExtraVars | undefined = await completeExtraVar(
    playbook,
    undefined,
    extraVarsForcedValues,
  );
  return await shell.executePlaybookOnInventory(
    playbook.name,
    user,
    inventoryTargets,
    substitutedExtraVars,
  );
}

async function initPlaybook() {
  logger.info(`[USECASES][PLAYBOOK] - initPlaybook`);

  const playbooks = await shell.listPlaybooks();
  const playbookPromises = playbooks?.map(async (playbook) => {
    const configurationFileContent = await shell.readPlaybookConfiguration(
      playbook.replaceAll('.yml', '.json'),
    );

    const isCustomPlaybook = !playbook.startsWith('_');
    const playbookData: Playbook = {
      name: playbook,
      custom: isCustomPlaybook,
    };

    if (configurationFileContent) {
      logger.info(`[USECASES][PLAYBOOK] - playbook has configuration file`);

      const playbookConfiguration = JSON.parse(
        configurationFileContent,
      ) as Ansible.PlaybookConfigurationFile;

      playbookData.playableInBatch = playbookConfiguration.playableInBatch;
      playbookData.extraVars = playbookConfiguration.extraVars;
    }

    await PlaybookRepo.updateOrCreate(playbookData);
  });

  await Promise.all(playbookPromises);
}

async function getAllPlaybooks() {
  const listOfPlaybooks = await PlaybookRepo.findAll();
  if (!listOfPlaybooks) {
    return [];
  }

  const substitutedListOfPlaybooks = listOfPlaybooks.map(async (playbook) => {
    const extraVars = playbook.extraVars
      ? await ExtraVars.findValueOfExtraVars(playbook.extraVars, undefined, true)
      : undefined;
    return {
      value: playbook.name,
      label: playbook.name.replaceAll('.yml', ''),
      extraVars,
      custom: playbook.custom,
    };
  });

  return (await Promise.all(substitutedListOfPlaybooks)).sort((a) =>
    a.value.startsWith('_') ? -1 : 1,
  );
}

async function createCustomPlaybook(name: string) {
  if (!name.endsWith('.yml')) {
    name += '.yml';
  }
  await PlaybookModel.create({ name: name, custom: true }).then(async () => {
    await shell.newPlaybook(name);
  });
}

async function deleteCustomPlaybook(playbook: Playbook) {
  await PlaybookModel.deleteOne({ name: playbook.name });
  await shell.deletePlaybook(playbook.name);
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
  initPlaybook,
  getAllPlaybooks,
  createCustomPlaybook,
  deleteCustomPlaybook,
  executePlaybook,
  executePlaybookOnInventory,
  addExtraVarToPlaybook,
  deleteExtraVarFromPlaybook,
};
