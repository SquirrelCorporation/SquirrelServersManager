import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagnosticGateway } from '../../../presentation/gateways/diagnostic.gateway';

describe('DiagnosticGateway', () => {
  let gateway: DiagnosticGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiagnosticGateway],
    }).compile();

    gateway = module.get<DiagnosticGateway>(DiagnosticGateway);

    // Mock server
    gateway.server = {
      emit: vi.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should log when client connects', () => {
    // Mock logger
    const logSpy = vi.spyOn(gateway['logger'], 'log');
    const debugSpy = vi.spyOn(gateway['logger'], 'debug');

    // Mock socket
    const client = {
      id: 'test-client-id',
      nsp: { name: '/diagnostic' },
    } as unknown as Socket;

    // Call handleConnection
    gateway.handleConnection(client);

    // Verify log was called
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test-client-id'));
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('/diagnostic'));
  });

  it('should log when client disconnects', () => {
    // Mock logger
    const logSpy = vi.spyOn(gateway['logger'], 'log');

    // Mock socket
    const client = {
      id: 'test-client-id',
    } as unknown as Socket;

    // Call handleDisconnect
    gateway.handleDisconnect(client);

    // Verify log was called
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test-client-id'));
  });

  it('should emit event to all clients', () => {
    // Mock data
    const data = { message: 'test-message' };

    // Call emit method
    gateway.emit(SsmEvents.Diagnostic.PROGRESS, data);

    // Verify server.emit was called
    expect(gateway.server.emit).toHaveBeenCalledWith(SsmEvents.Diagnostic.PROGRESS, data);
  });
});
