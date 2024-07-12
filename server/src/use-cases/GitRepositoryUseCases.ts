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
  });
}

export default {
  addGitRepository,
  updateGitRepository,
};
