import Automation from '../../data/database/model/Automation';
import AutomationRepo from '../../data/database/repository/AutomationRepo';
import AutomationComponent from './AutomationComponent';

/**
 * Automations state.
 */
type stateType = {
  automation: { [id: string]: AutomationComponent };
};

const state: stateType = {
  automation: {},
};

function getStates() {
  return state;
}

async function registerComponent(automationToRegister: Automation) {
  state.automation[automationToRegister.uuid] = new AutomationComponent(
    automationToRegister.uuid,
    automationToRegister.name,
    automationToRegister.automationChains,
  );
  await state.automation[automationToRegister.uuid].init();
}

async function registerComponents() {
  const automations = await AutomationRepo.findAllEnabled();
  if (automations) {
    await Promise.all(
      automations?.map((automation) => {
        return registerComponent(automation);
      }),
    );
  }
}

async function deregisterComponent(automation: Automation) {
  const registeredAutomationComponent = getStates().automation[automation.uuid];
  if (!registeredAutomationComponent) {
    throw new Error(`Could not deRegister automation component with uuid: ${automation.uuid}`);
  }
  registeredAutomationComponent.deregister();
  delete state.automation[automation.uuid];
}

async function init() {
  await registerComponents();
}

export default {
  init,
  getStates,
  registerComponent,
  registerComponents,
  deregisterComponent,
};
