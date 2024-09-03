import { body } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const createFirstUserValidator = [
  body('email')
    .exists()
    .notEmpty()
    .withMessage('Email is required')
    .isString()
    .withMessage('Email must be a string')
    .isEmail()
    .withMessage('Email is not an email'),
  body('password')
    .exists()
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string'),
  body('name')
    .exists()
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),
  body('avatar').optional().isString().withMessage('avatar must be a string'),
  validator,
];
