import { DateTime } from 'luxon';
import DeviceDownTimeEventRepo from '../data/database/repository/DeviceDownTimeEventRepo';
import DeviceRepo from '../data/database/repository/DeviceRepo';
import PinoLogger from '../logger';

const logger = PinoLogger.child(
  { module: 'DeviceDownTimeUseCases' },
  { msgPrefix: '[DEVICE_DOWN_TIME] - ' },
);

async function getDevicesAvailability(from: Date, to: Date) {
  logger.info(`getDevicesAvailability From:${from} - To:${to}`);
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
    logger.debug(`Period: ${period} - Uptime: ${uptime} - DownTime: ${downtime}`);
    return {
      uuid: device.uuid,
      uptime: uptime < 0 ? 0 : uptime,
      downtime: downtime > period ? period : downtime,
      availability: (uptime / (uptime + downtime)).toFixed(6),
    };
  });
}

async function getDevicesAvailabilitySumUpCurrentMonthLastMonth() {
  try {
    logger.info(`getDevicesAvailabilitySumUpCurrentMonthLastMonth`);
    const to = new Date();
    const from = DateTime.now().startOf('month').toJSDate();
    const availabilities = await getDevicesAvailability(from, to);
    logger.info(availabilities);
    const totalUptime = availabilities?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.uptime;
    }, 0);
    const totalDownTime = availabilities?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.downtime;
    }, 0);
    const fromLastMonth = DateTime.now().minus({ month: 1 }).startOf('month').toJSDate();
    const toLastMonth = DateTime.now().minus({ month: 1 }).endOf('month').toJSDate();
    const lastMonthAvailabilities = await getDevicesAvailability(fromLastMonth, toLastMonth);
    const lastMonthTotalUptime = lastMonthAvailabilities?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.uptime;
    }, 0);
    const LastMonthTotalDownTime = lastMonthAvailabilities?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.downtime;
    }, 0);
    return {
      availability:
        totalUptime !== undefined && totalDownTime !== undefined
          ? totalUptime / (totalUptime + totalDownTime)
          : undefined,
      lastMonth:
        lastMonthTotalUptime !== undefined && LastMonthTotalDownTime !== undefined
          ? lastMonthTotalUptime / (lastMonthTotalUptime + LastMonthTotalDownTime)
          : undefined,
      byDevice: availabilities,
    };
  } catch (error: any) {
    logger.error(error);
    return {};
  }
}

export default {
  getDevicesAvailabilitySumUpCurrentMonthLastMonth,
};
