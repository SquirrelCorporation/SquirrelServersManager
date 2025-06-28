/**
 * WebSocket Types and Interfaces
 * Defines the protocol for real-time communication
 */

/**
 * WebSocket connection states
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',
}

/**
 * WebSocket message types
 */
export type MessageType = 
  | 'subscribe'
  | 'unsubscribe'
  | 'update'
  | 'ping'
  | 'pong'
  | 'error'
  | 'auth';

/**
 * Base WebSocket message structure
 */
export interface WSMessage<T = unknown> {
  id: string;
  type: MessageType;
  topic?: string;
  payload?: T;
  timestamp: number;
}

/**
 * Device update event types
 */
export type DeviceEventType = 
  | 'device:status'
  | 'device:stats'
  | 'device:created'
  | 'device:updated'
  | 'device:deleted'
  | 'device:error';

/**
 * Device status update payload
 */
export interface DeviceStatusUpdate {
  deviceId: string;
  status: 'online' | 'offline' | 'connecting' | 'error' | 'unknown';
  timestamp: Date;
}

/**
 * Device stats update payload
 */
export interface DeviceStatsUpdate {
  deviceId: string;
  stats: {
    cpu: number;
    memory: number;
    disk?: number;
    network?: {
      in: number;
      out: number;
    };
  };
  timestamp: Date;
}

/**
 * Automation event types
 */
export type AutomationEventType = 
  | 'automation:status'
  | 'automation:progress'
  | 'automation:log'
  | 'automation:completed'
  | 'automation:failed'
  | 'automation:created'
  | 'automation:updated'
  | 'automation:deleted';

/**
 * Automation execution status update payload
 */
export interface AutomationStatusUpdate {
  automationId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'timeout';
  timestamp: Date;
  message?: string;
  error?: string;
}

/**
 * Automation execution progress update payload
 */
export interface AutomationProgressUpdate {
  automationId: string;
  executionId: string;
  progress: number; // 0-100
  currentStep: string;
  timestamp: Date;
}

/**
 * Automation log update payload
 */
export interface AutomationLogUpdate {
  automationId: string;
  executionId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  source?: string;
}

/**
 * Automation completion payload
 */
export interface AutomationCompletionUpdate {
  automationId: string;
  executionId: string;
  status: 'success' | 'failed';
  duration: number;
  timestamp: Date;
  results?: Record<string, any>;
  error?: string;
}

/**
 * Subscription handler function
 */
export type SubscriptionHandler<T = unknown> = (data: T) => void;

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectDecay?: number;
  pingInterval?: number;
  pongTimeout?: number;
  debug?: boolean;
}

/**
 * WebSocket manager events
 */
export interface WebSocketEvents {
  'state:change': (state: ConnectionState) => void;
  'message': (message: WSMessage) => void;
  'error': (error: Error) => void;
  'reconnect': (attempt: number) => void;
}

/**
 * Subscription options
 */
export interface SubscriptionOptions {
  /**
   * Automatically resubscribe on reconnect
   */
  autoResubscribe?: boolean;
  /**
   * Buffer messages while disconnected
   */
  bufferWhileOffline?: boolean;
}

/**
 * Connection options for WebSocket
 */
export interface ConnectionOptions {
  /**
   * Authentication token
   */
  token?: string;
  /**
   * Additional headers
   */
  headers?: Record<string, string>;
  /**
   * Query parameters
   */
  params?: Record<string, string>;
}