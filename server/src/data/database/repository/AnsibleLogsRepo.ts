import AnsibleLog, { AnsibleLogModel } from '../model/AnsibleLogs';
import { LogsModel } from '../model/Logs';

async function create(ansibleLog: AnsibleLog): Promise<AnsibleLog> {
  const created = await AnsibleLogModel.create(ansibleLog);
  return created.toObject();
}

async function findAllByIdent(ident: string, sortedBy: -1 | 1 = -1): Promise<AnsibleLog[] | null> {
  return await AnsibleLogModel.find({ ident: ident }).sort({ createdAt: sortedBy }).lean().exec();
}

async function deleteAllByIdent(ident: string) {
  return await AnsibleLogModel.deleteMany({ ident: ident }).lean().exec();
}

async function deleteAll(): Promise<void> {
  await LogsModel.deleteMany().exec();
}

export default {
  create,
  findAllByIdent,
  deleteAllByIdent,
  deleteAll,
};
