import { Ansible } from '../../../typings';
import logger from '../../../logger';

function transformExtraVars(extravars: Ansible.ExtraVars) {
  const stringifyObject = extravars
    .map((e) => {
      return `"${e.extravar}": "${e.value}"`;
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
