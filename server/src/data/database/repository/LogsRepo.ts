import { DateTime } from 'luxon';
import Logs, { LogsModel } from '../model/Logs';

async function deleteAllOld(ageInDays: number): Promise<void> {
  await LogsModel.deleteMany({
    time: { $lt: DateTime.now().minus({ day: ageInDays }).toJSDate() },
  }).exec();
}

async function findAll(): Promise<Logs[]> {
  return await LogsModel.find().sort({ time: -1 }).limit(10000).lean().exec();
}

async function deleteAll(): Promise<void> {
  await LogsModel.deleteMany().exec();
}

export default {
  findAll,
  deleteAllOld,
  deleteAll,
};
