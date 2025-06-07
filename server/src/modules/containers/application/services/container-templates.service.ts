import { DockerComposeHelper } from '@infrastructure/common/docker/docker-compose.util';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import { IPlaybooksService, PLAYBOOKS_SERVICE } from '@modules/playbooks';
import { IUser } from '@modules/users';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import * as templatesRaw from '../../../../data/static/templates.json';
import { IContainerTemplatesService } from '../../domain/interfaces/container-templates-service.interface';

/**
 * Service for managing container templates following clean architecture
 */
@Injectable()
export class ContainerTemplatesService implements IContainerTemplatesService {
  private readonly logger = new Logger(ContainerTemplatesService.name);

  constructor(
    @Inject(PLAYBOOKS_SERVICE)
    private readonly playbooksService: IPlaybooksService,
  ) {}

  /**
   * Get all templates with pagination, sorting, and filtering
   * @param params Query parameters
   * @returns Templates with pagination metadata
   */
  async getTemplates(params: any) {
    try {
      const { current = 1, pageSize = 10 } = params;
      const templates = templatesRaw.templates;

      // Apply sorting and filtering
      let dataSource = sortByFields(templates, params);
      dataSource = filterByFields(dataSource, params);
      dataSource = filterByQueryParams(dataSource, params, ['description', 'title', 'categories']);

      // Get total count before pagination
      const totalBeforePaginate = dataSource?.length || 0;

      // Apply pagination
      dataSource = paginate(dataSource, current as number, pageSize as number);

      // Sort by name
      dataSource = dataSource.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      return {
        data: dataSource,
        pagination: {
          total: totalBeforePaginate,
          success: true,
          pageSize,
          current: parseInt(`${params.current}`, 10) || 1,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting templates: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Deploy a container template
   * @param template Template to deploy
   * @param user User deploying the template
   * @returns Execution ID
   */
  async deployTemplate(template: API.Template & API.Targets, user: IUser): Promise<string> {
    try {
      // Convert template to YAML
      const templateToYaml = DockerComposeHelper.fromJsonTemplateToYml(template);

      // Find the deploy playbook
      const playbook = await this.playbooksService.getPlaybookByQuickReference('deploy');
      if (!playbook) {
        throw new NotFoundException("Playbook 'deploy' not found");
      }

      if (!user) {
        throw new NotFoundException('No user');
      }

      // Execute the playbook
      const execId = await this.playbooksService.executePlaybook(playbook, user, template.targets, [
        { extraVar: 'definition', value: templateToYaml },
        { extraVar: 'project', value: template.name },
      ]);

      return execId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to deploy template: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
