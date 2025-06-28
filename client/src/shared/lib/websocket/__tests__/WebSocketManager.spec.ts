/**
 * WebSocket Manager Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketManager } from '../WebSocketManager';
import { ConnectionState } from '../types';

// Mock WebSocket
class MockWebSocket {
  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
  }
  
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: 1000 }));
    }
  });
  
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }
  
  simulateClose(code = 1000) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code }));
    }
  }
  
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
  
  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }
}

// Set up global mock
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

describe('WebSocketManager', () => {
  let manager: WebSocketManager;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset singleton
    (WebSocketManager as any).instance = null;
  });
  
  afterEach(() => {
    vi.useRealTimers();
    manager?.disconnect();
  });
  
  describe('Singleton Pattern', () => {
    it('should create instance with config', () => {
      const config = { url: 'ws://localhost:3000' };
      manager = WebSocketManager.getInstance(config);
      
      expect(manager).toBeDefined();
      expect(manager.getState()).toBe(ConnectionState.DISCONNECTED);
    });
    
    it('should return same instance', () => {
      const config = { url: 'ws://localhost:3000' };
      const instance1 = WebSocketManager.getInstance(config);
      const instance2 = WebSocketManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    it('should throw error if getInstance called without config first', () => {
      (WebSocketManager as any).instance = null;
      expect(() => WebSocketManager.getInstance()).toThrow();
    });
  });
  
  describe('Connection Management', () => {
    beforeEach(() => {
      manager = WebSocketManager.getInstance({ url: 'ws://localhost:3000' });
    });
    
    it('should connect with token', () => {
      manager.connect({ token: 'test-token' });
      
      expect(manager.getState()).toBe(ConnectionState.CONNECTING);
      
      const ws = (manager as any).ws as MockWebSocket;
      expect(ws.url).toBe('ws://localhost:3000/?token=test-token');
    });
    
    it('should transition to connected state', () => {
      const stateChangeSpy = vi.fn();
      manager.on('state:change', stateChangeSpy);
      
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      expect(manager.getState()).toBe(ConnectionState.CONNECTED);
      expect(manager.isConnected()).toBe(true);
      expect(stateChangeSpy).toHaveBeenCalledWith(ConnectionState.CONNECTING);
      expect(stateChangeSpy).toHaveBeenCalledWith(ConnectionState.CONNECTED);
    });
    
    it('should disconnect cleanly', () => {
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      manager.disconnect();
      
      expect(manager.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(ws.close).toHaveBeenCalled();
    });
    
    it('should handle connection errors', () => {
      const errorSpy = vi.fn();
      manager.on('error', errorSpy);
      
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateError();
      
      expect(manager.getState()).toBe(ConnectionState.ERROR);
      expect(errorSpy).toHaveBeenCalled();
    });
  });
  
  describe('Reconnection Logic', () => {
    beforeEach(() => {
      manager = WebSocketManager.getInstance({ 
        url: 'ws://localhost:3000',
        reconnectDelay: 100,
        maxReconnectDelay: 1000,
      });
    });
    
    it('should reconnect on unexpected disconnect', () => {
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      // Simulate unexpected disconnect
      ws.simulateClose(1006);
      
      expect(manager.getState()).toBe(ConnectionState.DISCONNECTED);
      
      // Fast forward reconnect timer
      vi.advanceTimersByTime(150);
      
      expect(manager.getState()).toBe(ConnectionState.CONNECTING);
    });
    
    it('should not reconnect on clean disconnect', () => {
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      // Simulate clean disconnect
      ws.simulateClose(1000);
      
      vi.advanceTimersByTime(1000);
      
      expect(manager.getState()).toBe(ConnectionState.DISCONNECTED);
    });
    
    it('should use exponential backoff', () => {
      const reconnectSpy = vi.fn();
      manager.on('reconnect', reconnectSpy);
      
      manager.connect();
      let ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      // First reconnect - 100ms
      ws.simulateClose(1006);
      vi.advanceTimersByTime(150);
      expect(reconnectSpy).toHaveBeenCalledWith(1);
      
      // Second reconnect - 200ms
      ws = (manager as any).ws as MockWebSocket;
      ws.simulateClose(1006);
      vi.advanceTimersByTime(250);
      expect(reconnectSpy).toHaveBeenCalledWith(2);
      
      // Third reconnect - 400ms
      ws = (manager as any).ws as MockWebSocket;
      ws.simulateClose(1006);
      vi.advanceTimersByTime(450);
      expect(reconnectSpy).toHaveBeenCalledWith(3);
    });
  });
  
  describe('Subscription Management', () => {
    beforeEach(() => {
      manager = WebSocketManager.getInstance({ url: 'ws://localhost:3000' });
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
    });
    
    it('should subscribe to topics', () => {
      const handler = vi.fn();
      const ws = (manager as any).ws as MockWebSocket;
      
      const unsubscribe = manager.subscribe('test-topic', handler);
      
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"subscribe"')
      );
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"topic":"test-topic"')
      );
      
      // Simulate message
      ws.simulateMessage({
        type: 'update',
        topic: 'test-topic',
        payload: { data: 'test' },
      });
      
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
      
      // Unsubscribe
      unsubscribe();
      
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"unsubscribe"')
      );
    });
    
    it('should handle multiple handlers for same topic', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const ws = (manager as any).ws as MockWebSocket;
      
      const unsub1 = manager.subscribe('topic', handler1);
      const unsub2 = manager.subscribe('topic', handler2);
      
      // Should only send one subscribe message
      expect(ws.send).toHaveBeenCalledTimes(1);
      
      ws.simulateMessage({
        type: 'update',
        topic: 'topic',
        payload: 'data',
      });
      
      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');
      
      // Unsubscribe first handler
      unsub1();
      
      // Should not unsubscribe from topic yet
      expect(ws.send).toHaveBeenCalledTimes(1);
      
      // Unsubscribe second handler
      unsub2();
      
      // Now should unsubscribe
      expect(ws.send).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Message Queueing', () => {
    beforeEach(() => {
      manager = WebSocketManager.getInstance({ url: 'ws://localhost:3000' });
    });
    
    it('should queue messages when disconnected', () => {
      const message = {
        id: '1',
        type: 'ping' as const,
        timestamp: Date.now(),
      };
      
      manager.send(message);
      
      expect((manager as any).messageQueue).toHaveLength(1);
    });
    
    it('should send queued messages on connect', () => {
      const message = {
        id: '1',
        type: 'ping' as const,
        timestamp: Date.now(),
      };
      
      manager.send(message);
      
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      expect(ws.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect((manager as any).messageQueue).toHaveLength(0);
    });
  });
  
  describe('Ping/Pong', () => {
    beforeEach(() => {
      manager = WebSocketManager.getInstance({ 
        url: 'ws://localhost:3000',
        pingInterval: 1000,
        pongTimeout: 500,
      });
    });
    
    it('should send ping messages', () => {
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      vi.advanceTimersByTime(1000);
      
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"ping"')
      );
    });
    
    it('should close connection on pong timeout', () => {
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      // Trigger ping
      vi.advanceTimersByTime(1000);
      
      // Don't send pong, wait for timeout
      vi.advanceTimersByTime(500);
      
      expect(ws.close).toHaveBeenCalled();
    });
    
    it('should cancel pong timer on pong received', () => {
      manager.connect();
      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateOpen();
      
      // Trigger ping
      vi.advanceTimersByTime(1000);
      
      // Send pong
      ws.simulateMessage({ type: 'pong' });
      
      // Wait past timeout
      vi.advanceTimersByTime(600);
      
      // Should not have closed
      expect(ws.close).not.toHaveBeenCalled();
    });
  });
});