import type { SSMServicesTypes } from '../../../../types/typings';
import { REGISTRIES } from '../../core/conf';

const providerConf: SSMServicesTypes.RegistryAuthConfig[] = [
  {
    name: REGISTRIES.CUSTOM,
    provider: REGISTRIES.CUSTOM,
    default: false,
    persist: false,
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'url',
        type: 'string',
      },
      {
        name: 'Connection Type',
        type: 'choice',
        values: [
          [
            {
              name: 'login',
              type: 'string',
            },
            {
              name: 'password',
              type: 'string',
            },
          ],
          [
            {
              name: 'auth',
              type: 'string',
            },
          ],
        ],
      },
    ],
  },
  {
    name: REGISTRIES.ECR,
    provider: REGISTRIES.ECR,
    default: true,
    persist: true,
    fullName: 'AWS Elastic Container Registry',
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'accesskeyid',
        type: 'string',
      },
      {
        name: 'secretaccesskey',
        type: 'string',
      },
      {
        name: 'region',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.GHCR,
    provider: REGISTRIES.GHCR,
    default: true,
    persist: true,
    fullName: 'Github Container Registry',
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'username',
        type: 'string',
      },
      {
        name: 'token',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.GCR,
    provider: REGISTRIES.GCR,
    default: true,
    persist: true,
    fullName: 'Google Container Registry',
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'clientemail',
        type: 'string',
      },
      {
        name: 'privatekey',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.HUB,
    provider: REGISTRIES.HUB,
    fullName: 'Docker Hub',
    default: true,
    persist: true,
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'login',
        type: 'string',
      },
      {
        name: 'Connection type',
        type: 'choice',
        values: [
          [
            {
              name: 'password',
              type: 'string',
            },
          ],
          [
            {
              name: 'token',
              type: 'string',
            },
          ],
          [
            {
              name: 'auth',
              type: 'string',
            },
          ],
        ],
      },
    ],
  },
  {
    name: REGISTRIES.QUAY,
    provider: REGISTRIES.QUAY,
    default: true,
    persist: true,
    fullName: 'Red Hat Quay.io',
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'namespace',
        type: 'string',
      },
      {
        name: 'account',
        type: 'string',
      },
      {
        name: 'token',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.ACR,
    provider: REGISTRIES.ACR,
    default: false,
    persist: true,
    fullName: 'Azure Container Registry',
    config: { canAnonymous: false },
    authScheme: [
      {
        name: 'clientid',
        type: 'string',
      },
      {
        name: 'clientsecret',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.GITEA,
    provider: REGISTRIES.GITEA,
    default: false,
    persist: true,
    config: { canAnonymous: false },
    authScheme: [
      {
        name: 'login',
        type: 'string',
      },
      {
        name: 'password',
        type: 'string',
      },
      {
        name: 'url',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.FORGEJO,
    provider: REGISTRIES.FORGEJO,
    default: false,
    persist: true,
    config: { canAnonymous: false },
    authScheme: [
      {
        name: 'url',
        type: 'string',
      },
      {
        name: 'Connection Type',
        type: 'choice',
        values: [
          [
            {
              name: 'login',
              type: 'string',
            },
            {
              name: 'password',
              type: 'string',
            },
          ],
          [
            {
              name: 'auth',
              type: 'string',
            },
          ],
        ],
      },
    ],
  },
  {
    name: REGISTRIES.LSCR,
    provider: REGISTRIES.LSCR,
    default: false,
    persist: true,
    fullName: 'Linux Server Container Registry',
    config: { canAnonymous: false },
    authScheme: [
      {
        name: 'username',
        type: 'string',
      },
      {
        name: 'token',
        type: 'string',
      },
    ],
  },
  {
    name: REGISTRIES.GITLAB,
    provider: REGISTRIES.GITLAB,
    default: false,
    persist: true,
    config: { canAnonymous: false },
    authScheme: [
      {
        name: 'url',
        type: 'string',
      },
      {
        name: 'authurl',
        type: 'string',
      },
      {
        name: 'token',
        type: 'string',
      },
    ],
  },
];

export default providerConf;
