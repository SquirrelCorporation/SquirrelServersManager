import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DockerComposeService } from '../../../application/services/docker-compose.service';
import { ShellWrapperService } from '../../../application/services/shell-wrapper.service';

describe('DockerComposeService', () => {
  let service: DockerComposeService;
  let shellWrapperService: ShellWrapperService;

  beforeEach(() => {
    shellWrapperService = {
      exec: vi.fn().mockReturnValue({ stdout: 'test output' }),
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
    it('should execute the command and return stdout', async () => {
      const result = await service.dockerComposeDryRun('docker-compose up');
      expect(shellWrapperService.exec).toHaveBeenCalledWith('docker-compose up');
      expect(result).toBe('test output');
    });

    it('should throw an error if the command fails', async () => {
      vi.spyOn(shellWrapperService, 'exec').mockImplementation(() => {
        throw new Error('Command failed');
      });

      await expect(service.dockerComposeDryRun('docker-compose up')).rejects.toThrow(
        'Docker Compose command failed due to Error: Command failed'
      );
    });
  });
});