import osu from 'node-os-utils'

type OSInfo = {
  type?: string;
  arch?: string;
  originalOsName?: string;
  platform?: string;
}

type CPUInfo = {
  usage?: number;
  free?: number;
  count?: number;
}

type DeviceInfo = {
  id: string;
  os?: OSInfo;
  ip?: string;
  uptime?: number;
  hostname?: string;
  mem?: osu.MemInfo;
  storage?: osu.DriveInfo;
  cpu?: CPUInfo;
}

export default async function getDeviceInfo(hostId : string) {
  let deviceInfo: DeviceInfo = {id : hostId};

  deviceInfo.os = {};

  try {
    deviceInfo.ip = osu.os.ip();
    deviceInfo.os.type = osu.os.type();
    deviceInfo.os.arch = osu.os.arch();
    deviceInfo.hostname = osu.os.hostname();
    deviceInfo.os.platform = osu.os.platform();
    deviceInfo.uptime = osu.os.uptime();
  } catch (e) {
    console.error(e);
  }

  try {
    // @ts-ignore
    osu.os.oos().then((name : string) => {
      // @ts-ignore
      deviceInfo.os.originalOsName = name;
    });
  } catch (e) {
    console.error(e);
  }

  try {
    await osu.drive.info("")
      .then((info: any) => {
        deviceInfo.storage = info;
      })
  } catch (e) {
    console.error(e);
  }

  deviceInfo.cpu = {};
  try {
    await osu.cpu.usage()
      .then((cpuPercentage: any) => {
        // @ts-ignore
        deviceInfo.cpu.usage = cpuPercentage;
      })
  } catch (e) {
    console.error(e);
  }

  try {
    await osu.mem.info()
      .then(info => {
        deviceInfo.mem = info;
      })
  } catch (e) {
    console.error(e);
  }
  console.log(JSON.stringify(deviceInfo));
  return deviceInfo;
}
