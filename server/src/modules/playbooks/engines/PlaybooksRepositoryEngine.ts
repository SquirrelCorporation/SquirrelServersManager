import { ModuleRef } from '@nestjs/core';
import { PlaybooksRepositoryDocument } from '../schemas/playbooks-repository.schema';
import { PlaybooksRepositoryEngineService } from '../services/playbooks-repository-engine.service';
import { PlaybooksRepositoryComponent } from '../components/playbooks-repository.component';

/**
 * Bridge class for PlaybooksRepositoryEngine
 * This class provides backward compatibility with the old PlaybooksRepositoryEngine
 */
class PlaybooksRepositoryEngine {
  private static moduleRef: ModuleRef;
  private static service: PlaybooksRepositoryEngineService;

  /**
   * Set the ModuleRef for dependency injection
   * @param moduleRef ModuleRef instance
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    PlaybooksRepositoryEngine.moduleRef = moduleRef;
  }

  /**
   * Get the PlaybooksRepositoryEngineService instance
   * @returns PlaybooksRepositoryEngineService instance
   */
  private static getService(): PlaybooksRepositoryEngineService {
    if (!PlaybooksRepositoryEngine.moduleRef) {
      throw new Error('ModuleRef not set in PlaybooksRepositoryEngine');
    }

    if (!PlaybooksRepositoryEngine.service) {
      PlaybooksRepositoryEngine.service = PlaybooksRepositoryEngine.moduleRef.get(
        PlaybooksRepositoryEngineService,
        { strict: false },
      );
    }

    return PlaybooksRepositoryEngine.service;
  }

  /**
   * Return all registered repositories
   * @returns Record of repository UUID to repository component
   */
  static getState(): Record<string, PlaybooksRepositoryComponent> {
    return PlaybooksRepositoryEngine.getService().getState();
  }

  /**
   * Register a repository
   * @param playbookRepository Repository to register
   * @returns Repository component
   */
  static async registerRepository(playbookRepository: PlaybooksRepositoryDocument): Promise<void> {
     PlaybooksRepositoryEngine.getService().registerRepository(playbookRepository);
  }


  /**
   * Deregister a repository
   * @param uuid Repository UUID
   */
  static async deregisterRepository(uuid: string): Promise<void> {
    return PlaybooksRepositoryEngine.getService().deregisterRepository(uuid);
  }

}

export default PlaybooksRepositoryEngine;
