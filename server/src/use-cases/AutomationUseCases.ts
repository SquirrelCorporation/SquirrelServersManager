import Automation from '../data/database/model/Automation';
import AutomationRepo from '../data/database/repository/AutomationRepo';
import AutomationEngine from '../integrations/automations/AutomationEngine';

async function createAutomation(automation: Partial<Automation>) {
  const createdAutomation = await AutomationRepo.create(automation);
  await AutomationEngine.registerComponent(createdAutomation);
  return createdAutomation;
}

async function executeAutomation(automation: Automation) {
  const registeredAutomationComponent = AutomationEngine.getStates().automation[automation.uuid];
  if (!registeredAutomationComponent) {
    throw new Error(`Automation with uuid: ${automation.uuid} not registered`);
  }
  void registeredAutomationComponent.synchronousExecution();
}

export default {
  createAutomation,
  executeAutomation,
};
