import AnsibleLog, {AnsibleLogModel} from "../model/AnsibleLogs";

async function create(ansibleLog: AnsibleLog): Promise<AnsibleLog> {
    const created = await AnsibleLogModel.create(ansibleLog);
    return created.toObject();
}

async function findAllByIdent(ident: string): Promise<AnsibleLog[] | null> {
    return await AnsibleLogModel.find({ident: ident})
        .sort({createdAt: -1})
        .lean()
        .exec();
}

async function deleteAll(ident: string) {
    return await AnsibleLogModel.deleteMany({ident: ident})
        .lean()
        .exec();
}

export default {
    create,
    findAllByIdent,
    deleteAll
}
