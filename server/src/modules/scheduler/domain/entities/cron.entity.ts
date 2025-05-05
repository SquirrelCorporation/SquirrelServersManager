/**
 * Cron entity interface in the domain layer
 */
export interface ICron {
  _id?: string;
  name: string;
  disabled?: boolean;
  lastExecution?: Date;
  expression: string;
  createdAt?: Date;
  updatedAt?: Date;
}