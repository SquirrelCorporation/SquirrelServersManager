import { param } from 'express-validator';
import { ContainerStatsType } from 'ssm-shared-lib/distribution/enums/stats';
import validator from '../../middlewares/validator';

export const getContainerStatByContainerIdValidator = [
  param('id').exists().notEmpty().isString(),
  param('type').exists().notEmpty().isString().isIn(Object.values(ContainerStatsType)),
  validator,
];

export const getContainerStatsByContainerIdValidator = [
  param('id').exists().notEmpty().isString(),
  param('type').exists().notEmpty().isString().isIn(Object.values(ContainerStatsType)),
  validator,
];
