import DeviceStat, {DeviceStatModel} from "../model/DeviceStat";
import Device from "../model/Device";

async function create(deviceStat: DeviceStat): Promise<DeviceStat> {
  const createdDeviceStat = await DeviceStatModel.create(deviceStat);
  return createdDeviceStat.toObject();
}

async function findLatestStat(device: Device): Promise<DeviceStat | null> {
  return DeviceStatModel.findOne({ device: device })
    .limit(1)
    .sort({ created_at: -1 })
    .lean()
    .exec();
}


export default {
  create,
  findLatestStat
};
