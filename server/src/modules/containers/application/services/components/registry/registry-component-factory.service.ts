import { Injectable } from '@nestjs/common';
import { IRegistryComponent, IRegistryComponentFactory } from '../../../../domain/components/registry.interface';
import { DockerHubRegistryComponent } from './docker-hub-registry.component';
import { CustomRegistryComponent } from './custom-registry.component';
import { GcrRegistryComponent } from './gcr-registry.component';
import { GhcrRegistryComponent } from './ghcr-registry.component';
import { AcrRegistryComponent } from './acr-registry.component';
import { EcrRegistryComponent } from './ecr-registry.component';
import { QuayRegistryComponent } from './quay-registry.component';
import { GitLabRegistryComponent } from './gitlab-registry.component';
import { GiteaRegistryComponent } from './gitea-registry.component';
import { ForgejoRegistryComponent } from './forgejo-registry.component';
import { LscrRegistryComponent } from './lscr-registry.component';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child({ module: 'RegistryComponentFactory' }, { msgPrefix: '[REGISTRY_FACTORY] - ' });

/**
 * Factory for creating registry components
 * Follows the playbooks module pattern
 */
@Injectable()
export class RegistryComponentFactory implements IRegistryComponentFactory {
  constructor(
    private readonly dockerHubRegistry: DockerHubRegistryComponent,
    private readonly customRegistry: CustomRegistryComponent,
    private readonly gcrRegistry: GcrRegistryComponent,
    private readonly ghcrRegistry: GhcrRegistryComponent,
    private readonly acrRegistry: AcrRegistryComponent,
    private readonly ecrRegistry: EcrRegistryComponent,
    private readonly quayRegistry: QuayRegistryComponent,
    private readonly gitlabRegistry: GitLabRegistryComponent,
    private readonly giteaRegistry: GiteaRegistryComponent,
    private readonly forgejoRegistry: ForgejoRegistryComponent,
    private readonly lscrRegistry: LscrRegistryComponent
  ) {}

  /**
   * Create a Docker Hub registry component
   */
  createDockerHubComponent(): IRegistryComponent {
    logger.info('Creating Docker Hub registry component');
    return this.dockerHubRegistry;
  }

  /**
   * Create a custom registry component
   */
  createCustomComponent(): IRegistryComponent {
    logger.info('Creating custom registry component');
    return this.customRegistry;
  }

  /**
   * Create a Google Container Registry component
   */
  createGcrComponent(): IRegistryComponent {
    logger.info('Creating GCR registry component');
    return this.gcrRegistry;
  }

  /**
   * Create a GitHub Container Registry component
   */
  createGhcrComponent(): IRegistryComponent {
    logger.info('Creating GHCR registry component');
    return this.ghcrRegistry;
  }

  /**
   * Create an Azure Container Registry component
   */
  createAcrComponent(): IRegistryComponent {
    logger.info('Creating ACR registry component');
    return this.acrRegistry;
  }

  /**
   * Create an Amazon ECR component
   */
  createEcrComponent(): IRegistryComponent {
    logger.info('Creating ECR registry component');
    return this.ecrRegistry;
  }

  /**
   * Create a Quay registry component
   */
  createQuayComponent(): IRegistryComponent {
    logger.info('Creating Quay registry component');
    return this.quayRegistry;
  }

  /**
   * Create a GitLab registry component
   */
  createGitLabComponent(): IRegistryComponent {
    logger.info('Creating GitLab registry component');
    return this.gitlabRegistry;
  }

  /**
   * Create a Gitea registry component
   */
  createGiteaComponent(): IRegistryComponent {
    logger.info('Creating Gitea registry component');
    return this.giteaRegistry;
  }

  /**
   * Create a Forgejo registry component
   */
  createForgejoComponent(): IRegistryComponent {
    logger.info('Creating Forgejo registry component');
    return this.forgejoRegistry;
  }

  /**
   * Create a Lineage OS Container Registry component
   */
  createLscrComponent(): IRegistryComponent {
    logger.info('Creating LSCR registry component');
    return this.lscrRegistry;
  }
}