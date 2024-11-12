import Automation from '../data/database/model/Automation';
import AutomationRepo from '../data/database/repository/AutomationRepo';
import AutomationEngine from '../modules/automations/AutomationEngine';

async function createAutomation(automation: Partial<Automation>) {
  const createdAutomation = await AutomationRepo.create(automation);
  await AutomationEngine.registerComponent(createdAutomation);
  return createdAutomation;
}

async function updateAutomation(automation: Automation) {
  await AutomationEngine.deregisterComponent(automation);
  await AutomationRepo.update(automation);
  await AutomationEngine.registerComponent(automation);
}

async function executeAutomation(automation: Automation) {
  const registeredAutomationComponent = AutomationEngine.getStates().automation[automation.uuid];
  if (!registeredAutomationComponent) {
    throw new Error(`Automation with uuid: ${automation.uuid} not registered`);
  }
  void registeredAutomationComponent.synchronousExecution();
}

async function deleteAutomation(automation: Automation) {
  const registeredAutomationComponent = AutomationEngine.getStates().automation[automation.uuid];
  if (!registeredAutomationComponent) {
    throw new Error(`Automation with uuid: ${automation.uuid} not registered`);
  }
  await AutomationEngine.deregisterComponent(automation);
  await AutomationRepo.deleteByUuid(automation.uuid);
}

export default {
  createAutomation,
  executeAutomation,
  deleteAutomation,
  updateAutomation,
};
