import express from 'express';
import passport from 'passport';
import {
  deleteAutomation,
  getAllAutomations,
  getTemplate,
  manualAutomationExecution,
  putAutomation,
} from '../services/automations/automations';
import {
  deleteAutomationValidator,
  manualAutomationExecutionValidator,
  putAutomationValidator,
} from '../services/automations/automations.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/').get(getAllAutomations);
router.route('/template/:templateId').get(getTemplate);
router.route('/:name').put(putAutomationValidator, putAutomation);
router.route('/:uuid/execute').post(manualAutomationExecutionValidator, manualAutomationExecution);
router.route('/:uuid').delete(deleteAutomationValidator, deleteAutomation);

export default router;
