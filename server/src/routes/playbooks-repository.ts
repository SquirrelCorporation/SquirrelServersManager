import express from 'express';
import passport from 'passport';
import {
  addGitRepository,
  commitAndSyncRepository,
  deleteGitRepository,
  forceCloneRepository,
  forcePullRepository,
  forceRegister,
  getGitRepositories,
  syncToDatabaseRepository,
  updateGitRepository,
} from '../controllers/rest/playbooks-repository/git';
import {
  addGitRepositoryValidator,
  genericGitRepositoryActionValidator,
  updateGitRepositoryValidator,
} from '../controllers/rest/playbooks-repository/git.validator';
import {
  addLocalRepository,
  deleteLocalRepository,
  getLocalRepositories,
  syncToDatabaseLocalRepository,
  updateLocalRepository,
} from '../controllers/rest/playbooks-repository/local';
import {
  addLocalRepositoryValidator,
  genericActionLocalRepositoryValidator,
  updateLocalRepositoryValidator,
} from '../controllers/rest/playbooks-repository/local.validator';
import {
  addDirectoryToPlaybookRepositoryValidator,
  addPlaybookToRepositoryValidator,
  deleteAnyFromRepositoryValidator,
  getPlaybookCustomVaultsValidator,
} from '../controllers/rest/playbooks-repository/platbooks-repository.validator';
import {
  addDirectoryToPlaybookRepository,
  addPlaybookToRepository,
  deleteAnyFromRepository,
  getPlaybookCustomVaults,
  getPlaybooksRepositories,
  postPlaybookCustomVaults,
} from '../controllers/rest/playbooks-repository/playbooks-repository';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get(`/`, getPlaybooksRepositories);

router.route('/git/').get(getGitRepositories).put(addGitRepositoryValidator, addGitRepository);
router
  .route('/local/')
  .get(getLocalRepositories)
  .put(addLocalRepositoryValidator, addLocalRepository);
router
  .route('/local/:uuid')
  .post(updateLocalRepositoryValidator, updateLocalRepository)
  .delete(genericActionLocalRepositoryValidator, deleteLocalRepository);
router
  .route('/git/:uuid')
  .post(updateGitRepositoryValidator, updateGitRepository)
  .delete(genericGitRepositoryActionValidator, deleteGitRepository);
router
  .route('/git/:uuid/sync-to-database-repository')
  .post(genericGitRepositoryActionValidator, syncToDatabaseRepository);
router
  .route('/local/:uuid/sync-to-database-repository')
  .post(genericActionLocalRepositoryValidator, syncToDatabaseLocalRepository);
router
  .route('/git/:uuid/force-pull-repository')
  .post(genericGitRepositoryActionValidator, forcePullRepository);
router
  .route('/git/:uuid/force-clone-repository')
  .post(genericGitRepositoryActionValidator, forceCloneRepository);
router
  .route('/git/:uuid/commit-and-sync-repository')
  .post(genericGitRepositoryActionValidator, commitAndSyncRepository);
router.route('/git/:uuid/force-register').post(genericGitRepositoryActionValidator, forceRegister);
router
  .route('/:uuid/directory/:directoryName/')
  .put(addDirectoryToPlaybookRepositoryValidator, addDirectoryToPlaybookRepository);
router
  .route('/:uuid/playbook/:playbookName/')
  .put(addPlaybookToRepositoryValidator, addPlaybookToRepository);
router.route('/:uuid/').delete(deleteAnyFromRepositoryValidator, deleteAnyFromRepository);
router
  .route('/:uuid/vaults')
  .get(getPlaybookCustomVaultsValidator, getPlaybookCustomVaults)
  .post(postPlaybookCustomVaults);

export default router;
