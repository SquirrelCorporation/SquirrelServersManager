import Joi from 'joi';
import { Logger } from 'pino';

export type RemoteSystemInformationConfigurationSchema = {
  cpu: {
    watch: boolean;
    cron: string;
  };
  cpuStats: {
    watch: boolean;
    cron: string;
  };
  memStats: {
    watch: boolean;
    cron: string;
  };
  mem: {
    watch: boolean;
    cron: string;
  };
  os: {
    watch: boolean;
    cron: string;
  };
  networkInterfaces: {
    watch: boolean;
    cron: string;
  };
  fileSystem: {
    watch: boolean;
    cron: string;
  };
  fileSystemStats: {
    watch: boolean;
    cron: string;
  };
  usb: {
    watch: boolean;
    cron: string;
  };
  wifi: {
    watch: boolean;
    cron: string;
  };
  graphics: {
    watch: boolean;
    cron: string;
  };
  system: {
    watch: boolean;
    cron: string;
  };
  bluetooth: {
    watch: boolean;
    cron: string;
  };
  versions: {
    watch: boolean;
    cron: string;
  };
  host?: string; // Optional since it's not marked as required in Joi
  deviceUuid: string;
};

export interface IComponent {
  _id: string;
  name: string;
  configuration: RemoteSystemInformationConfigurationSchema;
  logger: Logger<never>;
  joi: Joi.Root;
  getId(): string;
  register(id: string, name: string, configuration: any): Promise<any>;
  deregister(): Promise<any>;
  init(): Promise<void>;
  deregisterComponent(): Promise<any>;
}
