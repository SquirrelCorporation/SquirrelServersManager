import { API } from 'ssm-shared-lib';
import logger from '../../../logger';

const mapExtraVarToPair = (extraVar: API.ExtraVar): [string, string] => [
  extraVar.extraVar,
  extraVar.value || '',
];

function transformExtraVars(extraVars: API.ExtraVars) {
  try {
    const keyValuePairs = extraVars.map(mapExtraVarToPair);
  const result = Object.fromEntries(keyValuePairs);
  logger.debug(JSON.stringify(result));
  return result;
  } catch (error: any) {
    throw new Error('Error during transformExtraVars');
  }
}

export default {
  transformExtraVars,
};
