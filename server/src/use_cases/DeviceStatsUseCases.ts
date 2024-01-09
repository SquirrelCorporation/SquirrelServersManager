import DeviceStatRepo from "../database/repository/DeviceStatRepo";
import Device from "../database/model/Device";
import logger from "../logger";
import {DateTime} from "luxon";
import DeviceStat from "../database/model/DeviceStat";

async function createDeviceStatFromJson(body: any, device : Device) {
  await DeviceStatRepo.create({
    device: device,
    storageTotalGb: body.storage.storageTotalGb,
    storageUsedGb: body.storage.storageUsedGb,
    storageFreeGb: body.storage.storageFreeGb,
    storageUsedPercentage: body.storage.storageUsedPercentage,
    storageFreePercentage: body.storage.storageFreePercentage,
    cpuUsage: body.cpu.usage,
    memTotalMb: body.mem.memTotalMb,
    memTotalUsedMb: body.mem.memTotalUsedMb,
    memTotalFreeMb: body.mem.memTotalFreeMb,
    memUsedPercentage: body.mem.memUsedPercentage,
    memFreePercentage: body.mem.memFreePercentage,
  })
}

async function createStatIfMinInterval(body: any, device: Device): Promise<void> {
  const deviceStat = await DeviceStatRepo.findLatestStat(device);
  if (!deviceStat || !deviceStat.createdAt || (deviceStat.createdAt < DateTime.now().minus({minute: 1}).toJSDate())) {
    logger.info("[USECASE] - Creating new device stat record...");
    await createDeviceStatFromJson(body, device);
  } else {
    logger.info("[USECASE] - DeviceStat already exist, not creating");
  }
}

async function getStatsByDeviceAndType(device: Device, from: number, type?: string) : Promise<DeviceStat[] | null> {
  logger.info(`[USECASE] - getStatsByDeviceAndType - type: ${type}, from: ${from}, device: ${device.uuid}`);
  switch (type) {
    case 'cpu':
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$cpuUsage', from);
    case 'memUsed':
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$memUsedPercentage', from);
    case 'memFree':
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$memFreePercentage', from);
    default:
      throw new Error("Unknown Type")
  }
}

export default {
  createStatIfMinInterval,
  getStatsByDeviceAndType
};
