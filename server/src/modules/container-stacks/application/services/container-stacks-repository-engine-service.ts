import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { DEFAULT_VAULT_ID, VaultCryptoService } from '@modules/ansible-vaults';
import { ContainerCustomStacksRepositoryRepository } from '../../infrastructure/repositories/container-custom-stacks-repository.repository';
import { ContainerCustomStackRepository } from '../../infrastructure/repositories/container-custom-stack.repository';
import { ShellWrapperService } from '../../../shell';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';
import { ContainerRepositoryComponentService } from './container-repository-component.service';
import { ContainerStacksService } from './container-stacks.service';

type StateType = {
  stackRepository: Record<string, ContainerRepositoryComponentService>;
};

@Injectable()
export class ContainerCustomStacksRepositoryEngineService {
  private readonly logger = new Logger(ContainerCustomStacksRepositoryEngineService.name);
  private readonly state: StateType = {
    stackRepository: {},
  };

  constructor(
    private readonly containerCustomStacksRepositoryRepository: ContainerCustomStacksRepositoryRepository,
    private readonly containerCustomStackRepository: ContainerCustomStackRepository,
    private readonly shellWrapperService: ShellWrapperService,
    @Inject(forwardRef(() => ContainerStacksService))
    private readonly containerStacksService: ContainerStacksService,
    private readonly vaultCryptoService: VaultCryptoService
  ) {}

  async init(): Promise<void> {
    this.logger.log('Initializing ContainerCustomStacksRepositoryEngineService');
    try {
      await this.registerRepositories();
    } catch (error) {
      this.logger.error('Error during initialization, your system may not be stable');
      this.logger.error(error instanceof Error ? error.message : String(error));
    }
  }

  getState(): StateType {
    return this.state;
  }

  private async createComponent(
    repository: IContainerCustomStackRepositoryEntity
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
      const result = await this.vaultCryptoService.decrypt(accessToken, DEFAULT_VAULT_ID);
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
      uuid: uuid || '',
      name: name || '',
      branch: branch || '',
      email: email || '',
      userName: userName || '',
      accessToken: decryptedAccessToken,
      remoteUrl: remoteUrl || '',
      gitService: gitService || null,
      ignoreSSLErrors: ignoreSSLErrors || false,
    });

    return component;
  }

  async registerRepository(repository: IContainerCustomStackRepositoryEntity): Promise<ContainerRepositoryComponentService> {
    this.logger.log(`Registering: ${repository.name}/${repository.uuid}`);

    const component = await this.createComponent(repository);
    this.state.stackRepository[repository.uuid] = component;

    return component;
  }

  async registerRepositories(): Promise<void> {
    this.logger.log('Registering repositories');
    const repositories = await this.containerCustomStacksRepositoryRepository.findAll();
    this.logger.log(`Found ${repositories?.length} repositories in database.`);

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
    this.logger.log(`syncAllRegistered, ${Object.keys(this.state.stackRepository).length} registered`);

    const syncPromises = Object.values(this.state.stackRepository).map(component => {
      return component.syncFromRepository();
    });

    await Promise.all(syncPromises);
  }
}