import { DateTime } from 'luxon';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import DashboardUseCase from '../../use-cases/DashboardUseCase';
import DeviceDownTimeUseCases from '../../use-cases/DeviceDownTimeUseCases';
import DeviceStatsUseCases from '../../use-cases/DeviceStatsUseCases';

export const getDashboardPerformanceStats = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /dashboard/stats/performances`);
  try {
    const result = await DashboardUseCase.getSystemPerformance();
    new SuccessResponse('Get dashboard performance stats', result).send(res);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});

export const getDashboardAvailabilityStats = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /dashboard/stats/availability`);
  const { availability, lastMonth, byDevice } =
    await DeviceDownTimeUseCases.getDevicesAvailabilitySumUpCurrentMonthLastMonth();
  try {
    new SuccessResponse('Get dashboard availability stats', {
      availability: availability,
      lastMonth: lastMonth,
      byDevice: byDevice,
    }).send(res);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});

export const getDashboardAveragedStats = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const devices = req.body.devices;
  logger.info(`[CONTROLLER] - POST - /dashboard/stats/averaged/${req.params.type}`);
  if (!devices || !from || !to) {
    res.status(401).send({
      success: false,
    });
    return;
  }
  const devicesToQuery = await DeviceRepo.findByUuids(devices);
  if (!devicesToQuery || devicesToQuery.length !== devices.length) {
    throw new NotFoundError();
  }
  try {
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
    new SuccessResponse('Get dashboard averaged stats', stats).send(res);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});

export const getDashboardStat = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const devices = req.body.devices;
  logger.info(`[CONTROLLER] - POST - /dashboard/stats/${req.params.type}`);
  if (!devices || !from || !to) {
    res.status(401).send({
      success: false,
      message: 'Devices, from or to not specified',
    });
    return;
  }
  const devicesToQuery = await DeviceRepo.findByUuids(devices);
  if (!devicesToQuery || devicesToQuery.length !== devices.length) {
    throw new NotFoundError();
  }
  try {
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
    new SuccessResponse('Get dashboard stat', stats).send(res);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});
