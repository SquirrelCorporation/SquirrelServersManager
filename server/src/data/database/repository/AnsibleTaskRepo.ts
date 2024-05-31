import { DateTime } from 'luxon';
import AnsibleTask, { AnsibleTaskModel } from '../model/AnsibleTask';
import AnsibleTaskStatusRepo from './AnsibleTaskStatusRepo';
import AnsibleLogsRepo from './AnsibleLogsRepo';

async function create(ansibleTask: AnsibleTask): Promise<AnsibleTask> {
  const created = await AnsibleTaskModel.create(ansibleTask);
  return created.toObject();
}

async function updateStatus(ident: string, status: string) {
  return await AnsibleTaskModel.findOneAndUpdate({ ident: ident }, { status: status })
    .lean()
    .exec();
}

async function findAll(): Promise<AnsibleTask[]> {
  return await AnsibleTaskModel.find().sort({ createdAt: -1 }).lean().exec();
}
async function findAllOld(ageInMinutes: number): Promise<AnsibleTask[]> {
  return await AnsibleTaskModel.find({
    createdAt: { $lt: DateTime.now().minus({ minute: ageInMinutes }).toJSDate() },
  })
    .lean()
    .exec();
}

async function deleteAllTasksAndStatuses(ansibleTask: AnsibleTask) {
  await AnsibleTaskStatusRepo.deleteAllByIdent(ansibleTask.ident);
  await AnsibleLogsRepo.deleteAllByIdent(ansibleTask.ident);
}

async function deleteAllOldLogsAndStatuses(ageInMinutes: number) {
  const tasks = await findAllOld(ageInMinutes);
  tasks?.forEach(async (task) => {
    await deleteAllTasksAndStatuses(task);
  });
}

export default {
  create,
  updateStatus,
  findAll,
  deleteAllOldLogsAndStatuses,
};
