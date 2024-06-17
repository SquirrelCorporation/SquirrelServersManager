import express from 'express';
import passport from 'passport';
import { execPlaybook, getLogs, getStatus } from '../services/ansible/execution';
import {
  execPlaybookValidator,
  getLogsValidator,
  getStatusValidator,
} from '../services/ansible/execution.validator';
import { addOrUpdateExtraVarValue } from '../services/ansible/extravar';
import { addOrUpdateExtraVarValueValidator } from '../services/ansible/extravar.validator';
import {
  getAnsibleGalaxyCollection,
  getAnsibleGalaxyCollections,
  postInstallAnsibleGalaxyCollection,
} from '../services/ansible/galaxy';
import {
  getAnsibleGalaxyCollectionsValidator,
  getAnsibleGalaxyCollectionValidator,
  postInstallAnsibleGalaxyCollectionValidator,
} from '../services/ansible/galaxy.validator';
import { addTaskEvent, addTaskStatus } from '../services/ansible/hook';
import { getInventory } from '../services/ansible/inventory';
import {
  addExtraVarToPlaybook,
  addPlaybook,
  deleteExtraVarFromPlaybook,
  deletePlaybook,
  editPlaybook,
  getPlaybook,
  getPlaybooks,
} from '../services/ansible/playbook';
import {
  addExtraVarToPlaybookValidator,
  addPlaybookValidator,
  deleteExtraVarFromPlaybookValidator,
  deletePlaybookValidator,
  editPlaybookValidator,
  getPlaybookValidator,
} from '../services/ansible/playbook.validator';
import { getVaultPwd } from '../services/ansible/vault';

const router = express.Router();

router.post(
  `/hook/task/status`,
  passport.authenticate('bearer', { session: false }),
  addTaskStatus,
);
router.post(`/hook/task/event`, passport.authenticate('bearer', { session: false }), addTaskEvent);
router.get('/vault', passport.authenticate('bearer', { session: false }), getVaultPwd);
router.get(`/inventory`, passport.authenticate('bearer', { session: false }), getInventory);

router.use(passport.authenticate('jwt', { session: false }));

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

router.post(`/exec/playbook/:playbook`, execPlaybookValidator, execPlaybook);
router.get(`/exec/:id/logs`, getLogsValidator, getLogs);
router.get(`/exec/:id/status`, getStatusValidator, getStatus);
router.post(`/extravars/:varname`, addOrUpdateExtraVarValueValidator, addOrUpdateExtraVarValue);
router
  .route('/playbooks/:playbook/')
  .get(getPlaybookValidator, getPlaybook)
  .patch(editPlaybookValidator, editPlaybook)
  .put(addPlaybookValidator, addPlaybook)
  .delete(deletePlaybookValidator, deletePlaybook);
router.get(`/playbooks`, getPlaybooks);
router.post(
  `/playbooks/:playbook/extravars`,
  addExtraVarToPlaybookValidator,
  addExtraVarToPlaybook,
);
router.delete(
  `/playbooks/:playbook/extravars/:varname`,
  deleteExtraVarFromPlaybookValidator,
  deleteExtraVarFromPlaybook,
);

export default router;
