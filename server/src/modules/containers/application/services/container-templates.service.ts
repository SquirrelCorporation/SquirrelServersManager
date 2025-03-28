import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { IUser } from '@modules/users';
import * as templatesRaw from '../../../../data/static/templates.json';
import { sortByFields } from '../../../../helpers/query/SorterHelper';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import DockerComposeHelper from '../../../../helpers/docker/DockerComposeHelper';
import { IContainerTemplatesService } from '../interfaces/container-templates-service.interface';
import { PLAYBOOK_REPOSITORY } from '../../../playbooks/domain/repositories/playbook-repository.interface';
import { PlaybookService } from '../../../playbooks/application/services/playbook.service';

/**
 * Service for managing container templates following clean architecture
 */
@Injectable()
export class ContainerTemplatesService implements IContainerTemplatesService {
  private readonly logger = new Logger(ContainerTemplatesService.name);

  constructor(
    private readonly playbookService: PlaybookService,
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: any,
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
  async deployTemplate(template: API.Template, user: IUser): Promise<string> {
    try {
      // Convert template to YAML
      const templateToYaml = DockerComposeHelper.fromJsonTemplateToYml(template);

      // Find the deploy playbook
      const playbook = await this.playbookRepository.findOneByName('deploy');
      if (!playbook) {
        throw new NotFoundException("Playbook 'deploy' not found");
      }

      if (!user) {
        throw new NotFoundException('No user');
      }

      // Execute the playbook
      const execId = await this.playbookService.executePlaybook(
        playbook,
        user,
        template.targets?.map((target) => target.id),
        [
          { extraVar: 'definition', value: templateToYaml },
          { extraVar: 'project', value: template.name },
        ],
      );

      return execId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to deploy template: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
