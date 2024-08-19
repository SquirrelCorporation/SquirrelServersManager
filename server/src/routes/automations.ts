import express from 'express';
import passport from 'passport';
import {
  deleteAutomation,
  getAllAutomations,
  getTemplate,
  manualAutomationExecution,
  postAutomation,
  putAutomation,
} from '../services/rest/automations/automations';
import {
  deleteAutomationValidator,
  manualAutomationExecutionValidator,
  postAutomationValidator,
  putAutomationValidator,
} from '../services/rest/automations/automations.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/').get(getAllAutomations);
router.route('/template/:templateId').get(getTemplate);
router.route('/:name').put(putAutomationValidator, putAutomation);
router.route('/:uuid/execute').post(manualAutomationExecutionValidator, manualAutomationExecution);
router
  .route('/:uuid')
  .delete(deleteAutomationValidator, deleteAutomation)
  .post(postAutomationValidator, postAutomation);

export default router;
