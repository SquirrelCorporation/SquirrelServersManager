import DeviceDownTimeEventRepo from '../database/repository/DeviceDownTimeEventRepo';
import DeviceRepo from '../database/repository/DeviceRepo';
import logger from '../logger';

async function getDevicesAvailability(from: Date, to: Date) {
  logger.info(`[USERCASES] - getDevicesAvailability From:${from} - To:${to}`);
  const devices = await DeviceRepo.findAll();
  if (!devices) {
    return;
  }
  const devicesDownTimeDuration = await DeviceDownTimeEventRepo.sumTotalDownTimePerDeviceOnPeriod(
    from,
    to,
  );
  const period = to.getTime() - from.getTime();
  return devices.map((device) => {
    const searchIndex = devicesDownTimeDuration.findIndex((downTime) => {
      return downTime._id.toString() === device._id.toString();
    });
    const downtime = searchIndex !== -1 ? devicesDownTimeDuration[searchIndex].duration : 0;
    const uptime = period - downtime;
    logger.debug(`Uptime : ${downtime} - DownTime: ${downtime}`);
    return {
      uuid: device.uuid,
      uptime: uptime,
      downtime: downtime,
      availability: (uptime / (uptime + downtime)).toFixed(6),
    };
  });
}

export default {
  getDevicesAvailability,
};
