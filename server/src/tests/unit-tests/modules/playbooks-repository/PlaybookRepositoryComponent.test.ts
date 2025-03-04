import { beforeEach, describe, expect, test, vi } from 'vitest';
import LocalPlaybooksRepositoryComponent from '../../../../modules/repository/components/subcomponents/LocalPlaybooksRepositoryComponent';
import PlaybooksRepositoryComponent from '../../../../modules/repository/components/PlaybooksRepositoryComponent';

describe('PlaybooksRepositoryComponent', () => {
  let playbooksRepositoryComponent: PlaybooksRepositoryComponent;

  beforeEach(() => {
    const logger = {
      child: () => {
        return { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      },
    };
    playbooksRepositoryComponent = new LocalPlaybooksRepositoryComponent(
      'uuid',
      logger,
      'name',
      'path',
    );
  });

  describe('fileBelongToRepository method', () => {
    test('returns true if the root of the file path matches the root of the repository directory', () => {
      const filePath = 'repository/file.ts';
      playbooksRepositoryComponent.directory = 'repository';
      const result = playbooksRepositoryComponent.fileBelongToRepository(filePath);

      expect(result).toBe(true);
    });

    test('returns false if the root of the file path does not match the root of the repository directory', () => {
      const filePath = 'another_repository/file.ts';
      playbooksRepositoryComponent.directory = 'repository';
      const result = playbooksRepositoryComponent.fileBelongToRepository(filePath);

      expect(result).toBe(false);
    });
  });
});
