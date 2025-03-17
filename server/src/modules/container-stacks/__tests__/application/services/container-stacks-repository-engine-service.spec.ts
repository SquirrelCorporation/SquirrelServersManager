import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContainerCustomStacksRepositoryEngineService } from '../../../application/services/container-stacks-repository-engine-service';
import { ShellService } from '../../../../shell/shell.service';

describe('ContainerCustomStacksRepositoryEngineService', () => {
  let service: ContainerCustomStacksRepositoryEngineService;
  let mockShellService: ShellService;

  beforeEach(() => {
    mockShellService = {
      executeCommand: vi.fn(),
    } as unknown as ShellService;

    service = new ContainerCustomStacksRepositoryEngineService(mockShellService);
  });

  describe('cloneRepository', () => {
    it('should clone a repository successfully', async () => {
      vi.spyOn(mockShellService, 'executeCommand').mockResolvedValue({
        stdout: 'Cloning into test-repo...\nDone.',
        stderr: '',
        exitCode: 0,
      });

      const result = await service.cloneRepository('https://github.com/test/repo.git', '/path/to/repo');
      
      expect(result).toBe(true);
      expect(mockShellService.executeCommand).toHaveBeenCalledWith(
        expect.stringContaining('git clone')
      );
    });

    it('should handle clone failure', async () => {
      vi.spyOn(mockShellService, 'executeCommand').mockResolvedValue({
        stdout: '',
        stderr: 'fatal: repository not found',
        exitCode: 128,
      });

      const result = await service.cloneRepository('https://github.com/test/repo.git', '/path/to/repo');
      
      expect(result).toBe(false);
    });
  });

  describe('pullRepository', () => {
    it('should pull a repository successfully', async () => {
      vi.spyOn(mockShellService, 'executeCommand').mockResolvedValue({
        stdout: 'Already up to date.',
        stderr: '',
        exitCode: 0,
      });

      const result = await service.pullRepository('/path/to/repo');
      
      expect(result).toBe(true);
      expect(mockShellService.executeCommand).toHaveBeenCalledWith(
        expect.stringContaining('git pull')
      );
    });

    it('should handle pull failure', async () => {
      vi.spyOn(mockShellService, 'executeCommand').mockResolvedValue({
        stdout: '',
        stderr: 'fatal: not a git repository',
        exitCode: 128,
      });

      const result = await service.pullRepository('/path/to/repo');
      
      expect(result).toBe(false);
    });
  });

  describe('getRepositoryComponents', () => {
    it('should get repository components successfully', async () => {
      vi.spyOn(mockShellService, 'executeCommand').mockResolvedValue({
        stdout: 'component1\ncomponent2\ncomponent3',
        stderr: '',
        exitCode: 0,
      });

      const result = await service.getRepositoryComponents('/path/to/repo');
      
      expect(result).toEqual(['component1', 'component2', 'component3']);
      expect(mockShellService.executeCommand).toHaveBeenCalledWith(
        expect.stringContaining('ls')
      );
    });

    it('should handle empty components list', async () => {
      vi.spyOn(mockShellService, 'executeCommand').mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      });

      const result = await service.getRepositoryComponents('/path/to/repo');
      
      expect(result).toEqual([]);
    });
  });
}); 