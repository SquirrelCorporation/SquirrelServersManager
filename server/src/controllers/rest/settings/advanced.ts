import {
  COLLECTION_NAME as PlaybookCollectionName,
  PlaybookModel,
} from '../../../data/database/model/Playbook';
import AnsibleLogsRepo from '../../../data/database/repository/AnsibleLogsRepo';
import LogsRepo from '../../../data/database/repository/LogsRepo';
import { restart } from '../../../main';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import PlaybooksRepositoryEngine from '../../../modules/playbooks/engines/PlaybooksRepositoryEngine';

export const postRestartServer = async (req, res) => {
  await restart();
};

export const deleteLogs = async (req, res) => {
  await LogsRepo.deleteAll();
  new SuccessResponse('Logs Purged Successfully').send(res);
};

export const deleteAnsibleLogs = async (req, res) => {
  await AnsibleLogsRepo.deleteAll();
  new SuccessResponse('Ansible logs Purged Successfully').send(res);
};

export const deletePlaybooksModelAndResync = async (req, res) => {
  await PlaybookModel.db.collection(PlaybookCollectionName).drop();
  await PlaybooksRepositoryEngine.registerRepositories();
  await PlaybooksRepositoryEngine.syncAllRegistered();
  new SuccessResponse('All data purged successfully').send(res);
};
