import { v4 as uuidv4 } from 'uuid';
import { Playbooks } from 'ssm-shared-lib';
import { NotFoundError } from '../core/api/ApiError';
import PlaybooksRepositoryRepo from '../data/database/repository/PlaybooksRepositoryRepo';
import { DIRECTORY_ROOT } from '../integrations/playbooks-repository/PlaybooksRepositoryComponent';
import PlaybooksRepositoryEngine from '../integrations/playbooks-repository/PlaybooksRepositoryEngine';
import { createDirectoryWithFullPath } from '../integrations/shell/utils';
import logger from '../logger';

async function addLocalRepository(name: string) {
  const uuid = uuidv4();
  const localRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.LOCAL,
    name,
    enabled: true,
    directory: DIRECTORY_ROOT,
  });
  logger.info(localRepository.uuid);
  await PlaybooksRepositoryRepo.create({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.LOCAL,
    name,
    directory: DIRECTORY_ROOT,
    enabled: true,
  });
  try {
    await createDirectoryWithFullPath(localRepository.getDirectory());
    void localRepository.syncToDatabase();
  } catch (error: any) {
    logger.warn(error);
  }
}

async function updateLocalRepository(uuid: string, name: string) {
  const playbooksRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbooksRepository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryEngine.deregisterRepository(uuid);
  playbooksRepository.name = name;
  await PlaybooksRepositoryEngine.registerRepository(playbooksRepository);
  await PlaybooksRepositoryRepo.update(playbooksRepository);
}

export default {
  updateLocalRepository,
  addLocalRepository,
};
