import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after duration (ms), null = no auto-dismiss
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void | Promise<void>;
  type?: 'primary' | 'secondary' | 'danger';
}

interface NotificationsState {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
  
  // Real-time notifications
  deviceOffline: (deviceName: string) => string;
  deviceOnline: (deviceName: string) => string;
  containerStatusChanged: (containerName: string, status: string) => string;
  playbookCompleted: (playbookName: string, success: boolean) => string;
}

let notificationIdCounter = 0;
const generateId = () => `notification-${++notificationIdCounter}-${Date.now()}`;

export const useNotificationsStore = create<NotificationsState>()(
  devtools((set, get) => ({
    notifications: [],
    
    addNotification: (notification) => {
      const id = generateId();
      const newNotification: Notification = {
        ...notification,
        id,
        createdAt: new Date(),
        duration: notification.duration ?? 5000, // Default 5 seconds
      };
      
      set((state) => ({
        notifications: [newNotification, ...state.notifications]
      }), false, 'notifications/add');
      
      // Auto-dismiss if duration is set
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id);
        }, newNotification.duration);
      }
      
      return id;
    },
    
    removeNotification: (id) => 
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }), false, 'notifications/remove'),
    
    clearAllNotifications: () => 
      set({ notifications: [] }, false, 'notifications/clearAll'),
    
    markAsRead: (id) => 
      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      }), false, 'notifications/markAsRead'),
    
    // Convenience methods
    success: (title, message, options) => 
      get().addNotification({
        type: 'success',
        title,
        message,
        ...options
      }),
    
    error: (title, message, options) => 
      get().addNotification({
        type: 'error',
        title,
        message,
        duration: options?.duration ?? 8000, // Longer for errors
        ...options
      }),
    
    warning: (title, message, options) => 
      get().addNotification({
        type: 'warning',
        title,
        message,
        ...options
      }),
    
    info: (title, message, options) => 
      get().addNotification({
        type: 'info',
        title,
        message,
        ...options
      }),
    
    // Domain-specific notifications
    deviceOffline: (deviceName) => 
      get().error(
        'Device Offline',
        `${deviceName} has gone offline`,
        {
          metadata: { deviceName, type: 'device-status' },
          actions: [
            {
              label: 'Reconnect',
              action: () => {
                // TODO: Implement reconnection logic
                console.log(`Attempting to reconnect to ${deviceName}`);
              }
            }
          ]
        }
      ),
    
    deviceOnline: (deviceName) => 
      get().success(
        'Device Online',
        `${deviceName} is now online`,
        {
          metadata: { deviceName, type: 'device-status' }
        }
      ),
    
    containerStatusChanged: (containerName, status) => {
      const isError = status === 'stopped' || status === 'failed';
      const method = isError ? get().warning : get().info;
      
      return method(
        'Container Status Change',
        `${containerName} is now ${status}`,
        {
          metadata: { containerName, status, type: 'container-status' }
        }
      );
    },
    
    playbookCompleted: (playbookName, success) => {
      const method = success ? get().success : get().error;
      return method(
        'Playbook Execution Complete',
        `${playbookName} ${success ? 'completed successfully' : 'failed'}`,
        {
          metadata: { playbookName, success, type: 'playbook-execution' },
          actions: success ? undefined : [
            {
              label: 'View Logs',
              action: () => {
                // TODO: Navigate to playbook logs
                console.log(`Opening logs for ${playbookName}`);
              }
            }
          ]
        }
      );
    }
  }), {
    name: 'notifications-store'
  })
);