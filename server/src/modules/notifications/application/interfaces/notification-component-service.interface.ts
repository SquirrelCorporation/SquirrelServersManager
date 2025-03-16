import { OnModuleInit } from '@nestjs/common';
import { Payload } from '../../../../core/events/EventManager';
import Events from '../../../../core/events/events';

export const NOTIFICATION_COMPONENT_SERVICE = 'NOTIFICATION_COMPONENT_SERVICE';

/**
 * Interface for the Notification Component Service
 */
export interface INotificationComponentService extends OnModuleInit {
  /**
   * Initialize the notification component when the module is loaded
   */
  onModuleInit(): void;

  /**
   * Register event handlers for events
   * @param event Event to listen for
   * @param callback Callback function to handle the event
   */
  on(event: Events, callback: (payload: Payload) => void): void;
}