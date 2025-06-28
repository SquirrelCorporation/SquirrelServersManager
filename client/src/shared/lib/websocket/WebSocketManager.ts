/**
 * WebSocket Manager
 * Singleton class for managing WebSocket connections with automatic reconnection
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionState,
  type WebSocketConfig,
  type WebSocketEvents,
  type WSMessage,
  type SubscriptionHandler,
  type SubscriptionOptions,
  type ConnectionOptions,
} from './types';

const DEFAULT_CONFIG: Partial<WebSocketConfig> = {
  reconnect: true,
  reconnectDelay: 100,
  maxReconnectDelay: 30000,
  reconnectDecay: 2,
  pingInterval: 30000,
  pongTimeout: 5000,
  debug: false,
};

export class WebSocketManager extends EventEmitter {
  private static instance: WebSocketManager | null = null;
  
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private pongTimer: NodeJS.Timeout | null = null;
  
  // Subscription management
  private subscriptions = new Map<string, Set<SubscriptionHandler>>();
  private topicSubscriptions = new WeakMap<object, Set<string>>();
  private messageQueue: WSMessage[] = [];
  private connectionOptions: ConnectionOptions = {};
  
  private constructor(config: WebSocketConfig) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Get or create WebSocket manager instance
   */
  static getInstance(config?: WebSocketConfig): WebSocketManager {
    if (!WebSocketManager.instance && config) {
      WebSocketManager.instance = new WebSocketManager(config);
    }
    
    if (!WebSocketManager.instance) {
      throw new Error('WebSocketManager not initialized. Call getInstance with config first.');
    }
    
    return WebSocketManager.instance;
  }
  
  /**
   * Connect to WebSocket server
   */
  connect(options: ConnectionOptions = {}): void {
    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED) {
      return;
    }
    
    this.connectionOptions = options;
    this.setState(ConnectionState.CONNECTING);
    
    try {
      const url = this.buildConnectionUrl();
      this.ws = new WebSocket(url);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.handleError(error as Event);
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.setState(ConnectionState.DISCONNECTING);
    this.clearTimers();
    
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection
      this.ws.close();
      this.ws = null;
    }
    
    this.setState(ConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }
  
  /**
   * Subscribe to a topic
   */
  subscribe<T = unknown>(
    topic: string,
    handler: SubscriptionHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    // Add handler to topic
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
      
      // Send subscription message if connected
      if (this.isConnected()) {
        this.send({
          id: uuidv4(),
          type: 'subscribe',
          topic,
          timestamp: Date.now(),
        });
      }
    }
    
    this.subscriptions.get(topic)!.add(handler as SubscriptionHandler);
    
    // Track subscription for cleanup
    const subscriberRef = { handler };
    const topics = this.topicSubscriptions.get(subscriberRef) || new Set();
    topics.add(topic);
    this.topicSubscriptions.set(subscriberRef, topics);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(topic);
      if (handlers) {
        handlers.delete(handler as SubscriptionHandler);
        
        // If no more handlers, unsubscribe from topic
        if (handlers.size === 0) {
          this.subscriptions.delete(topic);
          
          if (this.isConnected()) {
            this.send({
              id: uuidv4(),
              type: 'unsubscribe',
              topic,
              timestamp: Date.now(),
            });
          }
        }
      }
      
      // Clean up tracking
      const trackedTopics = this.topicSubscriptions.get(subscriberRef);
      if (trackedTopics) {
        trackedTopics.delete(topic);
        if (trackedTopics.size === 0) {
          this.topicSubscriptions.delete(subscriberRef);
        }
      }
    };
  }
  
  /**
   * Send a message through WebSocket
   */
  send(message: WSMessage): void {
    if (!this.isConnected()) {
      // Queue message if configured
      if (this.config.debug) {
        console.warn('WebSocket not connected, queueing message:', message);
      }
      this.messageQueue.push(message);
      return;
    }
    
    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      this.emit('error', error);
    }
  }
  
  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }
  
  // Private methods
  
  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    
    const previousState = this.state;
    this.state = state;
    
    if (this.config.debug) {
      console.log(`WebSocket state: ${previousState} -> ${state}`);
    }
    
    this.emit('state:change', state);
  }
  
  private buildConnectionUrl(): string {
    const url = new URL(this.config.url);
    
    // Add authentication token
    if (this.connectionOptions.token) {
      url.searchParams.set('token', this.connectionOptions.token);
    }
    
    // Add additional params
    if (this.connectionOptions.params) {
      Object.entries(this.connectionOptions.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    return url.toString();
  }
  
  private handleOpen(): void {
    this.setState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    
    // Resubscribe to all topics
    this.subscriptions.forEach((_, topic) => {
      this.send({
        id: uuidv4(),
        type: 'subscribe',
        topic,
        timestamp: Date.now(),
      });
    });
    
    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.send(message);
    }
    
    // Start ping timer
    this.startPingTimer();
  }
  
  private handleClose(event: CloseEvent): void {
    this.setState(ConnectionState.DISCONNECTED);
    this.clearTimers();
    
    if (this.config.reconnect && event.code !== 1000) {
      this.scheduleReconnect();
    }
  }
  
  private handleError(error: Event): void {
    this.setState(ConnectionState.ERROR);
    this.emit('error', new Error('WebSocket error'));
    
    if (this.config.debug) {
      console.error('WebSocket error:', error);
    }
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WSMessage;
      
      // Handle pong
      if (message.type === 'pong') {
        this.clearPongTimer();
        return;
      }
      
      // Handle topic messages
      if (message.topic) {
        const handlers = this.subscriptions.get(message.topic);
        if (handlers) {
          handlers.forEach(handler => {
            try {
              handler(message.payload);
            } catch (error) {
              console.error('Handler error:', error);
            }
          });
        }
      }
      
      // Emit raw message
      this.emit('message', message);
    } catch (error) {
      this.emit('error', new Error('Failed to parse message'));
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    const delay = Math.min(
      this.config.reconnectDelay! * Math.pow(this.config.reconnectDecay!, this.reconnectAttempts),
      this.config.maxReconnectDelay!
    );
    
    // Add jitter
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    const finalDelay = delay + jitter;
    
    this.reconnectAttempts++;
    this.emit('reconnect', this.reconnectAttempts);
    
    if (this.config.debug) {
      console.log(`Reconnecting in ${finalDelay}ms (attempt ${this.reconnectAttempts})`);
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.connectionOptions);
    }, finalDelay);
  }
  
  private startPingTimer(): void {
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          id: uuidv4(),
          type: 'ping',
          timestamp: Date.now(),
        });
        
        // Start pong timer
        this.pongTimer = setTimeout(() => {
          if (this.config.debug) {
            console.warn('Pong timeout, closing connection');
          }
          this.ws?.close();
        }, this.config.pongTimeout!);
      }
    }, this.config.pingInterval!);
  }
  
  private clearPongTimer(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }
  
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    
    this.clearPongTimer();
  }
  
  // TypeScript event emitter typing
  on<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K]
  ): this {
    return super.on(event, listener);
  }
  
  emit<K extends keyof WebSocketEvents>(
    event: K,
    ...args: Parameters<WebSocketEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}