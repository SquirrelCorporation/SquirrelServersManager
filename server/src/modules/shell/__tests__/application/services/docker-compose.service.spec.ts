import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DockerComposeService } from '../../../application/services/docker-compose.service';
import { ShellWrapperService } from '../../../application/services/shell-wrapper.service';

describe('DockerComposeService', () => {
  let service: DockerComposeService;
  let shellWrapperService: ShellWrapperService;

  beforeEach(() => {
    shellWrapperService = {
      exec: vi.fn().mockReturnValue({ stdout: 'test output', code: 0 }),
    } as any;

    service = new DockerComposeService(shellWrapperService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('dockerComposeDryRun', () => {
    it('should execute the command and return the ShellString result', async () => {
      const mockResult = { stdout: 'test output', code: 0 };
      (shellWrapperService.exec as any).mockReturnValue(mockResult);
      
      const result = await service.dockerComposeDryRun('docker-compose up');
      
      expect(shellWrapperService.exec).toHaveBeenCalledWith('docker-compose up');
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if the command fails', async () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Command failed');
      });

      await expect(() => service.dockerComposeDryRun('docker-compose up'))
        .toThrow('Docker Compose command failed due to Error: Command failed');
        
      expect(shellWrapperService.exec).toHaveBeenCalledWith('docker-compose up');
    });
  });
});