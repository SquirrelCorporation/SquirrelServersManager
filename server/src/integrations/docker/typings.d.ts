import axios from 'axios';
import Container from '../../data/database/model/Container';
import Device from '../../data/database/model/Device';

export declare namespace SSMServicesTypes {
  export type ConfigurationRegistrySchema = {
    password?: string;
    url?: string;
    login?: string;
    auth?: string;
    token?: string;
    clientemail?: string;
    privatekey?: string;
    username?: string;
    accesskeyid?: string;
    secretaccesskey?: string;
    region?: string;
    namespace?: string;
    account?: string;
  };

  export type UserConfigurationRegistrySchema = ConfigurationRegistrySchema & {
    provider: string;
    id: string;
  };

  export type ConfigurationWatcherSchema = {
    socket?: string;
    cafile?: string;
    certfile?: string;
    keyfile?: string;
    cron: string;
    watchbydefault: boolean;
    watchall?: boolean;
    watchdigest?: any;
    watchevents?: boolean;
    deviceUuid: string;
  };

  export type ConfigurationTriggerSchema = {
    threshold: 'all' | 'major' | 'minor' | 'patch';
    mode: 'simple' | 'batch';
    once: boolean;
    simpletitle: string;
    simplebody: string;
    batchtitle: string;
  };

  export type ConfigurationAuthenticationSchema = {
    user: string;
    hash: string;
  };

  export type ConfigurationSchema =
    | ConfigurationRegistrySchema
    | ConfigurationTriggerSchema
    | ConfigurationWatcherSchema
    | ConfigurationAuthenticationSchema;

  export type ContainerReport = {
    changed?: boolean;
    container: Container;
  };

  export type RequestOptionsType = axios.AxiosRequestConfig;

  export type Manifest = {
    platform: {
      architecture: string;
      os: string;
      variant: string[] | undefined;
    };
  };

  export type Image = {
    id: string;
    name: string;
    registry: {
      name: string;
      url: string;
    };
    digest: {
      watch: boolean;
      repo: string;
      value?: string;
    };
    tag: {
      value: string;
      semver: boolean;
    };
    os: string;
    architecture: string;
    variant: string[];
    created: string;
  };
}

declare module './watchers/providers/docker/Docker';
