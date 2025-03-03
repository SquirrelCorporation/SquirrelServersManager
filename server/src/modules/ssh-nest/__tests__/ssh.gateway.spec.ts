import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScreenResizeDto, SshSessionDto } from '../dto/ssh-session.dto';
import { SshTerminalService } from '../services/ssh-terminal.service';
import { SshGateway } from '../ssh.gateway';

describe('SshGateway', () => {
  let gateway: SshGateway;

  const mockSocket = {
    id: 'test-client-id',
  } as Socket;

  const mockSessionDto: SshSessionDto = {
    deviceUuid: 'test-device-uuid',
  };

  const mockScreenResizeDto: ScreenResizeDto = {
    cols: 80,
    rows: 24,
  };

  const mockSshTerminalService = {
    createSession: vi.fn(),
    sendData: vi.fn(),
    resizeTerminal: vi.fn(),
    closeClientSessions: vi.fn(),
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
      mockSshTerminalService.createSession.mockResolvedValue(undefined);

      const result = await gateway.handleStartSession(mockSocket, mockSessionDto);

      expect(mockSshTerminalService.createSession).toHaveBeenCalledWith(mockSocket, mockSessionDto);
      expect(result).toEqual({
        event: SsmEvents.SSH.STATUS,
        data: { status: 'OK' },
      });
    });

    it('should handle errors when starting a session', async () => {
      const errorMessage = 'Connection failed';
      mockSshTerminalService.createSession.mockRejectedValue(new Error(errorMessage));

      const result = await gateway.handleStartSession(mockSocket, mockSessionDto);

      expect(result).toEqual({
        event: SsmEvents.SSH.STATUS,
        data: { status: 'ERROR', message: errorMessage },
      });
    });
  });

  describe('handleNewData', () => {
    it('should send data to the terminal', () => {
      const testData = 'test command';
      gateway.handleNewData(mockSocket, testData);
      expect(mockSshTerminalService.sendData).toHaveBeenCalledWith(mockSocket.id, testData);
    });
  });

  describe('handleResize', () => {
    it('should resize the terminal', () => {
      gateway.handleResize(mockSocket, mockScreenResizeDto);
      expect(mockSshTerminalService.resizeTerminal).toHaveBeenCalledWith(
        mockSocket.id,
        mockScreenResizeDto,
      );
    });
  });
});
