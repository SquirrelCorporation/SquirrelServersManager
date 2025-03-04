import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../ansible-vault/ansible-vault';
import { ContainerCustomStacksRepositoryRepository } from '../repositories/container-custom-stacks-repository.repository';
import { ContainerCustomStackRepositoryDocument } from '../schemas/container-custom-stack-repository.schema';
import { ContainerCustomStackRepository } from '../repositories/container-custom-stack.repository';
import { ShellWrapperService } from '../../shell/services/shell-wrapper.service';
import { ContainerRepositoryComponentService } from './container-stacks-repository-component.service';
import { ContainerStacksService } from './container-stacks.service';

type StateType = {
  stackRepository: Record<string, ContainerRepositoryComponentService>;
};

@Injectable()
export class ContainerCustomStacksRepositoryEngineService {
  private readonly state: StateType = {
    stackRepository: {},
  };

  constructor(
    private readonly containerCustomStacksRepositoryRepository: ContainerCustomStacksRepositoryRepository,
    private readonly containerCustomStackRepository: ContainerCustomStackRepository,
    private readonly shellWrapperService: ShellWrapperService,
    @Inject(forwardRef(() => ContainerStacksService))
    private readonly containerStacksService: ContainerStacksService
  ) {}

  async init(): Promise<void> {
    try {
      await this.registerRepositories();
    } catch (error) {
      console.error('Error during initialization, your system may not be stable');
      console.error(error);
    }
  }

  getState(): StateType {
    return this.state;
  }

  private async createComponent(
    repository: ContainerCustomStackRepositoryDocument,
  ): Promise<ContainerRepositoryComponentService> {
    const {
      uuid,
      name,
      branch,
      email,
      userName,
      accessToken,
      remoteUrl,
      gitService,
      ignoreSSLErrors,
    } = repository;

    if (!accessToken) {
      throw new Error('accessToken is required');
    }

    let decryptedAccessToken = '';
    try {
      const result = await vaultDecrypt(accessToken, DEFAULT_VAULT_ID);
      if (!result) {
        throw new Error('Error decrypting access token');
      }
      decryptedAccessToken = result;
    } catch (error) {
      throw new Error(`Failed to decrypt access token: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Create a new component instance with all required dependencies
    const component = new ContainerRepositoryComponentService(
      this.shellWrapperService,
      this.containerCustomStackRepository,
      this.containerCustomStacksRepositoryRepository,
      this.containerStacksService
    );

    // Initialize it with the repository data
    component.initialize({
      uuid,
      name,
      branch,
      email,
      userName: userName,
      accessToken: decryptedAccessToken,
      remoteUrl,
      gitService,
      ignoreSSLErrors,
    });

    return component;
  }

  async registerRepository(repository: ContainerCustomStackRepositoryDocument): Promise<ContainerRepositoryComponentService> {
    console.log(`Registering: ${repository.name}/${repository.uuid}`);

    const component = await this.createComponent(repository);
    this.state.stackRepository[repository.uuid] = component;

    return component;
  }

  async registerRepositories(): Promise<void> {
    const repositories = await this.containerCustomStacksRepositoryRepository.findAllActive();
    console.log(`Found ${repositories?.length} active repositories in database.`);

    const registrationPromises = repositories.map(repo => this.registerRepository(repo));
    await Promise.all(registrationPromises);
  }

  async deregisterRepository(uuid: string): Promise<void> {
    const repository = this.state.stackRepository[uuid];
    if (!repository) {
      throw new Error('Repository not found');
    }

    delete this.state.stackRepository[uuid];
  }

  async clone(uuid: string): Promise<void> {
    const gitRepository = this.state.stackRepository[uuid];
    if (!gitRepository) {
      throw new Error("Repository not registered / doesn't exist");
    }

    await gitRepository.clone();
  }

  async syncAllRegistered(): Promise<void> {
    console.log(`syncAllRegistered, ${Object.keys(this.state.stackRepository).length} registered`);

    const syncPromises = Object.values(this.state.stackRepository).map(component => {
      return component.syncFromRepository();
    });

    await Promise.all(syncPromises);
  }
}