import { query } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const getSmartFailureValidator = [query('execId').exists().notEmpty().isUUID(), validator];
