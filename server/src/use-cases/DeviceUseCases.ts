import Device, { DeviceStatus } from '../database/model/Device';
import DeviceRepo from '../database/repository/DeviceRepo';
import logger from '../logger';

async function updateDeviceFromJson(body: any, device: Device) {
  logger.debug(body);

  if (body.ip) {
    device.ip = body.ip;
  }
  if (body.hostname) {
    device.hostname = body.hostname;
  }
  if (body.uptime) {
    device.uptime = body.uptime;
  }
  if (body.fqdn) {
    device.fqdn = body.fqdn;
  }
  if (body.agentVersion) {
    device.agentVersion = body.agentVersion;
  }
  if (body.os.arch) {
    device.osArch = body.os.arch;
  }
  if (body.os.platform) {
    device.osPlatform = body.os.platform;
  }
  if (body.os.distro) {
    device.osDistro = body.os.distro;
  }
  if (body.os.codename) {
    device.osCodeName = body.os.codename;
  }
  if (body.os.kernel) {
    device.osKernel = body.os.kernel;
  }
  if (body.os.logofile) {
    device.osLogoFile = body.os.logofile;
  }
  if (body.system.manufacturer) {
    device.systemManufacturer = body.system.manufacturer;
  }
  if (body.system.model) {
    device.systemModel = body.system.model;
  }
  if (body.system.version) {
    device.systemVersion = body.system.version;
  }
  if (body.system.uuid) {
    device.systemUuid = body.system.uuid;
  }
  if (body.system.sku) {
    device.systemSku = body.system.sku;
  }
  if (body.system.virtual) {
    device.systemVirtual = body.system.virtual;
  }
  if (body.cpu.brand) {
    device.cpuBrand = body.cpu.brand;
  }
  if (body.cpu.manufacturer) {
    device.cpuBrand = body.cpu.manufacturer;
  }
  if (body.cpu.family) {
    device.cpuFamily = body.cpu.family;
  }
  if (body.os.versionData) {
    device.versions = body.os.versionData;
  }
  device.status = DeviceStatus.ONLINE;
  await DeviceRepo.update(device);
  return device;
}

export default {
  updateDeviceFromJson,
};
