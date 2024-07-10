import { Automations, SsmContainer } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import Playbook from '../../data/database/model/Playbook';
import AutomationRepo from '../../data/database/repository/AutomationRepo';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import AutomationUseCases from '../../use-cases/AutomationUseCases';

export const getAllAutomations = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /automations`);
  const automations = await AutomationRepo.findAll();
  return new SuccessResponse('Got all automations', automations).send(res);
});

export const putAutomation = asyncHandler(async (req, res) => {
  const { rawChain } = req.body;
  const { name } = req.params;
  const automation = await AutomationUseCases.createAutomation({
    name: name,
    automationChains: rawChain,
  });
  return new SuccessResponse('Automation created successfully.', automation).send(res);
});

export const deleteAutomation = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const automation = await AutomationRepo.findByUuid(uuid);
  if (!automation) {
    throw new NotFoundError(`Automation uuid ${uuid} not found`);
  }
  await AutomationRepo.deleteByUuid(uuid);
  return new SuccessResponse('Deleted automation', uuid).send(res);
});

export const manualAutomationExecution = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const automation = await AutomationRepo.findByUuid(uuid);
  if (!automation) {
    throw new NotFoundError(`Automation uuid ${uuid} not found`);
  }
  await AutomationUseCases.executeAutomation(automation);
  return new SuccessResponse('Manual automation executed.', automation).send(res);
});

export const getTemplate = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /automations/template/${req.params.templateId}`);
  const { templateId } = req.params;
  const playbooks = (await PlaybookRepo.findAll()) as Playbook[];
  const templates: Partial<Automations.AutomationChain>[] = [
    {
      // Update some devices every month
      trigger: Automations.Triggers.CRON,
      cronValue: '0 0 1 * *',
      actions: [
        {
          action: Automations.Actions.PLAYBOOK,
          playbook: (playbooks.find((e) => e.uniqueQuickRef === 'upgrade') as Playbook)
            .uuid as string,
          actionDevices: [],
        },
      ],
    },
    {
      // Reboot some devices every day
      trigger: Automations.Triggers.CRON,
      cronValue: '0 0 * * *',
      actions: [
        {
          action: Automations.Actions.PLAYBOOK,
          playbook: (playbooks.find((e) => e.uniqueQuickRef === 'reboot') as Playbook)
            .uuid as string,
          actionDevices: [],
        },
      ],
    },
    {
      // Restart some containers every day
      trigger: Automations.Triggers.CRON,
      cronValue: '0 0 * * *',
      actions: [
        {
          action: Automations.Actions.DOCKER,
          dockerAction: SsmContainer.Actions.RESTART,
          dockerContainers: [],
        },
      ],
    },
  ];
  const selectedTemplate = templates[parseInt(templateId)];
  return new SuccessResponse('Got template', selectedTemplate).send(res);
});
