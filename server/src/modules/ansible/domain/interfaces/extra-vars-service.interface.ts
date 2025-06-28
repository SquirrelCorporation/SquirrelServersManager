import { API } from 'ssm-shared-lib';

export const EXTRA_VARS_SERVICE = 'EXTRA_VARS_SERVICE';

/**
 * Interface for the Extra Vars Service
 */
export interface IExtraVarsService {
  /**
   * Find values for a list of extra vars
   * @param extraVars List of extra vars to find values for
   * @param forcedValues Forced values for specific extra vars
   * @param emptySubstitute Allow empty values as substitutes
   * @param targets Target devices for context variables
   * @returns Extra vars with substituted values
   */
  findValueOfExtraVars(
    extraVars: API.ExtraVars,
    forcedValues?: API.ExtraVars,
    emptySubstitute?: boolean,
    targets?: string[],
  ): Promise<API.ExtraVars>;
}
