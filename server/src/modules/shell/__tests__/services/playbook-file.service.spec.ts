import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaybookFileService } from '../../services/playbook-file.service';
import { ShellWrapperService } from '../../services/shell-wrapper.service';

describe('PlaybookFileService', () => {
  let service: PlaybookFileService;
  let mockShellWrapper: ShellWrapperService;

  // Setup mocks for shell commands
  const mockCatReturn = { toString: vi.fn().mockReturnValue('file content') };
  const mockTouch = vi.fn();
  const mockTo = vi.fn();
  const mockRm = vi.fn();
  const mockTest = vi.fn().mockReturnValue(true);

  beforeEach(() => {
    // Create mock shell wrapper
    mockShellWrapper = {
      cat: vi.fn().mockReturnValue(mockCatReturn),
      touch: mockTouch,
      to: mockTo,
      rm: mockRm,
      test: mockTest,
    } as unknown as ShellWrapperService;

    // Create service with mock shell wrapper
    service = new PlaybookFileService(mockShellWrapper);

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('readPlaybook', () => {
    it('should read a playbook file successfully', () => {
      // Arrange
      const path = '/path/to/playbook.yml';

      // Act
      const result = service.readPlaybook(path);

      // Assert
      expect(mockShellWrapper.cat).toHaveBeenCalledWith(path);
      expect(mockCatReturn.toString).toHaveBeenCalled();
      expect(result).toBe('file content');
    });

    it('should throw an error when reading fails', () => {
      // Arrange
      const path = '/path/to/playbook.yml';
      (mockShellWrapper.cat as any).mockImplementation(() => {
        throw new Error('File not found');
      });

      // Act & Assert
      expect(() => service.readPlaybook(path)).toThrow(
        'Reading playbook failed due to Error: File not found',
      );
      expect(mockShellWrapper.cat).toHaveBeenCalledWith(path);
    });
  });

  describe('editPlaybook', () => {
    it('should edit a playbook file successfully', () => {
      // Arrange
      const path = '/path/to/playbook.yml';
      const content = 'new content';

      // Act
      service.editPlaybook(content, path);

      // Assert
      expect(mockShellWrapper.to).toHaveBeenCalledWith(content, path);
    });

    it('should throw an error when editing fails', () => {
      // Arrange
      const path = '/path/to/playbook.yml';
      const content = 'new content';
      (mockShellWrapper.to as any).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // Act & Assert
      expect(() => service.editPlaybook(content, path)).toThrow(
        'Editing playbook failed due to Error: Permission denied',
      );
      expect(mockShellWrapper.to).toHaveBeenCalledWith(content, path);
    });
  });

  describe('newPlaybook', () => {
    it('should create a new playbook file successfully', () => {
      // Arrange
      const path = '/path/to/new-playbook.yml';

      // Act
      service.newPlaybook(path);

      // Assert
      expect(mockShellWrapper.touch).toHaveBeenCalledWith(path);
    });

    it('should throw an error when creation fails', () => {
      // Arrange
      const path = '/path/to/new-playbook.yml';
      (mockShellWrapper.touch as any).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // Act & Assert
      expect(() => service.newPlaybook(path)).toThrow(
        'Creating new playbook failed due to Error: Permission denied',
      );
      expect(mockShellWrapper.touch).toHaveBeenCalledWith(path);
    });
  });

  describe('deletePlaybook', () => {
    it('should delete a playbook file successfully', () => {
      // Arrange
      const path = '/path/to/playbook.yml';

      // Act
      service.deletePlaybook(path);

      // Assert
      expect(mockShellWrapper.rm).toHaveBeenCalledWith(path);
    });

    it('should throw an error when deletion fails', () => {
      // Arrange
      const path = '/path/to/playbook.yml';
      (mockShellWrapper.rm as any).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // Act & Assert
      expect(() => service.deletePlaybook(path)).toThrow(
        'Deleting playbook failed due to Error: Permission denied',
      );
      expect(mockShellWrapper.rm).toHaveBeenCalledWith(path);
    });
  });

  describe('testExistence', () => {
    it('should test if a playbook file exists successfully', () => {
      // Arrange
      const path = '/path/to/playbook.yml';

      // Act
      const result = service.testExistence(path);

      // Assert
      expect(mockShellWrapper.test).toHaveBeenCalledWith('-f', path);
      expect(result).toBe(true);
    });

    it('should throw an error when testing fails', () => {
      // Arrange
      const path = '/path/to/playbook.yml';
      (mockShellWrapper.test as any).mockImplementation(() => {
        throw new Error('File system error');
      });

      // Act & Assert
      expect(() => service.testExistence(path)).toThrow(
        'Testing playbook existence failed due to Error: File system error',
      );
      expect(mockShellWrapper.test).toHaveBeenCalledWith('-f', path);
    });
  });

  describe('readConfigIfExists', () => {
    it('should read a configuration file if it exists', () => {
      // Arrange
      const path = '/path/to/config.yml';
      // Mock the testExistence method directly to avoid calling the real implementation
      const testExistenceSpy = vi.spyOn(service, 'testExistence');
      testExistenceSpy.mockReturnValueOnce(true);

      // Act
      const result = service.readConfigIfExists(path);

      // Assert
      expect(testExistenceSpy).toHaveBeenCalledWith(path);
      expect(mockShellWrapper.cat).toHaveBeenCalledWith(path);
      expect(result).toBe('file content');
    });

    it('should return undefined if the configuration file does not exist', () => {
      // Arrange
      const path = '/path/to/config.yml';
      // Mock the testExistence method directly to avoid calling the real implementation
      const testExistenceSpy = vi.spyOn(service, 'testExistence');
      testExistenceSpy.mockReturnValueOnce(false);

      // Act
      const result = service.readConfigIfExists(path);

      // Assert
      expect(testExistenceSpy).toHaveBeenCalledWith(path);
      expect(mockShellWrapper.cat).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should throw an error when reading fails', () => {
      // Arrange
      const path = '/path/to/config.yml';
      // Mock the testExistence method directly to avoid calling the real implementation
      const testExistenceSpy = vi.spyOn(service, 'testExistence');
      testExistenceSpy.mockReturnValueOnce(true);

      (mockShellWrapper.cat as any).mockImplementation(() => {
        throw new Error('File not readable');
      });

      // Act & Assert
      expect(() => service.readConfigIfExists(path)).toThrow(
        'Reading playbook configuration failed due to Error: File not readable',
      );
      expect(testExistenceSpy).toHaveBeenCalledWith(path);
      expect(mockShellWrapper.cat).toHaveBeenCalledWith(path);
    });
  });
});
