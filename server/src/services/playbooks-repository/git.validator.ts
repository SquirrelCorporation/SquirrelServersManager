import { body, param } from 'express-validator';
import validator from '../../middlewares/validator';

export const addGitRepositoryValidator = [
  body('name').exists().isString().withMessage('Name is incorrect'),
  body('accessToken').exists().isString().withMessage('Access token is incorrect'),
  body('branch').exists().isString().withMessage('Branch is incorrect'),
  body('email').exists().isEmail().withMessage('Email is incorrect'),
  body('userName').exists().isString().withMessage('userName is incorrect'),
  body('remoteUrl').exists().isURL().withMessage('remoteUrl is incorrect'),
  validator,
];

export const updateGitRepositoryValidator = [
  param('uuid').exists().isString().isUUID().withMessage('Uuid is incorrect'),
  body('name').exists().isString().withMessage('Name is incorrect'),
  body('accessToken').exists().isString().withMessage('Access token is incorrect'),
  body('branch').exists().isString().withMessage('Branch is incorrect'),
  body('email').exists().isEmail().withMessage('Email is incorrect'),
  body('userName').exists().isString().withMessage('userName is incorrect'),
  body('remoteUrl').exists().isURL().withMessage('remoteUrl is incorrect'),
  validator,
];

export const genericGitRepositoryActionValidator = [
  param('uuid').exists().isString().withMessage('Uuid is incorrect'),
  validator,
];
