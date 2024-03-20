import express from 'express';
import Authentication from '../middlewares/Authentication';
import { execPlaybook, getLogs, getStatus } from '../services/ansible/execution';
import { AddOrUpdateExtraVar } from '../services/ansible/extravar';
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

const router = express.Router();

router.post(`/hook/task/status`, addTaskStatus);
router.post(`/hook/task/event`, addTaskEvent);
router.get(`/inventory`, getInventory);

router.use(Authentication.isAuthenticated);

router.post(`/exec/playbook/:playbook`, execPlaybook);
router.get(`/exec/:id/logs`, getLogs);
router.get(`/exec/:id/status`, getStatus);
router.post(`/extravars/:varname`, AddOrUpdateExtraVar);
router
  .route('/playbooks/:playbook/')
  .get(getPlaybook)
  .patch(editPlaybook)
  .put(addPlaybook)
  .delete(deletePlaybook);
router.get(`/playbooks`, getPlaybooks);
router.post(`/playbooks/:playbook/extravars`, addExtraVarToPlaybook);
router.delete(`/playbooks/:playbook/extravars/:varname`, deleteExtraVarFromPlaybook);

export default router;
