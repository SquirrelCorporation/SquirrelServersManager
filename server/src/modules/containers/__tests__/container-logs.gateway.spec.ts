import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { DateTime } from 'luxon';
import { ContainerLogsService } from '../services/container-logs.service';
import { ContainerLogsGateway } from '../gateways/container-logs.gateway';

describe('ContainerLogsGateway', () => {
  let gateway: ContainerLogsGateway;
  let containerLogsService: ContainerLogsService;

  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
  } as unknown as Socket;

  const mockContainer = {
    id: 'container-id',
    watcher: 'docker-watcher',
  };

  const mockDockerComponent = {
    getContainerLiveLogs: vi.fn().mockReturnValue(() => {}),
  };

  beforeEach(() => {
    containerLogsService = {
      findContainerById: vi.fn().mockResolvedValue(mockContainer),
      findRegisteredComponent: vi.fn().mockResolvedValue(mockDockerComponent),
    } as unknown as ContainerLogsService;

    gateway = new ContainerLogsGateway(containerLogsService);

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleGetLogs', () => {
    it('should return OK status when container logs are successfully retrieved', async () => {
      const payload = { containerId: 'container-id', from: DateTime.now().toUnixInteger() };

      const result = await gateway.handleGetLogs(payload, mockSocket);

      expect(result).toEqual({
        event: SsmEvents.Logs.GET_LOGS,
        data: { status: 'OK' },
      });
      expect(containerLogsService.findContainerById).toHaveBeenCalledWith(payload.containerId);
      expect(containerLogsService.findRegisteredComponent).toHaveBeenCalledWith(mockContainer.watcher);
      expect(mockDockerComponent.getContainerLiveLogs).toHaveBeenCalled();
      expect(mockSocket.on).toHaveBeenCalledTimes(2);
      expect(mockSocket.emit).toHaveBeenCalled();
    });

    it('should return Bad Request when container is not found', async () => {
      (containerLogsService.findContainerById as any).mockResolvedValueOnce(null);

      const payload = { containerId: 'non-existent-id' };

      const result = await gateway.handleGetLogs(payload, mockSocket);

      expect(result).toEqual({
        event: SsmEvents.Logs.GET_LOGS,
        data: { status: 'Bad Request', error: `Container Id ${payload.containerId} not found` },
      });
    });

    it('should return Bad Request when watcher component is not registered', async () => {
      (containerLogsService.findRegisteredComponent as any).mockResolvedValueOnce(undefined);

      const payload = { containerId: 'container-id' };

      const result = await gateway.handleGetLogs(payload, mockSocket);

      expect(result).toEqual({
        event: SsmEvents.Logs.GET_LOGS,
        data: { status: 'Bad Request', error: `Watcher is not registered: ${mockContainer.watcher}` },
      });
    });
  });
});