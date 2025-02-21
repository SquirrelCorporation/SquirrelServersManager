import { Repositories } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import PlaybooksRepositoryRepo from '../data/database/repository/PlaybooksRepositoryRepo';
import PinoLogger from '../logger';
import { NotFoundError } from '../middlewares/api/ApiError';
import { DIRECTORY_ROOT } from '../modules/repository/PlaybooksRepositoryComponent';
import PlaybooksRepositoryEngine from '../modules/repository/PlaybooksRepositoryEngine';

const logger = PinoLogger.child(
  { module: 'LocalRepositoryUseCases' },
  { msgPrefix: '[LOCAL_REPOSITORY] - ' },
);

async function addLocalRepository(
  name: string,
  directoryExclusionList?: string[],
  vaults?: string[],
) {
  const uuid = uuidv4();
  const localRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Repositories.RepositoryType.LOCAL,
    name,
    enabled: true,
    directory: DIRECTORY_ROOT,
    directoryExclusionList,
  });
  await PlaybooksRepositoryRepo.create({
    uuid,
    type: Repositories.RepositoryType.LOCAL,
    name,
    directory: localRepository.getDirectory(),
    enabled: true,
    directoryExclusionList,
    vaults,
  });
  try {
    await localRepository.init();
    void localRepository.syncToDatabase();
  } catch (error: any) {
    logger.warn(error);
  }
}

async function updateLocalRepository(
  uuid: string,
  name: string,
  directoryExclusionList?: string[],
  vaults?: string[],
) {
  const playbooksRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbooksRepository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryEngine.deregisterRepository(uuid);
  playbooksRepository.name = name;
  playbooksRepository.directoryExclusionList = directoryExclusionList;
  playbooksRepository.vaults = vaults;
  await PlaybooksRepositoryEngine.registerRepository(playbooksRepository);
  await PlaybooksRepositoryRepo.update(playbooksRepository);
}

export default {
  updateLocalRepository,
  addLocalRepository,
};
