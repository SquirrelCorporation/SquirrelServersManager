import { API } from 'ssm-shared-lib';
import { ForbiddenError, InternalError } from '../core/api/ApiError';
import Playbook, { PlaybookModel } from '../data/database/model/Playbook';
import PlaybooksRepository from '../data/database/model/PlaybooksRepository';
import PlaybooksRepositoryRepo from '../data/database/repository/PlaybooksRepositoryRepo';
import PinoLogger from '../logger';
import PlaybooksRepositoryComponent from '../modules/playbooks-repository/PlaybooksRepositoryComponent';
import PlaybooksRepositoryEngine from '../modules/playbooks-repository/PlaybooksRepositoryEngine';
import { recursiveTreeCompletion } from '../modules/playbooks-repository/tree-utils';
import Shell from '../modules/shell';

const logger = PinoLogger.child(
  { module: 'PlaybookRepositoryUseCases' },
  { msgPrefix: '[PLAYBOOK_REPOSITORY] - ' },
);

async function getAllPlaybooksRepositories() {
  try {
    const listOfPlaybooksRepositories = await PlaybooksRepositoryRepo.findAllActive();
    if (!listOfPlaybooksRepositories) {
      return [];
    }

    const substitutedListOfPlaybooks = listOfPlaybooksRepositories.map(
      async (playbookRepository) => {
        logger.info(`getAllPlaybooksRepositories - processing ${playbookRepository.name}`);
        return {
          name: playbookRepository.name,
          children: await recursiveTreeCompletion(playbookRepository.tree),
          type: playbookRepository.type,
          uuid: playbookRepository.uuid,
          path: playbookRepository.directory,
          default: playbookRepository.default,
        };
      },
    );

    return (await Promise.all(substitutedListOfPlaybooks)).sort((a, b) =>
      b.default ? 1 : a.default ? 1 : a.name.localeCompare(b.name),
    ) as API.PlaybooksRepository[];
  } catch (error: any) {
    logger.error(error);
    logger.error(`Error during processing`);
  }
}

async function createDirectoryInPlaybookRepository(
  playbooksRepository: PlaybooksRepository,
  path: string,
) {
  const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
    playbooksRepository.uuid
  ] as PlaybooksRepositoryComponent;
  if (!playbooksRepositoryComponent) {
    throw new InternalError('Repository is not registered, try restarting or force sync');
  }
  if (!playbooksRepositoryComponent.fileBelongToRepository(path)) {
    throw new ForbiddenError("The selected path doesn't seems to belong to the repository");
  }
  Shell.FileSystemManager.createDirectory(path, playbooksRepositoryComponent.rootPath);
  await playbooksRepositoryComponent.updateDirectoriesTree();
}

async function createPlaybookInRepository(
  playbooksRepository: PlaybooksRepository,
  fullPath: string,
  name: string,
) {
  const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
    playbooksRepository.uuid
  ] as PlaybooksRepositoryComponent;
  if (!playbooksRepositoryComponent) {
    throw new InternalError(`PlaybookRepository doesn't seem registered`);
  }
  if (!playbooksRepositoryComponent.fileBelongToRepository(fullPath)) {
    throw new ForbiddenError('The selected path doesnt seems to belong to the repository');
  }
  const playbook = await PlaybookModel.create({
    name: name,
    custom: true,
    path: fullPath + '.yml',
    playbooksRepository: playbooksRepository,
    playableInBatch: true,
  });
  Shell.PlaybookFileManager.newPlaybook(fullPath + '.yml');
  await playbooksRepositoryComponent.syncToDatabase();
  return playbook;
}

async function deletePlaybooksInRepository(playbook: Playbook) {
  const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
    (playbook.playbooksRepository as PlaybooksRepository).uuid
  ] as PlaybooksRepositoryComponent;
  if (!playbooksRepositoryComponent) {
    throw new InternalError(`PlaybookRepository doesnt seem registered`);
  }
  await PlaybookModel.deleteOne({ uuid: playbook.uuid });
  Shell.PlaybookFileManager.deletePlaybook(playbook.path);
  await playbooksRepositoryComponent.syncToDatabase();
}

async function deleteAnyInPlaybooksRepository(
  playbooksRepository: PlaybooksRepository,
  fullPath: string,
) {
  const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
    playbooksRepository.uuid
  ] as PlaybooksRepositoryComponent;
  if (!playbooksRepositoryComponent) {
    throw new InternalError(`PlaybookRepository doesnt seem registered`);
  }
  if (!playbooksRepositoryComponent.fileBelongToRepository(fullPath)) {
    throw new ForbiddenError('The selected path doesnt seems to belong to the repository');
  }
  Shell.FileSystemManager.deleteFiles(fullPath, playbooksRepositoryComponent.rootPath);
  await playbooksRepositoryComponent.syncToDatabase();
}

async function deleteRepository(repository: PlaybooksRepository): Promise<void> {
  const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
    repository.uuid
  ] as PlaybooksRepositoryComponent;
  if (!playbooksRepositoryComponent) {
    throw new InternalError(`PlaybookRepository doesnt seem registered`);
  }
  const directory = playbooksRepositoryComponent.getDirectory();
  const rootPath = playbooksRepositoryComponent.rootPath;
  await PlaybooksRepositoryEngine.deregisterRepository(repository.uuid);
  await PlaybooksRepositoryRepo.deleteByUuid(repository.uuid);
  Shell.FileSystemManager.deleteFiles(directory, rootPath);
}

export default {
  getAllPlaybooksRepositories,
  createDirectoryInPlaybookRepository,
  createPlaybookInRepository,
  deletePlaybooksInRepository,
  deleteAnyInPlaybooksRepository,
  deleteRepository,
};
