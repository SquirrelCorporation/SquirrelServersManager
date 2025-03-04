import { ModuleRef } from '@nestjs/core';
import { Model } from 'mongoose';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { PlaybooksRepositoryDocument } from '../schemas/playbooks-repository.schema';
import { API } from 'ssm-shared-lib';

/**
 * Bridge class for backward compatibility with the old PlaybooksRepository
 * This class provides static methods that delegate to the PlaybooksRepositoryService
 */
export default class PlaybooksRepository {
  private static moduleRef: ModuleRef;
  private static service: PlaybooksRepositoryService;

  /**
   * Set the ModuleRef to allow access to the NestJS dependency injection container
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    PlaybooksRepository.moduleRef = moduleRef;
  }

  /**
   * Get the PlaybooksRepositoryService from the NestJS container
   * @returns PlaybooksRepositoryService instance
   */
  private static getService(): PlaybooksRepositoryService {
    if (!PlaybooksRepository.moduleRef) {
      throw new Error('ModuleRef not set in PlaybooksRepository');
    }

    if (!PlaybooksRepository.service) {
      PlaybooksRepository.service = PlaybooksRepository.moduleRef.get(PlaybooksRepositoryService, { strict: false });
    }

    return PlaybooksRepository.service;
  }

  /**
   * Get all playbooks repositories
   * @returns Array of playbooks repositories
   */
  static async getAllPlaybooksRepositories(): Promise<API.PlaybooksRepository[]> {
    return PlaybooksRepository.getService().getAllPlaybooksRepositories();
  }

  /**
   * Create a directory in a playbook repository
   * @param repository The repository to create the directory in
   * @param path The path of the directory to create
   * @returns Promise that resolves when the directory is created
   */
  static async createDirectoryInPlaybookRepository(
    repository: PlaybooksRepositoryDocument,
    path: string,
  ): Promise<void> {
    return PlaybooksRepository.getService().createDirectoryInPlaybookRepository(repository, path);
  }

  /**
   * Create a playbook in a repository
   * @param repository The repository to create the playbook in
   * @param path The path of the playbook
   * @param name The name of the playbook
   * @returns Promise that resolves with the created playbook
   */
  static async createPlaybookInRepository(
    repository: PlaybooksRepositoryDocument,
    path: string,
    name: string,
  ): Promise<any> {
    return PlaybooksRepository.getService().createPlaybookInRepository(repository, path, name);
  }

  /**
   * Delete a playbook from a repository
   * @param repository The repository to delete the playbook from
   * @param playbookUuid The UUID of the playbook to delete
   * @returns Promise that resolves when the playbook is deleted
   */
  static async deletePlaybookFromRepository(
    repository: PlaybooksRepositoryDocument,
    playbookUuid: string,
  ): Promise<void> {
    return PlaybooksRepository.getService().deletePlaybookFromRepository(repository, playbookUuid);
  }

  /**
   * Delete a directory from a repository
   * @param repository The repository to delete the directory from
   * @param path The path of the directory to delete
   * @returns Promise that resolves when the directory is deleted
   */
  static async deleteDirectoryFromRepository(
    repository: PlaybooksRepositoryDocument,
    path: string,
  ): Promise<void> {
    return PlaybooksRepository.getService().deleteDirectoryFromRepository(repository, path);
  }

  /**
   * Save a playbook
   * @param playbookUuid The UUID of the playbook to save
   * @param content The content of the playbook
   * @returns Promise that resolves when the playbook is saved
   */
  static async savePlaybook(playbookUuid: string, content: string): Promise<void> {
    return PlaybooksRepository.getService().savePlaybook(playbookUuid, content);
  }

  /**
   * Sync a repository
   * @param repositoryUuid The UUID of the repository to sync
   * @returns Promise that resolves when the repository is synced
   */
  static async syncRepository(repositoryUuid: string): Promise<void> {
    return PlaybooksRepository.getService().syncRepository(repositoryUuid);
  }
} 