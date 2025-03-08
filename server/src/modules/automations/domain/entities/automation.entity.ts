import { v4 as uuidv4 } from 'uuid';

export class Automation {
  uuid: string = uuidv4();
  name: string = '';
  automationChains: any = {};
  lastExecutionTime?: Date;
  lastExecutionStatus?: 'success' | 'failed';
  enabled: boolean = true;
}