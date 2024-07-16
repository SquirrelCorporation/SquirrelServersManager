import { body, query } from 'express-validator';
import validator from '../../middlewares/Validator';

export const getAnsibleGalaxyCollectionsValidator = [
  query('offset')
    .optional()
    .notEmpty()
    .isNumeric()
    .withMessage('offset query param needs to be numeric'),
  query('limit')
    .optional()
    .notEmpty()
    .isNumeric()
    .withMessage('limit query param needs to be numeric'),
  query('content').optional().notEmpty().isString(),
  query('namespace').optional().notEmpty().isString(),
  validator,
];

export const getAnsibleGalaxyCollectionValidator = [
  query('name').notEmpty().isString(),
  query('namespace').notEmpty().isString(),
  query('version').notEmpty().isString(),
  validator,
];

export const postInstallAnsibleGalaxyCollectionValidator = [
  body('name')
    .notEmpty()
    .isString()
    .matches(/^[\w.\-/]+$/),
  body('namespace')
    .notEmpty()
    .isString()
    .matches(/^[\w.\-/]+$/),
  validator,
];
