import { body } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const loginValidator = [
  body('username')
    .exists()
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string')
    .isEmail()
    .withMessage('Username is not an email'),
  body('password')
    .exists()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string'),
  validator,
];
