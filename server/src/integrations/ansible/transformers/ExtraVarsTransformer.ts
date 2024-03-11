import { API } from 'ssm-shared-lib';
import logger from '../../../logger';

function transformExtraVars(extraVars: API.ExtraVars) {
  const stringifyObject = extraVars
    .map((e) => {
      return `"${e.extraVar}": "${e.value}"`;
    })
    .reduce((previousValue, currentValue) => {
      return previousValue + ',' + currentValue;
    });
  logger.info(stringifyObject);
  return JSON.parse('{' + stringifyObject + '}');
}

export default {
  transformExtraVars,
};
