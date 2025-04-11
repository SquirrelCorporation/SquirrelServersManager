import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';
import { GitPlaybooksRegisterComponent } from '@modules/playbooks/application/services/components/git-playbooks-register.component';
import { LocalPlaybooksRegisterComponent } from '@modules/playbooks/application/services/components/local-playbooks-repository.component';
import { PLAYBOOKS_REGISTER_ENGINE_EVENT } from '@modules/playbooks/constants';
import {
  GitComponentOptions,
  LocalComponentOptions,
} from '@modules/playbooks/doma../../domain/interfaces/component-options.interface';
import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Repositories, SsmGit } from 'ssm-shared-lib';
import { PlaybooksRegisterComponentFactory } from '../components/component-factory.service';
import { IVaultCryptoService } from '@modules/ansible-vaults/domain/interfaces/vault-crypto-service.interface';
import { DEFAULT_VAULT_ID } from '@modules/ansible-vaults/application/services/vault-crypto.service';
import { VAULT_CRYPTO_SERVICE } from '@modules/ansible-vaults';

/**
 * Service for managing playbooks repository components
 */
@Injectable()
export class PlaybooksRegisterEngineService {
  private readonly logger = new Logger(PlaybooksRegisterEngineService.name);
  private readonly components: Record<string, PlaybooksRegisterComponent> = {};

  constructor(
    @Inject(forwardRef(() => PlaybooksRegisterComponentFactory))
    private readonly componentFactory: PlaybooksRegisterComponentFactory,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultService: IVaultCryptoService,
  ) {}

  /**
   * Register a register component
   * @param register Register document to register
   */
  async registerRegister(register: IPlaybooksRegister): Promise<PlaybooksRegisterComponent | void> {
    try {
      this.logger.log(`Registering repository ${register.name} (${register.uuid})`);

      if (this.components[register.uuid]) {
        this.logger.log(`Repository ${register.name} already registered, skipping`);
        return;
      }

      let component: GitPlaybooksRegisterComponent | LocalPlaybooksRegisterComponent;

      if (register.type === Repositories.RepositoryType.GIT) {
        if (!register.accessToken) {
          throw new Error('Access token is required for Git repositories');
        }
        const options: GitComponentOptions = {
          uuid: register.uuid,
          name: register.name,
          branch: register.branch || 'main',
          email: register.email || 'squirrel@example.com',
          gitUserName: register.userName || 'Squirrel',
          accessToken:
            (await this.vaultService.decrypt(register.accessToken, DEFAULT_VAULT_ID)) || '',
          remoteUrl: register.remoteUrl || '',
          gitService: (register.gitService as SsmGit.Services) || SsmGit.Services.Github,
          ignoreSSLErrors: register.ignoreSSLErrors || false,
        };
        this.logger.log(`Creating git component ${JSON.stringify(options)}`);
        component = await this.componentFactory.createGitComponent(options);
      } else {
        if (!register.directory) {
          throw new Error('Directory is required for local repositories');
        }
        const options: LocalComponentOptions = {
          uuid: register.uuid,
          name: register.name,
          directory: register.directory,
        };
        this.logger.log(`Creating local component ${JSON.stringify(options)}`);

        component = await this.componentFactory.createLocalComponent(options);
      }

      // Register the component
      this.components[register.uuid] = component;

      this.logger.log(`Repository ${register.name} registered successfully`);
      return component;
    } catch (error: any) {
      this.logger.error(
        error,
        `Failed to register repository ${register.name}: ${error?.message || 'Unknown error'}`,
      );
      throw new Error(`Failed to register repository: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Deregister a repository component
   * @param repositoryUuid UUID of the repository to deregister
   */
  async deregisterRegister(registerUuid: string): Promise<void> {
    try {
      this.logger.log(`Deregistering repository ${registerUuid}`);

      const component = this.components[registerUuid];
      if (!component) {
        this.logger.log(`Repository ${registerUuid} not registered, skipping`);
        return;
      }

      // Delete the component
      await component.delete();

      // Remove from components map
      delete this.components[registerUuid];

      this.logger.log(`Repository ${registerUuid} deregistered successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to deregister repository ${registerUuid}: ${error?.message || 'Unknown error'}`,
      );
      throw new Error(`Failed to deregister repository: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a repository component
   * @param repositoryUuid UUID of the repository to get
   * @returns Repository component
   */
  getRepository(registerUuid: string): PlaybooksRegisterComponent | undefined {
    return this.components[registerUuid];
  }

  /**
   * Get all repository components
   * @returns Map of repository components
   */
  getState(): Record<string, PlaybooksRegisterComponent> {
    return this.components;
  }

  /**
   * Sync all repository components to the database
   */
  @OnEvent(PLAYBOOKS_REGISTER_ENGINE_EVENT.SYNC_ALL_REGISTERS)
  async syncAllRegisters(): Promise<void> {
    this.logger.log('Syncing all repository components to the database');
    await Promise.all(
      Object.values(this.components).map(async (component) => {
        await component.syncToDatabase();
      }),
    );
  }
}
