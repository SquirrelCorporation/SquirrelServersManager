import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { SsmGit } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { ShellWrapperService } from '../../shell/services/shell-wrapper.service';
import { ContainerCustomStackRepository } from '../repositories/container-custom-stack.repository';
import { ContainerCustomStacksRepositoryRepository } from '../repositories/container-custom-stacks-repository.repository';
import { ContainerCustomStackRepositoryDocument } from '../schemas/container-custom-stack-repository.schema';
import { ContainerCustomStacksRepositoryEngineService } from './container-stacks-repository-engine-service';

@Injectable()
export class ContainerStacksService implements OnModuleInit {
  private readonly stackRepositories: Record<string, any> = {};

  constructor(
    private readonly shellWrapperService: ShellWrapperService,
    private readonly containerCustomStackRepository: ContainerCustomStackRepository,
    private readonly containerCustomStacksRepositoryRepository: ContainerCustomStacksRepositoryRepository,
    @Inject(forwardRef(() => ContainerCustomStacksRepositoryEngineService))
    private readonly containerCustomStacksRepositoryEngine: ContainerCustomStacksRepositoryEngineService,
  ) {
    this.initializeRepositories();
  }

  async onModuleInit() {
    await this.containerCustomStacksRepositoryEngine.init();
  }

  private async initializeRepositories(): Promise<void> {
    const repositories = await this.containerCustomStacksRepositoryRepository.findAllActive();
    for (const repository of repositories) {
      await this.registerRepository(repository);
    }
  }

  async registerRepository(repository: ContainerCustomStackRepositoryDocument): Promise<any> {
    try {
      return await this.containerCustomStacksRepositoryEngine.registerRepository(repository);
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
    const repository = await this.containerCustomStacksRepositoryRepository.create({
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
    const repository = await this.containerCustomStacksRepositoryRepository.findOneByUuid(uuid);
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

    await this.containerCustomStacksRepositoryRepository.update(repository);

    try {
      await this.registerRepository(repository);
      await this.containerCustomStacksRepositoryEngine.clone(uuid);
    } catch (error) {
      await this.putRepositoryOnError(uuid, error);
      throw error;
    }
  }

  async deleteRepository(repository: ContainerCustomStackRepositoryDocument): Promise<void> {
    await this.deregisterRepository(repository.uuid);
    await this.containerCustomStackRepository.deleteAllByRepository(repository);
    await this.containerCustomStacksRepositoryRepository.deleteByUuid(repository.uuid);
  }

  async putRepositoryOnError(repositoryUuid: string, error: unknown): Promise<void> {
    const repository = await this.containerCustomStacksRepositoryRepository.findOneByUuid(repositoryUuid);
    if (!repository) {
      throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
    }
    repository.onError = true;
    repository.onErrorMessage = error instanceof Error ? error.message : String(error);
    await this.containerCustomStacksRepositoryRepository.update(repository);
  }

  async resetRepositoryError(repositoryUuid: string): Promise<void> {
    const repository = await this.containerCustomStacksRepositoryRepository.findOneByUuid(repositoryUuid);
    if (!repository) {
      throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
    }
    repository.onError = false;
    repository.onErrorMessage = undefined;
    await this.containerCustomStacksRepositoryRepository.update(repository);
  }
}