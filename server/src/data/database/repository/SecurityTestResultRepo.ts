import Device from '../model/Device';
import SecurityTestResult, { SecurityTestResultModel } from '../model/SecurityTestResult';

async function findAll(): Promise<SecurityTestResult[] | null> {
  return await SecurityTestResultModel.aggregate([
    {
      $lookup: {
        from: 'devices',
        localField: 'device',
        foreignField: '_id',
        as: 'device',
      },
    },
    { $unwind: '$device' },
  ]).exec();
}

async function updateOrCreate(testResult: Partial<SecurityTestResult>) {
  await SecurityTestResultModel.findOneAndUpdate(
    { name: testResult.name, device: testResult.device },
    testResult,
    { upsert: true, new: true },
  );
}

async function findTestResultsByDevice(device: Device): Promise<SecurityTestResult[] | null> {
  return await SecurityTestResultModel.find({ device: device }).lean().exec();
}

async function deleteByDevice(device: Device) {
  await SecurityTestResultModel.deleteMany({ device: device }).exec();
}

export default {
  findAll,
  findTestResultsByDevice,
  updateOrCreate,
  deleteByDevice,
};
