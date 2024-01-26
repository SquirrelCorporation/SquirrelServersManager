import si from 'systeminformation';
import osu from 'node-os-utils';
import logger from "../logger";
import {version} from '../../package.json';

export default async function getDeviceInfo(hostId : string) {
  let deviceInfo: API.DeviceInfo = {id : hostId, agentVersion: version};

  const valueObject = {
    cpu: '*',
    osInfo: '*',
    system: '*',
    versions: '*'
  }
  const systemInfo = await si.get(valueObject);
  try {
    deviceInfo.ip = osu.os.ip();
    deviceInfo.uptime = osu.os.uptime();
    deviceInfo.fqdn = systemInfo.osInfo.fqdn;
    deviceInfo.hostname = systemInfo.osInfo.hostname;
  } catch (e) {
    logger.error(e);
  }

  /*
  platform: 'darwin',
  distro: 'Mac OS X',
  release: '10.15.3',
  codename: 'macOS Catalina',
  kernel: '19.3.0',
  arch: 'x64',
  hostname: 'hostname.local',
  fqdn: 'hostname.local',
  codepage: 'UTF-8',
  logofile: 'apple',
  serial: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  build: '19D76',
  servicepack: '',
  uefi: true
   */
  deviceInfo.os = {};
  try {
    deviceInfo.os.platform = systemInfo.osInfo.platform;
    deviceInfo.os.distro = systemInfo.osInfo.distro;
    deviceInfo.os.codename = systemInfo.osInfo.codename;
    deviceInfo.os.kernel = systemInfo.osInfo.kernel;
    deviceInfo.os.arch = systemInfo.osInfo.arch;
    deviceInfo.os.logofile = systemInfo.osInfo.logofile;
    deviceInfo.os.versionData = systemInfo.versions;

  } catch (e) {
    logger.error(e);
  }

  /*
  manufacturer: 'Apple Inc.',
  model: 'MacBookPro13,2',
  version: '1.0',
  serial: 'C01xxxxxxxx',
  uuid: 'F87654-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  sku: 'Mac-99878xxxx...',
  virtual: false,
   */
  deviceInfo.system = {};
  try {
    deviceInfo.system.manufacturer = systemInfo.system.manufacturer;
    deviceInfo.system.model = systemInfo.system.model;
    deviceInfo.system.version = systemInfo.system.version;
    deviceInfo.system.uuid = systemInfo.system.uuid;
    deviceInfo.system.sku = systemInfo.system.sku;
    deviceInfo.system.virtual = systemInfo.system.virtual;
    deviceInfo.system.raspberry = systemInfo.system.raspberry;
  } catch (e) {
    logger.error(e);
  }

  /*
    manufacturer: 'Intel®',
    brand: 'Core™ i9-9900',
    vendor: 'GenuineIntel',
    family: '6',
    model: '158',
    stepping: '13',
    revision: '',
    voltage: '',
    speed: 3.1,
    speedMin: 0.8,
    speedMax: 5,
    governor: 'powersave',
    cores: 16,
    physicalCores: 8,
    processors: 1,
    socket: 'LGA1151',
    flags: 'fpu vme de pse ...',
    virtualization: true,
    cache: { l1d: 262144, l1i: 262144, l2: 2097152, l3: 16777216 }
   */
  deviceInfo.cpu = {};
  try {
    deviceInfo.cpu.usage = await osu.cpu.usage();
    deviceInfo.cpu.free = await osu.cpu.free();
    deviceInfo.cpu.count = osu.cpu.count();
    deviceInfo.cpu.brand = systemInfo.cpu.brand;
    deviceInfo.cpu.manufacturer = systemInfo.cpu.manufacturer;
    deviceInfo.cpu.family = systemInfo.cpu.family;
    deviceInfo.cpu.speed = systemInfo.cpu.speed;
    deviceInfo.cpu.cores = systemInfo.cpu.cores;
    deviceInfo.cpu.physicalCores = systemInfo.cpu.physicalCores;
    deviceInfo.cpu.processors = systemInfo.cpu.processors;
  } catch (e) {
    logger.error(e);
  }

  deviceInfo.storage = {};
  try {
    const osuDriveInfo = await osu.drive.info("");
    deviceInfo.storage.storageFreePercentage = osuDriveInfo.freePercentage;
    deviceInfo.storage.storageUsedPercentage = osuDriveInfo.usedPercentage;
    deviceInfo.storage.storageTotalGb = osuDriveInfo.totalGb;
    deviceInfo.storage.storageFreeGb = osuDriveInfo.freeGb;
    deviceInfo.storage.storageUsedGb = osuDriveInfo.usedGb;
  } catch (e) {
    logger.error(e);
  }

  deviceInfo.mem = {};
  try {
    const osuMemInfo = await osu.mem.info();
    deviceInfo.mem.memFreePercentage = osuMemInfo.freeMemPercentage;
    deviceInfo.mem.memUsedPercentage = osuMemInfo.usedMemPercentage;
    deviceInfo.mem.memTotalMb = osuMemInfo.totalMemMb;
    deviceInfo.mem.memTotalFreeMb = osuMemInfo.freeMemMb;
    deviceInfo.mem.memTotalUsedMb = osuMemInfo.usedMemMb;
  } catch (e) {
    logger.error(e);
  }

  logger.debug(deviceInfo);
  return deviceInfo;
}
