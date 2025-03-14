import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitPlaybooksRegisterComponent } from '../../../../application/services/components/git-playbooks-register.component';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { PlaybookRepository } from '../../../../infrastructure/repositories/playbook.repository';
import { PlaybooksRegisterRepository } from '../../../../infrastructure/repositories/playbooks-register.repository';
import { Logger } from '@nestjs/common';
import { SsmGit } from 'ssm-shared-lib';
import { InternalError } from '../../../../../../middlewares/api/ApiError';
import Events from '../../../../../../core/events/events';

// Mock the git helpers
vi.mock('src/helpers/git', () => ({
  clone: vi.fn().mockResolvedValue(undefined),
  forcePull: vi.fn().mockResolvedValue(undefined),
  commitAndSync: vi.fn().mockResolvedValue(undefined),
}));

import { clone, forcePull, commitAndSync } from 'src/helpers/git';

describe('GitPlaybooksRegisterComponent', () => {
  let component: GitPlaybooksRegisterComponent;
  let mockFileSystemService: any;
  let mockPlaybookFileService: any;
  let mockPlaybookRepository: any;
  let mockPlaybooksRegisterRepository: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockFileSystemService = {
      createDirectory: vi.fn().mockResolvedValue(undefined),
      deleteFiles: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybookFileService = {
      newPlaybook: vi.fn().mockResolvedValue(undefined),
      deletePlaybook: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybookRepository = {
      findOneByUuid: vi.fn().mockResolvedValue({}),
      updateOrCreate: vi.fn().mockResolvedValue({}),
    };

    mockPlaybooksRegisterRepository = {
      findByUuid: vi.fn().mockResolvedValue({
        uuid: 'git-123',
        name: 'Git Repository',
      }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    component = new GitPlaybooksRegisterComponent(
      mockFileSystemService,
      mockPlaybookFileService,
      mockPlaybookRepository,
      mockPlaybooksRegisterRepository,
      mockEventEmitter,
      'git-123',
      Logger,
      'Git Repository',
      'main',
      'user@example.com',
      'username',
      'token123',
      'https://github.com/example/repo.git',
      SsmGit.Services.Github,
      false
    );

    // Mock syncToDatabase method
    vi.spyOn(component, 'syncToDatabase').mockResolvedValue(5);
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  describe('init', () => {
    it('should initialize the component by cloning the git repository', async () => {
      await component.init();
      expect(clone).toHaveBeenCalled();
    });
  });

  describe('syncFromRepository', () => {
    it('should sync from remote repository by force pulling', async () => {
      await component.syncFromRepository();
      expect(forcePull).toHaveBeenCalled();
    });
  });

  describe('forcePull', () => {
    it('should force pull the git repository', async () => {
      await component.forcePull();
      expect(forcePull).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        Events.ALERT,
        expect.objectContaining({
          message: expect.stringContaining('Successfully forcepull repository Git Repository'),
        })
      );
    });

    it('should throw InternalError when force pull fails', async () => {
      vi.mocked(forcePull).mockRejectedValueOnce(new Error('Force pull error'));
      await expect(component.forcePull()).rejects.toThrow(InternalError);
    });
  });

  describe('clone', () => {
    it('should clone the git repository', async () => {
      await component.clone();
      expect(mockFileSystemService.createDirectory).toHaveBeenCalled();
      expect(clone).toHaveBeenCalled();
    });

    it('should sync to database after cloning when syncAfter is true', async () => {
      await component.clone(true);
      expect(clone).toHaveBeenCalled();
      expect(component.syncToDatabase).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        Events.ALERT,
        expect.objectContaining({
          message: expect.stringContaining('Successfully updated repository Git Repository with 5 files'),
        })
      );
    });

    it('should handle directory creation errors', async () => {
      mockFileSystemService.createDirectory.mockRejectedValueOnce(new Error('Directory creation error'));
      await component.clone();
      // Should not throw and continue with clone
      expect(clone).toHaveBeenCalled();
    });

    it('should throw InternalError when clone fails', async () => {
      vi.mocked(clone).mockRejectedValueOnce(new Error('Clone error'));
      await expect(component.clone()).rejects.toThrow(InternalError);
    });
  });

  describe('commitAndSync', () => {
    it('should commit and sync the git repository', async () => {
      await component.commitAndSync();
      expect(commitAndSync).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        Events.ALERT,
        expect.objectContaining({
          message: expect.stringContaining('Successfully commit and sync repository Git Repository'),
        })
      );
    });

    it('should throw InternalError when commitAndSync fails', async () => {
      vi.mocked(commitAndSync).mockRejectedValueOnce(new Error('Commit and sync error'));
      await expect(component.commitAndSync()).rejects.toThrow(InternalError);
    });
  });
});