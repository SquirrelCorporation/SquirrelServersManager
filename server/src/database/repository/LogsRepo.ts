import { DateTime } from 'luxon';
import Logs, { LogsModel } from '../model/Logs';

async function deleteAllOld(ageInMinutes: number): Promise<void> {
   await LogsModel.deleteMany(
    {time: { $lt: DateTime.now().minus({minute: ageInMinutes}).toJSDate()}})
    .exec();
}

async function findAll(): Promise<Logs[]> {
  return await LogsModel.find()
    .sort({time: -1})
    .lean()
    .exec();
}

export default {
  findAll,
  deleteAllOld
};
