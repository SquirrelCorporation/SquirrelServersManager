import { NotFoundError } from '../../../middlewares/api/ApiError';
import GitPlaybooksRepositoryComponent from '../../../modules/repository/git-playbooks-repository/GitPlaybooksRepositoryComponent';
import PlaybooksRepositoryEngine from '../../../modules/repository/PlaybooksRepositoryEngine';

export const postTroubleshoot = async (req, res) => {
  const { type } = req.params;

  switch (type) {
    case 'playbooks_repositories_git_errors':
      break;
  }
};

const playbooksRepositoryCloneErrors = async (uuid: string) => {
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitPlaybooksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  void repository.clone();
  return { name: repository.name, id: repository.uuid };
};

const playbooksRepositoryPullErrors = async (uuid: string) => {
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitPlaybooksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  void repository.forcePull();
  return { name: repository.name, id: repository.uuid };
};
