/**
 * @deprecated This service is deprecated and will be removed in a future version.
 * Please use the new ContainerTemplatesService in application/services/container-templates.service.ts
 */

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import * as templatesRaw from '../../../data/static/templates.json';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import DockerComposeHelper from '../../../helpers/docker/DockerComposeHelper';
import { PlaybookService } from '../../playbooks/services/playbook.service';
import { PlaybookRepository } from '../../playbooks/repositories/playbook.repository';
import { TemplateDeployDto } from '../dto/container-templates.dto';
import { CONTAINER_TEMPLATES_SERVICE } from '../application/interfaces/container-templates-service.interface';
import { IContainerTemplatesService } from '../application/interfaces/container-templates-service.interface';

/**
 * Service for managing container templates
 */
@Injectable()
export class ContainerTemplatesService {
  private readonly logger = new Logger(ContainerTemplatesService.name);

  constructor(
    private readonly playbookService: PlaybookService,
    private readonly playbookRepository: PlaybookRepository,
    @Inject(CONTAINER_TEMPLATES_SERVICE)
    private readonly newTemplatesService: IContainerTemplatesService,
  ) {}

  /**
   * Get all templates with pagination, sorting, and filtering
   * @param params Query parameters
   * @returns Templates with pagination metadata
   * @deprecated Use the new ContainerTemplatesService
   */
  async getTemplates(params: any) {
    this.logger.warn(`Method getTemplates is deprecated. Please use the new ContainerTemplatesService.`);
    return this.newTemplatesService.getTemplates(params);
  }

  /**
   * Deploy a container template
   * @param template Template to deploy
   * @param user User deploying the template
   * @returns Execution ID
   * @deprecated Use the new ContainerTemplatesService
   */
  async deployTemplate(template: TemplateDeployDto, user: any) {
    this.logger.warn(`Method deployTemplate is deprecated. Please use the new ContainerTemplatesService.`);
    return this.newTemplatesService.deployTemplate(template, user);
  }
}