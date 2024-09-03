import { body } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const setUserLoglevelValidator = [
  body('terminal').notEmpty().isNumeric().withMessage('Terminal is required'),
  validator,
];
