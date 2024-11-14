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
} from '../controllers/rest/containers-stacks-repository/git';
import {
  addGitRepositoryValidator,
  genericGitRepositoryActionValidator,
  updateGitRepositoryValidator,
} from '../controllers/rest/containers-stacks-repository/git.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router
  .route('/git/')
  .get(getGitRepositories)
  .put(addGitRepositoryValidator, addGitRepository)
  .put(addGitRepositoryValidator, addGitRepository);
router
  .route('/git/:uuid')
  .post(updateGitRepositoryValidator, updateGitRepository)
  .delete(genericGitRepositoryActionValidator, deleteGitRepository);
router
  .route('/git/:uuid/sync-to-database-repository')
  .post(genericGitRepositoryActionValidator, syncToDatabaseRepository);
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

export default router;
