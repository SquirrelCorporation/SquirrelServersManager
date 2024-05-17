import { DeviceStatus } from 'ssm-shared-lib/distribution/enums/status';
import { API } from 'ssm-shared-lib';
import Device from '../data/database/model/Device';
import DeviceAuthRepo from '../data/database/repository/DeviceAuthRepo';
import DeviceDownTimeEventRepo from '../data/database/repository/DeviceDownTimeEventRepo';
import DeviceRepo from '../data/database/repository/DeviceRepo';
import DeviceStatRepo from '../data/database/repository/DeviceStatRepo';
import logger from '../logger';

async function getDevicesOverview() {
  logger.info(`[USECASES][DEVICE] - getDevicesOverview`);
  const devices = await DeviceRepo.findAll();
  const offline = devices?.filter((e) => e.status === DeviceStatus.OFFLINE).length;
  const online = devices?.filter((e) => e.status === DeviceStatus.ONLINE).length;
  const overview = devices?.map((e) => {
    return {
      name: e.status !== DeviceStatus.UNMANAGED ? e.fqdn : e.ip,
      status: e.status,
      uuid: e.uuid,
      cpu: e.cpuSpeed,
      mem: e.mem,
    };
  });
  const totalCpu = devices?.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue?.cpuSpeed || 0);
  }, 0);
  const totalMem = devices?.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue?.mem || 0);
  }, 0);
  return {
    offline: offline,
    online: online,
    overview: overview,
    totalCpu: totalCpu ? totalMem : NaN,
    totalMem: totalMem ? totalMem / 1024 : NaN,
  };
}

async function updateDeviceFromJson(deviceInfo: API.DeviceInfo, device: Device) {
  logger.info(`[USECASES][DEVICE] - updateDeviceFromJson - DeviceUuid: ${device?.uuid}`);
  logger.debug(deviceInfo);
  device.ip = deviceInfo.ip;
  device.hostname = deviceInfo.hostname;
  device.uptime = deviceInfo.uptime;
  device.fqdn = deviceInfo.fqdn;
  device.agentVersion = deviceInfo.agentVersion;
  device.osArch = deviceInfo.os?.arch;
  device.osPlatform = deviceInfo.os?.platform;
  device.osDistro = deviceInfo.os?.distro;
  device.osCodeName = deviceInfo.os?.codename;
  device.osKernel = deviceInfo.os?.kernel;
  device.osLogoFile = deviceInfo.system?.raspberry?.type ? 'raspbian' : deviceInfo.os?.logofile;
  device.systemManufacturer = deviceInfo.system?.manufacturer;
  device.systemModel = deviceInfo.system?.model;
  device.systemVersion = deviceInfo.system?.version;
  device.systemUuid = deviceInfo.system?.uuid;
  device.systemSku = deviceInfo.system?.sku;
  device.systemVirtual = deviceInfo.system?.virtual;
  device.cpuBrand = deviceInfo.cpu?.brand;
  device.cpuBrand = deviceInfo.cpu?.manufacturer;
  device.cpuFamily = deviceInfo.cpu?.family;
  device.versions = deviceInfo.os?.versionData;
  device.cpuSpeed = deviceInfo.cpu?.speed;
  device.mem = deviceInfo.mem?.memTotalMb;
  if (device.status !== DeviceStatus.ONLINE) {
    await DeviceDownTimeEventRepo.closeDownTimeEvent(device);
    device.status = DeviceStatus.ONLINE;
  }
  device.raspberry = deviceInfo.system?.raspberry;
  await DeviceRepo.update(device);
  return device;
}

async function deleteDevice(device: Device) {
  logger.info(`[USECASES][DEVICE] - deleteDevice - DeviceUuid: ${device.uuid}`);
  await DeviceStatRepo.deleteManyByDevice(device);
  await DeviceAuthRepo.deleteByDevice(device);
  await DeviceDownTimeEventRepo.deleteManyByDevice(device);
  await DeviceRepo.deleteByUuid(device.uuid);
}

async function updateDockerWatcher(
  device: Device,
  dockerWatcher: boolean,
  dockerWatcherCron?: string,
) {
  logger.info(`[USECASES][DEVICE] - updateDockerWatcher - DeviceUuid: ${device.uuid}`);
  device.dockerWatcher = dockerWatcher;
  device.dockerWatcherCron = dockerWatcherCron;
  await DeviceRepo.update(device);
}

async function getDevicesToWatch() {
  return DeviceRepo.findWithFilter({
    dockerWatcher: true,
  });
}

export default {
  updateDeviceFromJson,
  getDevicesOverview,
  deleteDevice,
  updateDockerWatcher,
  getDevicesToWatch,
};
