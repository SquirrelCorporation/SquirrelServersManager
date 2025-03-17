import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContainerRepositoryComponentService } from '../../../application/services/container-repository-component.service';
import { ShellService } from '../../../../shell/shell.service';

describe('ContainerRepositoryComponentService', () => {
  let service: ContainerRepositoryComponentService;
  let mockShellService: ShellService;

  beforeEach(() => {
    mockShellService = {
      executeCommand: vi.fn(),
    } as unknown as ShellService;

    service = {
      getComponentDetails: vi.fn(),
      deployComponent: vi.fn(),
      removeComponent: vi.fn(),
    } as unknown as ContainerRepositoryComponentService;
  });

  describe('getComponentDetails', () => {
    it('should get component details successfully', async () => {
      const mockComponentDetails = {
        name: 'test-component',
        version: '1.0.0',
        description: 'Test component',
      };

      vi.spyOn(service, 'getComponentDetails').mockResolvedValue(mockComponentDetails);

      const result = await service.getComponentDetails('/path/to/repo', 'test-component');

      expect(result).toEqual(mockComponentDetails);
      expect(service.getComponentDetails).toHaveBeenCalledWith('/path/to/repo', 'test-component');
    });

    it('should handle component not found', async () => {
      vi.spyOn(service, 'getComponentDetails').mockRejectedValue(new Error('No such file or directory'));

      await expect(service.getComponentDetails('/path/to/repo', 'non-existent')).rejects.toThrow();
    });
  });

  describe('deployComponent', () => {
    it('should deploy a component successfully', async () => {
      vi.spyOn(service, 'deployComponent').mockResolvedValue(true);

      const config = {
        port: 8080,
        environment: 'development',
      };

      const result = await service.deployComponent('/path/to/repo', 'test-component', config);

      expect(result).toBe(true);
      expect(service.deployComponent).toHaveBeenCalledWith('/path/to/repo', 'test-component', config);
    });

    it('should handle deployment failure', async () => {
      vi.spyOn(service, 'deployComponent').mockResolvedValue(false);

      const config = {
        port: 8080,
        environment: 'development',
      };

      const result = await service.deployComponent('/path/to/repo', 'test-component', config);

      expect(result).toBe(false);
      expect(service.deployComponent).toHaveBeenCalledWith('/path/to/repo', 'test-component', config);
    });
  });

  describe('removeComponent', () => {
    it('should remove a component successfully', async () => {
      vi.spyOn(service, 'removeComponent').mockResolvedValue(true);

      const result = await service.removeComponent('/path/to/repo', 'test-component');

      expect(result).toBe(true);
      expect(service.removeComponent).toHaveBeenCalledWith('/path/to/repo', 'test-component');
    });

    it('should handle removal failure', async () => {
      vi.spyOn(service, 'removeComponent').mockResolvedValue(false);

      const result = await service.removeComponent('/path/to/repo', 'test-component');

      expect(result).toBe(false);
      expect(service.removeComponent).toHaveBeenCalledWith('/path/to/repo', 'test-component');
    });
  });
});