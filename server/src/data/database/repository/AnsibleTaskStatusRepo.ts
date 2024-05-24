import AnsibleTaskStatus, { AnsibleTaskStatusModel } from '../model/AnsibleTaskStatus';

async function create(ansibleTaskStatus: AnsibleTaskStatus): Promise<AnsibleTaskStatus> {
  const created = await AnsibleTaskStatusModel.create(ansibleTaskStatus);
  return created.toObject();
}

async function findAllByIdent(ident: string): Promise<AnsibleTaskStatus[] | null> {
  return await AnsibleTaskStatusModel.find({ ident: ident }).sort({ createdAt: -1 }).lean().exec();
}
async function deleteAllByIdent(ident: string) {
  return await AnsibleTaskStatusModel.deleteMany({ ident: ident }).lean().exec();
}
export default {
  create,
  findAllByIdent,
  deleteAllByIdent,
};
