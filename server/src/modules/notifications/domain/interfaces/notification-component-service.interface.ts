import { OnModuleInit } from '@nestjs/common';

export const NOTIFICATION_COMPONENT_SERVICE = 'NOTIFICATION_COMPONENT_SERVICE';

/**
 * Interface for the Notification Component Service
 */
export interface INotificationComponentService extends OnModuleInit {
  onModuleInit(): void;
}
