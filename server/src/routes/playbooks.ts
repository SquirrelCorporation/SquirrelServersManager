import express from 'express';
import passport from 'passport';
import { getVaultPwd } from '../controllers/rest/ansible/vault';
import {
  execPlaybook,
  execPlaybookByQuickRef,
  getLogs,
  getStatus,
} from '../controllers/rest/playbooks/execution';
import {
  execPlaybookByQuickRefValidator,
  execPlaybookValidator,
  getLogsValidator,
  getStatusValidator,
} from '../controllers/rest/playbooks/execution.validator';
import { setSharedExtraVarValue } from '../controllers/rest/playbooks/extravar';
import { addOrUpdateExtraVarValueValidator } from '../controllers/rest/playbooks/extravar.validator';
import {
  getAnsibleGalaxyCollection,
  getAnsibleGalaxyCollections,
  postInstallAnsibleGalaxyCollection,
} from '../controllers/rest/playbooks/galaxy';
import {
  getAnsibleGalaxyCollectionValidator,
  getAnsibleGalaxyCollectionsValidator,
  postInstallAnsibleGalaxyCollectionValidator,
} from '../controllers/rest/playbooks/galaxy.validator';
import { addTaskEvent, addTaskStatus } from '../controllers/rest/playbooks/hook';
import { getInventory } from '../controllers/rest/playbooks/inventory';
import {
  addExtraVarToPlaybook,
  deleteExtraVarFromPlaybook,
  deletePlaybook,
  editPlaybook,
  getPlaybook,
  getPlaybooks,
} from '../controllers/rest/playbooks/playbook';
import {
  addExtraVarToPlaybookValidator,
  deleteExtraVarFromPlaybookValidator,
  deletePlaybookValidator,
  editPlaybookValidator,
  getPlaybookValidator,
} from '../controllers/rest/playbooks/playbook.validator';

const router = express.Router();

router.post(
  `/hook/task/status`,
  passport.authenticate('bearer', { session: false }),
  addTaskStatus,
);
router.post(`/hook/task/event`, passport.authenticate('bearer', { session: false }), addTaskEvent);
router.get(`/inventory`, passport.authenticate('bearer', { session: false }), getInventory);
router.get('/vaults/:vaultId', passport.authenticate('bearer', { session: false }), getVaultPwd);

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', getPlaybooks);

router.get(`/galaxy/collection`, getAnsibleGalaxyCollectionsValidator, getAnsibleGalaxyCollections);
router.get(
  `/galaxy/collection/details`,
  getAnsibleGalaxyCollectionValidator,
  getAnsibleGalaxyCollection,
);
router.post(
  `/galaxy/collection/install`,
  postInstallAnsibleGalaxyCollectionValidator,
  postInstallAnsibleGalaxyCollection,
);

// Playbooks execution
router.get(`/exec/:id/logs`, getLogsValidator, getLogs);
router.get(`/exec/:id/status`, getStatusValidator, getStatus);
router.post(`/exec/quick-ref/:quickRef`, execPlaybookByQuickRefValidator, execPlaybookByQuickRef);
router.post(`/exec/:uuid`, execPlaybookValidator, execPlaybook);

router.post(`/extravars/:varname`, addOrUpdateExtraVarValueValidator, setSharedExtraVarValue);

router.post(`/:uuid/extravars`, addExtraVarToPlaybookValidator, addExtraVarToPlaybook);
router.delete(
  `/:uuid/extravars/:varname`,
  deleteExtraVarFromPlaybookValidator,
  deleteExtraVarFromPlaybook,
);

router
  .route('/:uuid/')
  .get(getPlaybookValidator, getPlaybook)
  .patch(editPlaybookValidator, editPlaybook)
  .delete(deletePlaybookValidator, deletePlaybook);

export default router;
