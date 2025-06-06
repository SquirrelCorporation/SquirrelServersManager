import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ISmartFailureRepository } from '../../../domain/repositories/smart-failure.repository.interface';
// Import SmartFailureRepository after mocks
import { SmartFailureRepository } from '../../../infrastructure/repositories/smart-failure.repository';

// Mock modules
vi.mock('@modules/logs', () => ({
  ANSIBLE_LOGS_SERVICE: Symbol('ANSIBLE_LOGS_SERVICE'),
  IAnsibleLogsService: class IAnsibleLogsService {},
}));

describe('SmartFailureRepository', () => {
  let smartFailureRepository: ISmartFailureRepository;
  let mockAnsibleLogsService: any;

  beforeEach(() => {
    // Create mock for AnsibleLogsService
    mockAnsibleLogsService = {
      findAllByIdent: vi.fn(),
    };

    // Create repository instance with mock
    smartFailureRepository = new SmartFailureRepository(mockAnsibleLogsService);
  });

  it('should implement the ISmartFailureRepository interface', () => {
    expect(smartFailureRepository).toBeDefined();
    expect(typeof smartFailureRepository.findAllByIdent).toBe('function');
  });

  describe('findAllByIdent', () => {
    it('should call the logs service and return logs when found', async () => {
      // Setup
      const executionId = 'test-exec-id';
      const mockLogs = [
        { timestamp: '2025-01-01T12:00:00Z', message: 'Log 1', level: 'info' },
        { timestamp: '2025-01-01T12:01:00Z', message: 'Log 2', level: 'error' },
      ];

      mockAnsibleLogsService.findAllByIdent.mockResolvedValue(mockLogs);

      // Test
      const result = await smartFailureRepository.findAllByIdent(executionId);

      // Verify
      expect(mockAnsibleLogsService.findAllByIdent).toHaveBeenCalledWith(executionId);
      expect(result).toEqual(mockLogs);
    });

    it('should return undefined when no logs are found', async () => {
      // Setup
      const executionId = 'non-existent-id';
      mockAnsibleLogsService.findAllByIdent.mockResolvedValue(null);

      // Test
      const result = await smartFailureRepository.findAllByIdent(executionId);

      // Verify
      expect(mockAnsibleLogsService.findAllByIdent).toHaveBeenCalledWith(executionId);
      expect(result).toBeUndefined();
    });

    it('should return empty array when logs service returns empty array', async () => {
      // Setup
      const executionId = 'empty-logs-id';
      mockAnsibleLogsService.findAllByIdent.mockResolvedValue([]);

      // Test
      const result = await smartFailureRepository.findAllByIdent(executionId);

      // Verify
      expect(mockAnsibleLogsService.findAllByIdent).toHaveBeenCalledWith(executionId);
      expect(result).toEqual([]);
    });

    it('should handle various log formats', async () => {
      // Setup
      const executionId = 'mixed-formats-id';
      const mockLogs = [
        { timestamp: '2025-01-01T12:00:00Z', message: null, level: 'info', stdout: 'some output' },
        { timestamp: '2025-01-01T12:01:00Z', level: 'error' }, // missing message
        { message: 'Log 3', level: 'debug' }, // missing timestamp
        {}, // empty log entry
      ];

      mockAnsibleLogsService.findAllByIdent.mockResolvedValue(mockLogs);

      // Test
      const result = await smartFailureRepository.findAllByIdent(executionId);

      // Verify
      expect(mockAnsibleLogsService.findAllByIdent).toHaveBeenCalledWith(executionId);
      expect(result).toEqual(mockLogs);
    });

    it('should handle errors from logs service', async () => {
      // Setup
      const executionId = 'error-id';
      const mockError = new Error('Logs service error');
      mockAnsibleLogsService.findAllByIdent.mockRejectedValue(mockError);

      // Test & Verify
      await expect(smartFailureRepository.findAllByIdent(executionId)).rejects.toThrow(
        'Logs service error',
      );
      expect(mockAnsibleLogsService.findAllByIdent).toHaveBeenCalledWith(executionId);
    });

    it('should suggest a future enhancement to pass sort direction parameter', async () => {
      // This test documents a potential improvement rather than testing current behavior

      // Setup
      const executionId = 'test-exec-id';
      const mockLogs = [{ message: 'Log 1' }];

      mockAnsibleLogsService.findAllByIdent.mockResolvedValue(mockLogs);

      // Note: The ideal implementation would pass through a sort direction parameter:
      // this.logsService.findAllByIdent(execId, sortDirection);

      // Test current behavior
      await smartFailureRepository.findAllByIdent(executionId);

      // Verify current implementation calls logs service correctly
      expect(mockAnsibleLogsService.findAllByIdent).toHaveBeenCalledWith(executionId);

      // This is a documentation test to highlight a potential enhancement
      expect(true).toBe(true);
    });
  });
});
