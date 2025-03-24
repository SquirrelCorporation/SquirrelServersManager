import { Injectable, Logger } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { IExtraVarsTransformerService } from '@modules/ansible/application/interfaces/extra-vars-transformer-service.interface';
/**
 * Service for transforming extra vars into Ansible-compatible format
 */
@Injectable()
export class ExtraVarsTransformerService implements IExtraVarsTransformerService {
  private readonly logger = new Logger(ExtraVarsTransformerService.name);

  /**
   * Map an extra var to a key-value pair
   */
  private mapExtraVarToPair(extraVar: API.ExtraVar): [string, string] {
    return [extraVar.extraVar, extraVar.value || ''];
  }

  /**
   * Transform extra vars into an object format compatible with Ansible
   */
  transformExtraVars(extraVars: API.ExtraVars): Record<string, string> {
    try {
      const keyValuePairs = extraVars.map((extraVar) => this.mapExtraVarToPair(extraVar));
      const result = Object.fromEntries(keyValuePairs);
      this.logger.debug(`Transformed extra vars: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error during transformExtraVars: ${error}`);
      throw new Error('Error during transformExtraVars');
    }
  }
}
