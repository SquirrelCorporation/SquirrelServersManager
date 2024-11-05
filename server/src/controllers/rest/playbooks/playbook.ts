import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import logger from '../../../logger';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import Shell from '../../../modules/shell';
import FileSystemManager from '../../../modules/shell/managers/FileSystemManager';
import PlaybooksRepositoryUseCases from '../../../services/PlaybooksRepositoryUseCases';
import PlaybookUseCases from '../../../services/PlaybookUseCases';

export const getPlaybooks = async (req, res) => {
  try {
    const playbooks = await PlaybookRepo.findAllWithActiveRepositories();
    const filteredPlaybooks = playbooks?.filter((playbook) => {
      const { path, playbooksRepository } = playbook;
      if (!playbooksRepository || !playbooksRepository.directoryExclusionList) {
        return true;
      }

      const { directoryExclusionList } = playbooksRepository;

      return !directoryExclusionList.some((exclusion) => {
        const regex = new RegExp(`(^|/)${exclusion}($|/)`);
        return regex.test(path);
      });
    });
    new SuccessResponse('Got Playbooks successfully', filteredPlaybooks).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getPlaybook = async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  if (!Shell.PlaybookFileManager.testExistence(playbook.path)) {
    throw new NotFoundError(
      `Playbook ${playbook.name} not found on filesystem.\n This likely due to a de-synchronisation between the database and the filesystem.\n Please run "Sync To Database" to fix this issue. (In Settings/Playbooks)`,
    );
  }
  try {
    const content = Shell.PlaybookFileManager.readPlaybook(playbook.path);
    new SuccessResponse('Got Playbook successfully', content).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const editPlaybook = async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    Shell.PlaybookFileManager.editPlaybook(req.body.content, playbook.path);
    new SuccessResponse('Playbook edited successfully').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const addExtraVarToPlaybook = async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    await PlaybookUseCases.addExtraVarToPlaybook(playbook, req.body.extraVar);
    new SuccessResponse('Added an extra var to playbook successfully').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const deleteExtraVarFromPlaybook = async (req, res) => {
  const { uuid, varname } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    await PlaybookUseCases.deleteExtraVarFromPlaybook(playbook, varname);
    new SuccessResponse('Deleted extra var from playbook successfully').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const deletePlaybook = async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    await PlaybooksRepositoryUseCases.deletePlaybooksInRepository(playbook);
    new SuccessResponse('Playbook deleted successfully').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
