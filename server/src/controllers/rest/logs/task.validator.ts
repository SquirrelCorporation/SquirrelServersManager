import { param } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const getTaskEventsValidator = [param('id').exists().notEmpty().isUUID(), validator];
