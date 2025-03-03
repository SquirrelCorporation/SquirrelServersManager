import { ModuleRef } from '@nestjs/core';
import { API } from 'ssm-shared-lib';
import { ExtraVarsService } from '../services/extra-vars.service';

/**
 * This is a bridge class that provides a static interface to the ExtraVarsService
 * for backward compatibility with existing code.
 */
class ExtraVars {
  private static extraVarsService: ExtraVarsService;
  private static moduleRef: ModuleRef;

  /**
   * Set the ModuleRef to allow access to the NestJS dependency injection container
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    ExtraVars.moduleRef = moduleRef;
  }

  /**
   * Get the ExtraVarsService instance
   */
  private static getService(): ExtraVarsService {
    if (!ExtraVars.extraVarsService) {
      if (!ExtraVars.moduleRef) {
        throw new Error('ModuleRef not set in ExtraVars');
      }
      ExtraVars.extraVarsService = ExtraVars.moduleRef.get(ExtraVarsService, { strict: false });
    }
    return ExtraVars.extraVarsService;
  }

  /**
   * Find values for a list of extra vars
   */
  static async findValueOfExtraVars(
    extraVars: API.ExtraVars,
    forcedValues?: API.ExtraVars,
    emptySubstitute?: boolean,
    targets?: string[],
  ): Promise<API.ExtraVars> {
    return ExtraVars.getService().findValueOfExtraVars(
      extraVars,
      forcedValues,
      emptySubstitute,
      targets,
    );
  }
}

export default ExtraVars;
