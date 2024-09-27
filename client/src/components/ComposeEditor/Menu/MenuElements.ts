import { MenuElementType } from '@/components/ComposeEditor/types';

export const MenuElements: MenuElementType[] = [
  {
    name: 'Services',
    id: 'services',
    children: [
      {
        name: 'Annotations',
        id: 'annotations',
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field
      },
      {
        name: 'Attach',
        id: 'attach',
        fieldType: 'checkbox',
        value: true,
      },
      {
        name: 'Build',
        id: 'build',
        fieldType: 'object',
        fields: [
          {
            id: 'context',
            fieldType: 'text',
            name: 'Context',
          },
          {
            id: 'dockerfile',
            fieldType: 'text',
            name: 'Dockerfile',
          },
        ],
      },
      {
        name: 'Configs',
        id: 'service-configs',
        fieldType: 'select',
      },
      {
        name: 'Command',
        id: 'command',
        fieldType: 'textArea', // Multi-line text area for commands
      },
      {
        name: 'Container Name',
        id: 'container_name',
        fieldType: 'text', // Text field for container name
      },
      {
        name: 'Depends On',
        id: 'depends_on',
        fieldType: 'select',
      },
      {
        name: 'Deploy',
        id: 'deploy',
        fieldType: 'object',
        fields: [
          {
            id: 'replicas',
            name: 'Replicas',
            fieldType: 'number',
          },
          {
            id: 'update_config',
            name: 'Update Configuration',
            fieldType: 'text',
          },
        ],
      },
      {
        name: 'DNS',
        id: 'dns',
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field
      },
      {
        name: 'Entry Point',
        id: 'entrypoint',
        fieldType: 'text', // Text field for entry point command
      },
      {
        name: 'Env File',
        id: 'env_file',
        fieldType: 'list',
        listItemType: 'text', // Each item is a URL field for env file path
      },
      {
        name: 'Environments',
        id: 'environment',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'name',
            name: 'Name',
            fieldType: 'text',
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
          },
        ],
      },
      {
        name: 'Expose',
        id: 'expose',
        fieldType: 'list',
        listItemType: 'number', // Each item is a text field for expose ports
      },
      {
        name: 'External Links',
        id: 'external_links',
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field for external links
      },
      {
        name: 'HealthCheck',
        id: 'healthcheck',
        fieldType: 'object',
        fields: [
          {
            id: 'test',
            name: 'Test',
            fieldType: 'textArea',
          },
          {
            id: 'interval',
            name: 'Interval',
            fieldType: 'number',
          },
          {
            id: 'timeout',
            name: 'Timeout',
            fieldType: 'number',
          },
          {
            id: 'retries',
            name: 'Retries',
            fieldType: 'number',
          },
        ],
      },
      {
        name: 'Image',
        id: 'image',
        fieldType: 'text', // Text field for image name
      },
      {
        name: 'Labels',
        id: 'service-labels',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'key',
            name: 'Key',
            fieldType: 'text',
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
          },
        ],
      },
      {
        name: 'Networks',
        id: 'service-networks',
        fieldType: 'select',
      },
      {
        name: 'Ports',
        id: 'ports',
        fieldType: 'list',
        listItemType: 'group', // Each item is a text field for port mappings
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
          },
        ],
      },
      {
        name: 'Privileged',
        id: 'privileged',
        fieldType: 'checkbox', // Single checkbox for privileged mode
      },
      {
        name: 'Restart',
        id: 'restart',
        fieldType: 'select',
        selectOptions: ['no', 'on-failure', 'always', 'unless-stopped'], // Dropdown selection for restart policy
      },
      {
        name: 'Secrets',
        id: 'service-secrets',
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field for secrets
      },
      {
        name: 'Volumes',
        id: 'service-volumes',
        fieldType: 'list',
        listItemType: 'group', // Each item is a volume mapping
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
          },
        ],
      },
    ],
  },
  {
    name: 'Volumes',
    id: 'volumes',
    children: [
      {
        name: 'Name',
        id: 'volume-name',
        fieldType: 'object',
        fields: [
          {
            id: 'name',
            name: 'Volume Name',
            fieldType: 'text',
          },
        ],
      },
      {
        name: 'Driver',
        id: 'volume-driver',
        fieldType: 'object',
        fields: [
          {
            id: 'driver',
            name: 'Driver',
            fieldType: 'text',
          },
          {
            id: 'driver_opts',
            name: 'Driver Options',
            fieldType: 'list',
            listItemType: 'group',
            fields: [
              {
                id: 'opt_name',
                name: 'Option Name',
                fieldType: 'text',
              },
              {
                id: 'opt_value',
                name: 'Option Value',
                fieldType: 'text',
              },
            ],
          },
        ],
      },
      {
        name: 'Labels',
        id: 'volume-labels',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'key',
            name: 'Key',
            fieldType: 'text',
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
          },
        ],
      },
      {
        name: 'External',
        id: 'volume-external',
        fieldType: 'checkbox',
      },
    ],
  },
  {
    name: 'Networks',
    id: 'networks',
    children: [
      {
        name: 'Driver',
        id: 'network-driver',
        fieldType: 'object',
        fields: [
          {
            id: 'driver',
            name: 'Driver',
            fieldType: 'text',
          },
          {
            id: 'driver_opts',
            name: 'Driver Options',
            fieldType: 'list',
            listItemType: 'group',
            fields: [
              {
                id: 'opt_name',
                name: 'Option Name',
                fieldType: 'text',
              },
              {
                id: 'opt_value',
                name: 'Option Value',
                fieldType: 'text',
              },
            ],
          },
        ],
      },
      {
        name: 'Labels',
        id: 'network-labels',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'key',
            name: 'Key',
            fieldType: 'text',
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
          },
        ],
      },
      {
        name: 'Attachable',
        id: 'network-attachable',
        fieldType: 'checkbox',
      },
      {
        name: 'Internal',
        id: 'network-internal',
        fieldType: 'checkbox',
      },
    ],
  },
  {
    name: 'Configs',
    id: 'configs',
    children: [
      {
        name: 'Config files',
        id: 'config-files',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'config_name',
            name: 'Config Name',
            fieldType: 'text',
          },
          {
            id: 'file',
            name: 'File',
            fieldType: 'text', // Path to the config file
          },
        ],
      },
      {
        name: 'External',
        id: 'config-external',
        fieldType: 'checkbox',
      },
    ],
  },
  {
    name: 'Secrets',
    id: 'secrets',
    children: [
      {
        name: 'Secret file',
        id: 'secret-file',
        fieldType: 'text',
      },
      {
        name: 'Secret Environment',
        id: 'secret-env',
        fieldType: 'text',
      },
    ],
  },
];
