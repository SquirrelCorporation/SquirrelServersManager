import { DateTime } from 'luxon';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import asyncHandler from '../../../middlewares/AsyncHandler';
import DashboardUseCase from '../../../use-cases/DashboardUseCase';
import DeviceDownTimeUseCases from '../../../use-cases/DeviceDownTimeUseCases';
import DeviceStatsUseCases from '../../../use-cases/DeviceStatsUseCases';

export const getDashboardPerformanceStats = asyncHandler(async (req, res) => {
  try {
    const result = await DashboardUseCase.getSystemPerformance();
    new SuccessResponse('Get dashboard performance stats', result).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getDashboardAvailabilityStats = asyncHandler(async (req, res) => {
  const { availability, lastMonth, byDevice } =
    await DeviceDownTimeUseCases.getDevicesAvailabilitySumUpCurrentMonthLastMonth();
  try {
    new SuccessResponse('Get dashboard availability stats', {
      availability: availability,
      lastMonth: lastMonth,
      byDevice: byDevice,
    }).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getDashboardAveragedStats = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const { devices } = req.body;
  const { type } = req.params;

  const devicesToQuery = await DeviceRepo.findByUuids(devices);
  if (!devicesToQuery || devicesToQuery.length !== devices.length) {
    throw new NotFoundError('Some devices were not found');
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
      type,
    );
    new SuccessResponse('Get dashboard averaged stats successful', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getDashboardStat = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const { devices } = req.body;
  const { type } = req.params;

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
      type,
    );
    new SuccessResponse('Get dashboard stat successful', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
