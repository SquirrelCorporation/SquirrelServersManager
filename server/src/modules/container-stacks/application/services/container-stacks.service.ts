import * as fs from 'fs';
import * as path from 'path';
import { Inject, Injectable, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import { SsmGit } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { ShellWrapperService } from '../../../shell';
import { transformToDockerCompose } from '../../../../helpers/docker/DockerComposeJSONTransformer';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { sortByFields } from '../../../../helpers/query/SorterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import { IContainerStacksService } from '../interfaces/container-stacks-service.interface';
import { ContainerCustomStack } from '../../domain/entities/container-custom-stack.entity';
import { CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY, IContainerCustomStackRepositoryRepository } from '../../domain/repositories/container-custom-stack-repository-repository.interface';
import { CONTAINER_CUSTOM_STACK_REPOSITORY, IContainerCustomStackRepository } from '../../domain/repositories/container-custom-stack-repository.interface';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';
import { ContainerCustomStacksRepositoryEngineService } from './container-stacks-repository-engine-service';

@Injectable()
export class ContainerStacksService implements IContainerStacksService, OnModuleInit {
  private readonly logger = new Logger(ContainerStacksService.name);

  constructor(
    private readonly shellWrapperService: ShellWrapperService,
    @Inject(CONTAINER_CUSTOM_STACK_REPOSITORY)
    private readonly containerCustomStackRepository: IContainerCustomStackRepository,
    @Inject(CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY)
    private readonly containerCustomStackRepositoryRepository: IContainerCustomStackRepositoryRepository,
    @Inject(forwardRef(() => ContainerCustomStacksRepositoryEngineService))
    private readonly containerCustomStacksRepositoryEngine: ContainerCustomStacksRepositoryEngineService,
  ) {
    this.initializeRepositories();
  }

  async onModuleInit() {
    this.logger.log('Initializing ContainerStacksService');
    await this.containerCustomStacksRepositoryEngine.init();
  }

  private async initializeRepositories(): Promise<void> {
    const repositories = await this.containerCustomStackRepositoryRepository.findAll();
    for (const repository of repositories) {
      await this.registerRepository(repository);
    }
  }

  async registerRepository(repository: IContainerCustomStackRepositoryEntity): Promise<any> {
    try {
      return await this.containerCustomStacksRepositoryEngine.registerRepository(repository as any);
    } catch (error) {
      await this.putRepositoryOnError(repository.uuid, error);
      throw error;
    }
  }

  async deregisterRepository(uuid: string): Promise<void> {
    await this.containerCustomStacksRepositoryEngine.deregisterRepository(uuid);
  }

  getState(): { stackRepository: Record<string, any> } {
    return this.containerCustomStacksRepositoryEngine.getState();
  }

  async addGitRepository(
    name: string,
    accessToken: string,
    branch: string,
    email: string,
    userName: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    matchesList?: string[],
    ignoreSSLErrors?: boolean,
  ): Promise<void> {
    const uuid = uuidv4();
    const repository = await this.containerCustomStackRepositoryRepository.create({
      uuid,
      name,
      accessToken,
      branch,
      email,
      userName,
      remoteUrl,
      gitService,
      matchesList,
      ignoreSSLErrors,
    });

    try {
      await this.registerRepository(repository);
      await this.containerCustomStacksRepositoryEngine.clone(uuid);
    } catch (error) {
      await this.putRepositoryOnError(uuid, error);
      throw error;
    }
  }

  async updateGitRepository(
    uuid: string,
    name: string,
    accessToken: string,
    branch: string,
    email: string,
    userName: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    matchesList?: string[],
    ignoreSSLErrors?: boolean,
  ): Promise<void> {
    const repository = await this.containerCustomStackRepositoryRepository.findByUuid(uuid);
    if (!repository) {
      throw new Error(`Repository with UUID ${uuid} not found`);
    }

    await this.deregisterRepository(uuid);

    repository.name = name;
    repository.accessToken = accessToken;
    repository.branch = branch;
    repository.email = email;
    repository.userName = userName;
    repository.remoteUrl = remoteUrl;
    repository.gitService = gitService;
    repository.matchesList = matchesList;
    repository.ignoreSSLErrors = ignoreSSLErrors;

    await this.containerCustomStackRepositoryRepository.update(repository.uuid, repository);

    try {
      await this.registerRepository(repository);
      await this.containerCustomStacksRepositoryEngine.clone(uuid);
    } catch (error) {
      await this.putRepositoryOnError(uuid, error);
      throw error;
    }
  }

  async deleteRepositoryByUuid(uuid: string): Promise<boolean> {
    try {
      await this.deregisterRepository(uuid);
      await this.containerCustomStackRepository.deleteByUuid(uuid);
      await this.containerCustomStackRepositoryRepository.deleteByUuid(uuid);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete repository: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  async putRepositoryOnError(repositoryUuid: string, error: unknown): Promise<void> {
    const repository = await this.containerCustomStackRepositoryRepository.findByUuid(repositoryUuid);
    if (!repository) {
      throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
    }
    repository.onError = true;
    repository.onErrorMessage = error instanceof Error ? error.message : String(error);
    await this.containerCustomStackRepositoryRepository.update(repository.uuid, repository);
  }

  async resetRepositoryError(repositoryUuid: string): Promise<void> {
    const repository = await this.containerCustomStackRepositoryRepository.findByUuid(repositoryUuid);
    if (!repository) {
      throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
    }
    repository.onError = false;
    repository.onErrorMessage = undefined;
    await this.containerCustomStackRepositoryRepository.update(repository.uuid, repository);
  }

  // New methods to support the container stacks controller

  async getStacks(params: any) {
    const customStacks = await this.containerCustomStackRepository.findAll();

    // Apply filtering, sorting, and pagination
    let dataSource = sortByFields(customStacks, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(dataSource, params, ['uuid', 'name']);

    return {
      data: dataSource,
      total: dataSource.length,
    };
  }

  async getPaginatedStacks(params: any, current: number, pageSize: number) {
    const { data, total } = await this.getStacks(params);

    const paginatedData = paginate(data, current, pageSize);

    return {
      data: paginatedData,
      total,
      pageSize,
      current,
    };
  }

  async transformStack(content: string) {
    const json = JSON.parse(content);
    return { yaml: transformToDockerCompose(json) };
  }

  async createStack(stack: ContainerCustomStack): Promise<ContainerCustomStack> {
    return this.containerCustomStackRepository.create(stack);
  }

  async updateStack(id: string, stack: Partial<ContainerCustomStack>): Promise<ContainerCustomStack> {
    return this.containerCustomStackRepository.update(id, stack);
  }

  async deleteStackByUuid(uuid: string): Promise<boolean> {
    return this.containerCustomStackRepository.deleteByUuid(uuid);
  }

  async dryRunStack(stackData: any) {
    const { json, yaml } = stackData;
    const tempPath = `/tmp/${uuidv4()}`;
    const fullFilePath = path.join(tempPath, 'docker-compose.yml');

    // Create directory
    fs.mkdirSync(tempPath, { recursive: true });

    // Write file
    if (json) {
      const transformedYaml = transformToDockerCompose(json);
      fs.writeFileSync(fullFilePath, transformedYaml);
    } else {
      fs.writeFileSync(fullFilePath, yaml);
    }

    // Run docker-compose config
    try {
      await this.shellWrapperService.exec(`docker-compose -f ${fullFilePath} config`);
      return { validating: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { validating: false, message: errorMessage };
    }
  }

  async deployStack(uuid: string, target: string, user: any) {
    const stack = await this.containerCustomStackRepository.findByUuid(uuid);
    if (!stack) {
      throw new Error(`Stack with UUID ${uuid} not found`);
    }

    // This would typically call a service to execute a playbook
    // For now, we'll just return a mock execution ID with the target info and user ID if available
    return {
      execId: uuidv4(),
      target,
      userId: user?.id || 'anonymous'
    };
  }

  async getAllStacks(): Promise<ContainerCustomStack[]> {
    return this.containerCustomStackRepository.findAll();
  }

  async getStackByUuid(uuid: string): Promise<ContainerCustomStack | null> {
    return this.containerCustomStackRepository.findByUuid(uuid);
  }

  async getAllRepositories(): Promise<IContainerCustomStackRepositoryEntity[]> {
    return this.containerCustomStackRepositoryRepository.findAll();
  }

  async getRepositoryByUuid(uuid: string): Promise<IContainerCustomStackRepositoryEntity | null> {
    return this.containerCustomStackRepositoryRepository.findByUuid(uuid);
  }

  async createRepository(repository: IContainerCustomStackRepositoryEntity): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerCustomStackRepositoryRepository.create(repository);
  }

  async updateRepository(uuid: string, repository: Partial<IContainerCustomStackRepositoryEntity>): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerCustomStackRepositoryRepository.update(uuid, repository);
  }
}