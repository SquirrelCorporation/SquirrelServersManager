import { oneOf, param } from 'express-validator';
import { SsmStatus, StatsType } from 'ssm-shared-lib';
import validator from '../../middlewares/validator';

export const getContainerStatByContainerIdValidator = [
  param('id').exists().notEmpty().isString(),
  param('type').exists().notEmpty().isString().isIn(Object.values(StatsType.ContainerStatsType)),
  validator,
];

export const getContainerStatsByContainerIdValidator = [
  param('id').exists().notEmpty().isString(),
  param('type').exists().notEmpty().isString().isIn(Object.values(StatsType.ContainerStatsType)),
  validator,
];

export const getNbContainersByStatusValidator = [
  oneOf([
    param('status').exists().notEmpty().isString().isIn(Object.values(SsmStatus.ContainerStatus)),
    param('status').exists().notEmpty().isString().equals('all'),
  ]),
  validator,
];
