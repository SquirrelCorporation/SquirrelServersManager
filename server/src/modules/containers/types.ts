import { IContainerEntity } from '@modules/containers/domain/entities/container.entity';
import { AxiosRequestConfig } from 'axios';

export type ContainerConfig = {
  [key: string]: any;
};

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
  clientid?: string;
  clientsecret?: string;
  authurl?: string;
};

export type UserConfigurationRegistrySchema = ConfigurationRegistrySchema & {
  provider: string;
  id: string;
};

// TODO: convert to camelCase
export type ConfigurationWatcherSchema = {
  socket?: string;
  cafile?: string;
  certfile?: string;
  keyfile?: string;
  password?: string;
  cron: string;
  watchstats?: boolean;
  cronstats: string;
  watchbydefault: boolean;
  watchall?: boolean;
  watchevents?: boolean;
  deviceUuid: string;
  host: string;
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
  container: IContainerEntity;
};

export type RequestOptionsType = AxiosRequestConfig;

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
    repo?: string;
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

export type RegistryAuthScheme = {
  name: string;
  type: string;
  values?: RegistryAuthScheme[][];
};

export type RegistryAuthConfig = {
  name: string;
  provider: string;
  default: boolean;
  persist: boolean;
  fullName?: string;
  config: { canAnonymous: boolean };
  authScheme?: RegistryAuthScheme[];
};
