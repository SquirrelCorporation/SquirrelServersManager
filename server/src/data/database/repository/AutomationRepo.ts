import Automation, { AutomationModel } from '../model/Automation';

async function create(automation: Partial<Automation>) {
  return await AutomationModel.create(automation);
}

async function findAll() {
  return await AutomationModel.find().lean().exec();
}

async function setLastExecutionStatus(automation: Automation, status: 'failed' | 'success') {
  automation.lastExecutionStatus = status;
  automation.lastExecutionTime = new Date();
  await AutomationModel.updateOne({ uuid: automation.uuid }, automation).exec();
}

async function deleteByUuid(uuid: string): Promise<void> {
  await AutomationModel.deleteOne({ uuid: uuid }).exec();
}

async function findByUuid(uuid: string): Promise<Automation | null> {
  return await AutomationModel.findOne({ uuid: uuid }).lean().exec();
}

async function findAllEnabled(): Promise<Automation[] | null> {
  return await AutomationModel.find({ enabled: true }).lean().exec();
}

export default {
  create,
  findAll,
  setLastExecutionStatus,
  deleteByUuid,
  findByUuid,
  findAllEnabled,
};
