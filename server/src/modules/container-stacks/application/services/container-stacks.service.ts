import { transformToDockerCompose } from '@infrastructure/common/docker/docker-compose-json-transformer.util';
import { IPlaybooksService, PLAYBOOKS_SERVICE } from '@modules/playbooks';
import {
  DOCKER_COMPOSE_SERVICE,
  FILE_SYSTEM_SERVICE,
  IDockerComposeService,
  IFileSystemService,
} from '@modules/shell';
import { IUser } from '@modules/users';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { API, SsmGit } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import {
  ContainerCustomStack,
  IContainerCustomStackRepositoryEntity,
} from '../../domain/entities/container-custom-stack.entity';
import { IContainerStacksService } from '../../domain/interfaces/container-stacks-service.interface';
import {
  CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY,
  IContainerCustomStackRepositoryRepository,
} from '../../domain/repositories/container-custom-stack-repository-repository.interface';
import {
  CONTAINER_CUSTOM_STACK_REPOSITORY,
  IContainerCustomStackRepository,
} from '../../domain/repositories/container-custom-stack-repository.interface';
import { ContainerCustomStacksRepositoryEngineService } from './container-stacks-repository-engine-service';
import { DEFAULT_VAULT_ID, VAULT_CRYPTO_SERVICE } from '@modules/ansible-vaults';
import { IVaultCryptoService } from '@modules/ansible-vaults';

@Injectable()
export class ContainerStacksService implements IContainerStacksService {
  private readonly logger = new Logger(ContainerStacksService.name);

  constructor(
    @Inject(CONTAINER_CUSTOM_STACK_REPOSITORY)
    private readonly containerCustomStackRepository: IContainerCustomStackRepository,
    @Inject(CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY)
    private readonly containerCustomStackRepositoryRepository: IContainerCustomStackRepositoryRepository,
    @Inject(forwardRef(() => ContainerCustomStacksRepositoryEngineService))
    private readonly containerCustomStacksRepositoryEngine: ContainerCustomStacksRepositoryEngineService,
    @Inject(FILE_SYSTEM_SERVICE)
    private readonly fileSystemService: IFileSystemService,
    @Inject(DOCKER_COMPOSE_SERVICE)
    private readonly dockerComposeService: IDockerComposeService,
    @Inject(PLAYBOOKS_SERVICE)
    private readonly playbooksService: IPlaybooksService,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultCryptoService: IVaultCryptoService,
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
      try {
        await this.registerRepository(repository);
      } catch (error) {
        this.logger.error(`Error registering repository: ${repository.name}/${repository.uuid}`);
        this.logger.error(error instanceof Error ? error.message : String(error));
      }
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
      this.logger.error(
        `Failed to delete repository: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  async putRepositoryOnError(repositoryUuid: string, error: unknown): Promise<void> {
    const repository =
      await this.containerCustomStackRepositoryRepository.findByUuid(repositoryUuid);
    if (!repository) {
      throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
    }
    repository.onError = true;
    repository.onErrorMessage = error instanceof Error ? error.message : String(error);
    await this.containerCustomStackRepositoryRepository.update(repository.uuid, repository);
  }

  async resetRepositoryError(repositoryUuid: string): Promise<void> {
    const repository =
      await this.containerCustomStackRepositoryRepository.findByUuid(repositoryUuid);
    if (!repository) {
      throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
    }
    repository.onError = false;
    repository.onErrorMessage = undefined;
    await this.containerCustomStackRepositoryRepository.update(repository.uuid, repository);
  }

  async transformStack(content: any) {
    const json = JSON.parse(content);
    return { yaml: transformToDockerCompose(json) };
  }

  async createStack(stack: ContainerCustomStack): Promise<ContainerCustomStack> {
    return this.containerCustomStackRepository.create(stack);
  }

  async updateStack(
    id: string,
    stack: Partial<ContainerCustomStack>,
  ): Promise<ContainerCustomStack> {
    return this.containerCustomStackRepository.update(id, stack);
  }

  async deleteStackByUuid(uuid: string): Promise<boolean> {
    return this.containerCustomStackRepository.deleteByUuid(uuid);
  }

  async dryRunStack(json: any, yaml: string) {
    const path = `/tmp/${uuidv4()}`;
    const fullFilePath = `${path}/docker-compose.yml`;

    // Create directory
    this.fileSystemService.createDirectory(path);

    // Write file
    if (json) {
      const transformedYaml = transformToDockerCompose(json);
      this.fileSystemService.writeFile(transformedYaml, fullFilePath);
    } else {
      this.fileSystemService.writeFile(yaml, fullFilePath);
    }

    // Run docker-compose config
    const result = this.dockerComposeService.dockerComposeDryRun(
      `docker-compose -f ${fullFilePath} config`,
    );

    if (result.code === 0) {
      return { validating: true };
    } else {
      return { validating: false, message: result.stderr };
    }
  }

  async deployStack(uuid: string, target: string, user: IUser) {
    const stack = await this.containerCustomStackRepository.findByUuid(uuid);
    if (!stack) {
      throw new Error(`Stack with UUID ${uuid} not found`);
    }

    const playbook = await this.playbooksService.getPlaybookByQuickReference('deploy');
    if (!playbook) {
      throw new Error(`Playbook 'deploy' not found`);
    }

    const execId = await this.playbooksService.executePlaybook(playbook, user, [target], [
      { extraVar: 'definition', value: stack.yaml },
      { extraVar: 'project', value: stack.name },
    ] as API.ExtraVars);

    return { execId };
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

  async createRepository(
    repository: IContainerCustomStackRepositoryEntity,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    if (!repository.accessToken) {
      throw new Error('Access token is required');
    }
    repository.accessToken = await this.vaultCryptoService.encrypt(
      repository.accessToken,
      DEFAULT_VAULT_ID,
    );
    return this.containerCustomStackRepositoryRepository.create(repository);
  }

  async updateRepository(
    uuid: string,
    repository: Partial<IContainerCustomStackRepositoryEntity>,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    if (!repository.accessToken) {
      throw new Error('Access token is required');
    }
    repository.accessToken = await this.vaultCryptoService.encrypt(
      repository.accessToken,
      DEFAULT_VAULT_ID,
    );
    const existingRepository = await this.containerCustomStackRepositoryRepository.findByUuid(uuid);
    if (!existingRepository) {
      throw new Error(`Repository with UUID ${uuid} not found`);
    }
    return this.containerCustomStackRepositoryRepository.update(uuid, repository);
  }

  async forcePullRepository(uuid: string): Promise<void> {
    return this.containerCustomStacksRepositoryEngine.forcePull(uuid);
  }

  async forceCloneRepository(uuid: string): Promise<void> {
    return this.containerCustomStacksRepositoryEngine.clone(uuid);
  }

  async forceRegisterRepository(uuid: string): Promise<void> {
    return this.containerCustomStacksRepositoryEngine.forceRegister(uuid);
  }

  async commitAndSyncRepository(uuid: string): Promise<void> {
    return this.containerCustomStacksRepositoryEngine.commitAndSync(uuid);
  }

  async syncToDatabaseRepository(uuid: string): Promise<void> {
    return this.containerCustomStacksRepositoryEngine.syncToDatabase(uuid);
  }
}
