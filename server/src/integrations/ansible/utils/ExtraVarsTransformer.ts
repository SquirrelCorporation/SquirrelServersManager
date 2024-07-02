import { API } from 'ssm-shared-lib';
import logger from '../../../logger';

function transformExtraVars(extraVars: API.ExtraVars) {
  try {
    const stringifyObject = extraVars
      .map((e) => {
        return `"${e.extraVar}": "${e.value}"`;
      })
      .reduce((previousValue, currentValue) => {
        return previousValue + ',' + currentValue;
      });
    logger.debug(stringifyObject);
    return JSON.parse('{' + stringifyObject + '}');
  } catch (error: any) {
    throw new Error('Error during transformExtraVars');
  }
}

export default {
  transformExtraVars,
};
