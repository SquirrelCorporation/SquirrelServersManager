import { Automations, SsmContainer } from 'ssm-shared-lib';
import Playbook from '../../../data/database/model/Playbook';
import AutomationRepo from '../../../data/database/repository/AutomationRepo';
import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import AutomationUseCases from '../../../services/AutomationUseCases';

export const getAllAutomations = async (req, res) => {
  const automations = await AutomationRepo.findAll();
  new SuccessResponse('Got all automations', automations).send(res);
};

export const putAutomation = async (req, res) => {
  const { rawChain } = req.body;
  const { name } = req.params;
  const automation = await AutomationUseCases.createAutomation({
    name: name,
    automationChains: rawChain,
  });
  new SuccessResponse('Automation created successfully.', automation).send(res);
};

export const postAutomation = async (req, res) => {
  const { rawChain, name } = req.body;
  const { uuid } = req.params;
  const automation = await AutomationRepo.findByUuid(uuid);
  if (!automation) {
    throw new NotFoundError(`Automation uuid ${uuid} not found`);
  }
  automation.name = name;
  automation.automationChains = rawChain;
  await AutomationUseCases.updateAutomation(automation);
  new SuccessResponse('Automation updated successfully.', automation).send(res);
};

export const deleteAutomation = async (req, res) => {
  const { uuid } = req.params;
  const automation = await AutomationRepo.findByUuid(uuid);
  if (!automation) {
    throw new NotFoundError(`Automation uuid ${uuid} not found`);
  }
  await AutomationUseCases.deleteAutomation(automation);
  new SuccessResponse('Deleted automation', uuid).send(res);
};

export const manualAutomationExecution = async (req, res) => {
  const { uuid } = req.params;
  const automation = await AutomationRepo.findByUuid(uuid);
  if (!automation) {
    throw new NotFoundError(`Automation uuid ${uuid} not found`);
  }
  await AutomationUseCases.executeAutomation(automation);
  new SuccessResponse('Manual automation executed.', automation).send(res);
};

export const getTemplate = async (req, res) => {
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
  new SuccessResponse('Got template', selectedTemplate).send(res);
};
