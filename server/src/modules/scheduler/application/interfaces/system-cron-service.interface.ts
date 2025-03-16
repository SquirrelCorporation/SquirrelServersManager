import { OnModuleInit } from '@nestjs/common';

export const SYSTEM_CRON_SERVICE = 'SYSTEM_CRON_SERVICE';

/**
 * Interface for the System Cron Service
 */
export interface ISystemCronService extends OnModuleInit {
  /**
   * Initialize the system cron service
   */
  onModuleInit(): Promise<void>;

  /**
   * Check for offline devices and update their status
   */
  checkOfflineDevices(): Promise<void>;

  /**
   * Clean up old Ansible logs and task statuses
   */
  cleanAnsibleLogs(): Promise<void>;

  /**
   * Clean up old server logs
   */
  cleanServerLogs(): Promise<void>;
}