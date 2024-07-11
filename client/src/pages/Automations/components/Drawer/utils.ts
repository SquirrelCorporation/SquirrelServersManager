import { Automations } from 'ssm-shared-lib';

export function transformAutomationChain(
  automation: Automations.AutomationChain,
) {
  return {
    trigger: automation.trigger,
    cronValue: automation.cronValue,
    action: automation.actions[0]?.action,
    playbook: {
      value: (automation.actions[0] as Automations.ActionChainPlaybook)
        ?.playbook,
    },
    actionDevices: (
      automation.actions[0] as Automations.ActionChainPlaybook
    )?.actionDevices?.map((device) => ({
      value: device,
    })),
    dockerAction: {
      value: (automation.actions[0] as Automations.ActionChainDocker)
        ?.dockerAction,
    },
    dockerContainers: (
      automation.actions[0] as Automations.ActionChainDocker
    )?.dockerContainers?.map((container) => ({
      value: container,
    })),
  };
}
