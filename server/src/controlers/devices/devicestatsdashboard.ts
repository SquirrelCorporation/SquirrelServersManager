import express from 'express';
import { DateTime } from 'luxon';
import DeviceRepo from '../../database/repository/DeviceRepo';
import Authentication from '../../middlewares/Authentication';
import DeviceStatsUseCases from '../../use-cases/DeviceStatsUseCases';
import logger from '../../logger';
import DeviceDownTimeUseCases from '../../use-cases/DeviceDownTimeUseCases';
import { getConfFromCache } from '../../redis';
import keys from '../../redis/defaults/keys';
import DashboardUseCase from '../../use-cases/DashboardUseCase';

const router = express.Router();

router.get(`/dashboard/stats/performances`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /dashboard/stats/performances`);
  try {
    const result = await DashboardUseCase.getSystemPerformance();
    res.send({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post(
  `/dashboard/stats/averaged/:type/`,
  Authentication.isAuthenticated,
  async (req, res) => {
    const { from, to } = req.query;
    const devices = req.body.devices;
    logger.info(`[CONTROLLER] - POST - /dashboard/stats/averaged/${req.params.type}`);
    if (!devices || !from || !to) {
      res.status(401).send({
        success: false,
      });
      return;
    }
    try {
      const devicesToQuery = await DeviceRepo.findByIds(devices);
      if (!devicesToQuery || devicesToQuery.length !== devices.length) {
        res.status(401).send({
          success: false,
        });
        return;
      }
      const fromDate = DateTime.fromJSDate(new Date((from as string).split('T')[0]))
        .endOf('day')
        .toJSDate();
      const toDate = DateTime.fromJSDate(new Date((to as string).split('T')[0]))
        .endOf('day')
        .toJSDate();
      const stats = await DeviceStatsUseCases.getSingleAveragedStatsByDevicesAndType(
        devicesToQuery,
        fromDate,
        toDate,
        req.params.type,
      );
      res.send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  },
);

router.get(`/dashboard/stats/availability`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /dashboard/stats/availability`);
  const { availability, lastMonth, byDevice } =
    await DeviceDownTimeUseCases.getDevicesAvailabilitySumUpCurrentMonthLastMonth();
  try {
    res.send({
      success: true,
      data: {
        availability: availability,
        lastMonth: lastMonth,
        byDevice: byDevice,
      },
    });
  } catch (error: any) {
    logger.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post(`/dashboard/stats/:type/`, Authentication.isAuthenticated, async (req, res) => {
  const { from, to } = req.query;
  const devices = req.body.devices;
  logger.info(`[CONTROLLER] - POST - /dashboard/stats/${req.params.type}`);
  if (!devices || !from || !to) {
    res.status(401).send({
      success: false,
    });
    return;
  }
  try {
    const devicesToQuery = await DeviceRepo.findByIds(devices);
    if (!devicesToQuery || devicesToQuery.length !== devices.length) {
      res.status(401).send({
        success: false,
      });
      return;
    }
    const fromDate = DateTime.fromJSDate(new Date((from as string).split('T')[0]))
      .endOf('day')
      .toJSDate();
    const toDate = DateTime.fromJSDate(new Date((to as string).split('T')[0]))
      .endOf('day')
      .toJSDate();
    const stats = await DeviceStatsUseCases.getStatsByDevicesAndType(
      devicesToQuery,
      fromDate,
      toDate,
      req.params.type,
    );
    res.send({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});
export default router;
