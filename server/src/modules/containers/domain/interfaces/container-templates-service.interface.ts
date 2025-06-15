import { IUser } from '@modules/users';

export const CONTAINER_TEMPLATES_SERVICE = 'CONTAINER_TEMPLATES_SERVICE';

/**
 * Interface for the Container Templates Service
 */
export interface IContainerTemplatesService {
  /**
   * Get all templates with pagination, sorting, and filtering
   * @param params Query parameters
   * @returns Templates with pagination metadata
   */
  getTemplates(params: any): Promise<{
    data: any[];
    pagination: {
      total: number;
      success: boolean;
      pageSize: number;
      current: number;
    };
  }>;

  /**
   * Deploy a container template
   * @param template Template to deploy
   * @param user User deploying the template
   * @returns Execution ID
   */
  deployTemplate(template: any, user: IUser): Promise<string>;
}
