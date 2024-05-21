import type { SSMServicesTypes } from '../../../../types/typings';

const providerConf: SSMServicesTypes.RegistryAuthConfig[] = [
  {
    name: 'custom',
    provider: 'custom',
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
    name: 'ecr',
    provider: 'ecr',
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
    name: 'ghcr',
    provider: 'ghcr',
    default: true,
    persist: true,
    fullName: 'Github Container Registry',
    config: { canAnonymous: true },
    authScheme: [
      {
        name: 'token',
        type: 'string',
      },
    ],
  },
  {
    name: 'gcr',
    provider: 'gcr',
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
    name: 'hotio',
    provider: 'hotio',
    default: true,
    persist: true,
    config: { canAnonymous: true },
  },
  {
    name: 'hub',
    provider: 'hub',
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
    name: 'quay',
    provider: 'quay',
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
    name: 'acr',
    provider: 'acr',
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
    name: 'gitea',
    provider: 'gitea',
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
    name: 'forjejo',
    provider: 'forjejo',
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
    name: 'lscr',
    provider: 'lscr',
    default: false,
    persist: true,
    fullName: 'Linux Server Container Registry',
    config: { canAnonymous: false },
    authScheme: [
      {
        name: 'token',
        type: 'string',
      },
    ],
  },
];

export default providerConf;
