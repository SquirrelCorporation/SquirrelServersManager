import { AxiosRequestConfig } from 'axios';
import Container from '../data/database/model/Container';

export declare namespace Playbooks {
  type HostVar = {
    ip: string[];
  };

  type HostVars = Record<string, HostVar>;

  type ConnectVars = {
    ansible_connection?: string;
    ansible_user?: string;
    ansible_ssh_pass?: any;
    ansible_become?: string;
    ansible_become_method?: string;
    ansible_ssh_extra_args?: any;
  };

  type HostGroup = {
    hosts: string[];
    vars?: ConnectVars;
  };

  type Meta = {
    _meta: {
      hostvars: HostVars;
    };
  };

  type All = {
    all: {
      children: string[];
      vars?: ConnectVars;
    };
  };

  type HostGroups = Record<string, HostGroup>;

  type Hosts = Meta & All & HostGroups;

  type PlaybookConfigurationFile = {
    playableInBatch: boolean;
    extraVars?: [{ extraVar: string; required: boolean; type: string; deletable: boolean }];
    uniqueQuickRef?: string;
  };
}

/*
{ "_meta": {
                "hostvars": {
                    "Rasp1": {
                        "ip": [
                            "192.168.0.61"
                        ]
                    },
                    "Rasp2": {
                        "ip": [
                            "192.168.0.254"
                        ]
                    },
                    "Rasp3": {
                        "ip": [
                            "192.168.0.137"
                        ]
                    },
                    "Server1": {
                        "ip": [
                            "192.168.0.111"
                        ]
                    }
                }
            },
            "all": {
                "children": ["raspian", "ubuntu"],
                "vars": {
                    "ansible_connection": "ssh",
                    "ansible_become": "yes",
                    "ansible_become_method": "sudo",
                    "ansible_ssh_extra_args": "'-o StrictHostKeyChecking=no'"

                },
            },
            "raspian": {
                "hosts": [
                    "192.168.0.61",
                    "192.168.0.254",
                    "192.168.0.137"
                ],
                "vars": {
                    "ansible_user":"pi",
                    "ansible_ssh_pass":"pi"
                }
            },
            "ubuntu": {
                "hosts": [
                    "192.168.0.111"
                ],
                "vars": {}
            }
        }
 */

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
    cron: string;
    watchstats?: boolean;
    cronstats: string;
    watchbydefault: boolean;
    watchall?: boolean;
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
}

declare module '../modules/docker/watchers/providers/docker/Docker';
