import { query } from 'express-validator';
import validator from '../../middlewares/validator';

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
  validator,
];
