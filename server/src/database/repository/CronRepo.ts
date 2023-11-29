import Cron, {CronModel} from "../model/Cron";

async function createIfNotExist(cron: Cron): Promise<Cron> {
  const createdCron = await CronModel.findOneAndUpdate({name : cron.name}, cron,  { upsert: true, new: true });
  return createdCron.toObject();
}

async function updateCron(cron: Cron) {
  await CronModel.findOneAndUpdate({name : cron.name}, cron)
    .lean()
    .exec();
}

async function findAll(){
 return await CronModel.find()
   .lean()
   .exec();
}

export default {
  createIfNotExist,
  updateCron,
  findAll
}
