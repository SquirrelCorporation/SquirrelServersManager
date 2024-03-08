import shell from '../shell';
import PlaybookRepo from '../database/repository/PlaybookRepo';
import Playbook, { PlaybookModel } from '../database/model/Playbook';
import { Ansible } from '../typings';
import logger from '../logger';
import User from '../database/model/User';
import ExtraVars, { ForcedValues } from '../integrations/ansible/ExtraVars';

async function executePlaybook(
  playbook: Playbook,
  user: User,
  target: string[] | undefined,
  extraVarsForcedValues?: ForcedValues,
) {
  let substitutedExtraVars: Ansible.ExtraVars | undefined = undefined;
  if (playbook.extraVars?.length > 0) {
    const defaultExtraVars = target
      ? (JSON.parse(
          `[{"extraVarName": "${ExtraVars.ReservedExtraVars.DEVICE_ID}", "extraVarValue": "${target}"}]`,
        ) as ForcedValues)
      : [];
    logger.info(JSON.stringify(playbook.extraVars));
    substitutedExtraVars = await ExtraVars.findValueOfExtraVars(
      playbook.extraVars?.map((e) => e.value),
      [...(extraVarsForcedValues || []), ...defaultExtraVars],
    );
  }
  const execId = await shell.executePlaybook(playbook.name, user, target, substitutedExtraVars);

  return execId;
}

async function initPlaybook() {
  logger.info(`[USECASES][PLAYBOOK] - initPlaybook`);
  const playbooks = await shell.listPlaybooks();
  playbooks?.map(async (playbook) => {
    const configurationFileContent = await shell.readPlaybookConfiguration(
      playbook.replaceAll('.yml', '.json'),
    );
    if (configurationFileContent) {
      logger.info(`[USECASES][PLAYBOOK] - playbook has configuration file`);
      const playbookConfiguration = JSON.parse(
        configurationFileContent,
      ) as Ansible.PlaybookConfigurationFile;
      await PlaybookRepo.updateOrCreate({
        name: playbook,
        custom: !playbook.startsWith('_'),
        playableInBatch: playbookConfiguration.playableInBatch,
        extraVars: playbookConfiguration.extraVars,
      } as Playbook);
    } else {
      await PlaybookRepo.updateOrCreate({
        name: playbook,
        custom: !playbook.startsWith('_'),
      } as Playbook);
    }
  });
}

async function getAllPlaybooks() {
  const listOfPlaybooks = await PlaybookRepo.findAll();
  return listOfPlaybooks
    ?.sort((a, b) => (a.name.startsWith('_') ? -1 : 1))
    .map((e) => {
      return { value: e.name, label: e.name.replaceAll('.yml', '') };
    });
}

async function createCustomPlaybook(name: string) {
  await PlaybookModel.create({ name: name, custom: true }).then(async () => {
    await shell.newPlaybook(name);
  });
}

async function deleteCustomPlaybook(name: string) {
  await PlaybookModel.deleteOne({ name: name }).then(async () => {
    await shell.deletePlaybook(name);
  });
}

export default {
  initPlaybook,
  getAllPlaybooks,
  createCustomPlaybook,
  deleteCustomPlaybook,
  executePlaybook,
};
