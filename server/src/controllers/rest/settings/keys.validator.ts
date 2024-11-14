import { body } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const postMasterNodeUrlValueValidator = [body('value').exists().isString(), validator];
