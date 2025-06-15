/**
 * Notification entity interface in the domain layer
 */
export interface Notification {
  id?: string;
  event: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  seen: boolean;
  module: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
