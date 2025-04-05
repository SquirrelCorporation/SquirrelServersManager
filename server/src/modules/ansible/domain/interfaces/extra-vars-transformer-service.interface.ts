import { API } from 'ssm-shared-lib';

export const EXTRA_VARS_TRANSFORMER_SERVICE = 'EXTRA_VARS_TRANSFORMER_SERVICE';

/**
 * Interface for the Extra Vars Transformer Service
 */
export interface IExtraVarsTransformerService {
  /**
   * Transform extra vars into an object format compatible with Ansible
   * @param extraVars List of extra vars to transform
   * @returns Object with key-value pairs for Ansible
   */
  transformExtraVars(extraVars: API.ExtraVars): Record<string, string>;
}