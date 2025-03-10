import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ISshTerminalService } from '../../application/interfaces/ssh-terminal-service.interface';
import { SshTerminalService } from '../../application/services/ssh-terminal.service';
import { ScreenResizeDto, SshSessionDto } from '../../presentation/dtos/ssh-session.dto';
import { SshGateway } from '../../presentation/gateways/ssh.gateway';

// Define missing event constants if they don't exist in SsmEvents
if (!SsmEvents.SSH) {
  (SsmEvents as any).SSH = {
    START_SESSION: 'ssh:start',
    NEW_DATA: 'ssh:new_data',
    SCREEN_RESIZE: 'ssh:screen_resize',
    STATUS: 'ssh:status',
  };
}

describe('SshGateway', () => {
  let gateway: SshGateway;

  const mockSocket = {
    id: 'test-client-id',
  } as Socket;

  const mockSessionDto: SshSessionDto = {
    deviceUuid: 'test-device-uuid',
    cols: 80,
    rows: 24,
  };

  const mockScreenResizeDto: ScreenResizeDto = {
    cols: 80,
    rows: 24,
  };

  const mockSshTerminalService = {
    createSession: vi.fn().mockResolvedValue('test-session-id'),
    sendData: vi.fn(),
    resizeTerminal: vi.fn(),
    closeClientSessions: vi.fn(),
    getSessionIdForClient: vi.fn().mockReturnValue('test-session-id'),
    getStream: vi.fn(),
  };

  beforeEach(async () => {
    gateway = new SshGateway(mockSshTerminalService as unknown as SshTerminalService);

    // Mock the logger to avoid console output during tests
    gateway['logger'] = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log initialization message', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.afterInit({} as any);
      expect(logSpy).toHaveBeenCalledWith('SSH WebSocket Gateway initialized');
    });
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockSocket);
      expect(logSpy).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection and close sessions', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockSocket);
      expect(logSpy).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
      expect(mockSshTerminalService.closeClientSessions).toHaveBeenCalledWith(mockSocket.id);
    });
  });

  describe('handleStartSession', () => {
    it('should start a new SSH session and return success', async () => {
      mockSshTerminalService.createSession.mockResolvedValueOnce('test-session-id');

      const result = await gateway.handleStartSession(mockSocket, mockSessionDto);

      expect(mockSshTerminalService.createSession).toHaveBeenCalledWith(
        mockSocket,
        mockSessionDto.deviceUuid,
        mockSessionDto.cols,
        mockSessionDto.rows
      );
      expect(result).toEqual({
        event: SsmEvents.SSH.START_SESSION,
        data: { sessionId: 'test-session-id', success: true },
      });
    });

    it('should handle errors when starting a session', async () => {
      const errorMessage = 'Connection failed';
      mockSshTerminalService.createSession.mockRejectedValueOnce(new Error(errorMessage));

      const result = await gateway.handleStartSession(mockSocket, mockSessionDto);

      expect(result).toEqual({
        event: SsmEvents.SSH.START_SESSION,
        data: { success: false, message: errorMessage },
      });
    });
  });

  describe('handleNewData', () => {
    it('should send data to the terminal', () => {
      const testData = 'test-data';

      gateway.handleNewData(mockSocket, testData);

      expect(mockSshTerminalService.getSessionIdForClient).toHaveBeenCalledWith(mockSocket.id);
      expect(mockSshTerminalService.sendData).toHaveBeenCalledWith('test-session-id', testData);
    });
  });

  describe('handleResize', () => {
    it('should resize the terminal', () => {
      gateway.handleResize(mockSocket, mockScreenResizeDto);

      expect(mockSshTerminalService.getSessionIdForClient).toHaveBeenCalledWith(mockSocket.id);
      expect(mockSshTerminalService.resizeTerminal).toHaveBeenCalledWith(
        'test-session-id',
        mockScreenResizeDto.cols,
        mockScreenResizeDto.rows
      );
    });
  });
});
