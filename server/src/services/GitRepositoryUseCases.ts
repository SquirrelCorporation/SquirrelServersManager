import { Playbooks } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import PlaybooksRepositoryRepo from '../data/database/repository/PlaybooksRepositoryRepo';
import PlaybooksRepositoryEngine from '../modules/playbooks-repository/PlaybooksRepositoryEngine';

async function addGitRepository(
  name: string,
  accessToken: string,
  branch: string,
  email: string,
  userName: string,
  remoteUrl: string,
  directoryExclusionList?: string[],
) {
  const uuid = uuidv4();
  const gitRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.GIT,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    enabled: true,
    directoryExclusionList,
  });
  await PlaybooksRepositoryRepo.create({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.GIT,
    name,
    remoteUrl,
    accessToken,
    branch,
    email,
    userName,
    directory: gitRepository.getDirectory(),
    enabled: true,
    directoryExclusionList,
  });
  void gitRepository.clone();
  void gitRepository.syncToDatabase();
}

async function updateGitRepository(
  uuid: string,
  name: string,
  accessToken: string,
  branch: string,
  email: string,
  userName: string,
  remoteUrl: string,
  directoryExclusionList?: string[],
) {
  await PlaybooksRepositoryEngine.deregisterRepository(uuid);
  const gitRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.GIT,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    enabled: true,
    directoryExclusionList,
  });
  await PlaybooksRepositoryRepo.update({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.GIT,
    name,
    remoteUrl,
    accessToken,
    branch,
    email,
    userName,
    directory: gitRepository.getDirectory(),
    enabled: true,
    directoryExclusionList,
  });
}

export default {
  addGitRepository,
  updateGitRepository,
};
