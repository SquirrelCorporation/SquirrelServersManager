import { DateTime } from 'luxon';
import DeviceDownTimeEventRepo from '../database/repository/DeviceDownTimeEventRepo';
import DeviceRepo from '../database/repository/DeviceRepo';
import logger from '../logger';

async function getDevicesAvailability(from: Date, to: Date) {
  logger.info(`[USECASES][DEVICEDOWNTIME] - getDevicesAvailability From:${from} - To:${to}`);
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

async function getDevicesAvailabilitySumUpCurrentMonthLastMonth() {
  try {
    logger.info(`[USECASES][DEVICEDOWNTIME] - getDevicesAvailabilitySumUpCurrentMonthLastMonth`);
    const to = new Date();
    const from = DateTime.now().startOf('month').toJSDate();
    const availabilities = await getDevicesAvailability(from, to);
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
  getDevicesAvailability,
  getDevicesAvailabilitySumUpCurrentMonthLastMonth,
};
