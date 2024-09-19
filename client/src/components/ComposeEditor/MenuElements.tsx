import { MenuElementType } from '@/components/ComposeEditor/types';
import {
  Annotation,
  Build,
  ColumnDependency,
  CommandLine,
  Config,
  ContainerImage,
  ContainerVolumeSolid,
  Crown,
  DnsOutline,
  ElNetwork,
  EntranceAlt1,
  ExternalTFVC,
  File,
  HealthRecognition,
  Labels,
  LinkAlt,
  Nametag,
  Open,
  PortInput,
  Restart,
  ServerEnvironment,
  Services,
  Title,
  UserSecret,
  Version,
} from '@/components/Icons/CustomIcons';
import { RocketOutlined } from '@ant-design/icons';

export const MenuElements: MenuElementType[] = [
  {
    name: 'Name',
    icon: <Nametag style={{ fontSize: '24px' }} />,
    id: 'name',
    color: '#1E90FF', // Dodger Blue
    fieldType: 'text',
  },
  {
    name: 'Version',
    id: 'version',
    icon: <Version style={{ fontSize: '24px' }} />,
    color: '#FF4500', // Orange Red
    fieldType: 'text',
  },
  {
    name: 'Services',
    id: 'services',
    icon: <Services style={{ fontSize: '24px' }} />,
    color: '#008080', // Teal
    multiple: true,
    children: [
      {
        name: 'Annotations',
        icon: <Annotation style={{ fontSize: '24px' }} />,
        id: 'annotations',
        color: '#2ba82b', // Lime Green
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field
      },
      {
        name: 'Attach',
        icon: <LinkAlt style={{ fontSize: '24px' }} />,
        id: 'attach',
        color: '#8A2BE2', // Blue Violet
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field
      },
      {
        name: 'Build',
        icon: <Build style={{ fontSize: '24px' }} />,
        id: 'build',
        color: '#DC143C', // Crimson
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
        icon: <Config style={{ fontSize: '24px' }} />,
        id: 'configs',
        color: '#4682B4', // Steel Blue
        fieldType: 'list',
        listItemType: 'select', // Each item is a dropdown selection
        selectOptions: ['config_1', 'config_2', 'config_3'], // Example options
      },
      {
        name: 'Command',
        icon: <CommandLine style={{ fontSize: '24px' }} />,
        id: 'command',
        color: '#2b7c79', // Medium Turquoise
        fieldType: 'textArea', // Multi-line text area for commands
      },
      {
        name: 'Container Name',
        icon: <Title style={{ fontSize: '24px' }} />,
        id: 'container_name',
        color: '#191970', // Midnight Blue
        fieldType: 'text', // Text field for container name
      },
      {
        name: 'Depends On',
        icon: <ColumnDependency style={{ fontSize: '24px' }} />,
        id: 'depends_on',
        color: '#FF6347', // Tomato
        fieldType: 'list',
        listItemType: 'select', // List of dependent services as dropdown
        selectOptions: ['service_1', 'service_2', 'service_3'], // Example options
      },
      {
        name: 'Deploy',
        icon: <RocketOutlined style={{ fontSize: '24px' }} />,
        id: 'deploy',
        color: '#DAA520', // Goldenrod
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
        icon: <DnsOutline style={{ fontSize: '24px' }} />,
        id: 'dns',
        color: '#FF8C00', // Dark Orange
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field
      },
      {
        name: 'Entry Point',
        icon: <EntranceAlt1 style={{ fontSize: '24px' }} />,
        id: 'entrypoint',
        color: '#2E8B57', // Sea Green
        fieldType: 'text', // Text field for entry point command
      },
      {
        name: 'Env File',
        icon: <File style={{ fontSize: '24px' }} />,
        id: 'env_file',
        color: '#6A5ACD', // Slate Blue
        fieldType: 'list',
        listItemType: 'url', // Each item is a URL field for env file path
      },
      {
        name: 'Environments',
        icon: <ServerEnvironment style={{ fontSize: '24px' }} />,
        id: 'environment',
        color: '#FF1493', // Deep Pink
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
        icon: <Open style={{ fontSize: '24px' }} />,
        id: 'expose',
        color: '#FF4500', // Orange Red
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field for expose ports
      },
      {
        name: 'External Links',
        icon: <ExternalTFVC style={{ fontSize: '24px' }} />,
        id: 'external_links',
        color: '#9932CC', // Dark Orchid
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field for external links
      },
      {
        name: 'HealthCheck',
        icon: <HealthRecognition style={{ fontSize: '24px' }} />,
        id: 'healthcheck',
        color: '#00CED1', // Dark Turquoise
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
            fieldType: 'text',
          },
          {
            id: 'timeout',
            name: 'Timeout',
            fieldType: 'text',
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
        icon: <ContainerImage style={{ fontSize: '24px' }} />,
        id: 'image',
        color: '#DC143C', // Crimson
        fieldType: 'text', // Text field for image name
      },
      {
        name: 'Labels',
        icon: <Labels style={{ fontSize: '24px' }} />,
        id: 'labels',
        color: '#8B4513', // Saddle Brown
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
        icon: <ElNetwork style={{ fontSize: '24px' }} />,
        id: 'networks',
        color: '#4682B4', // Steel Blue
        fieldType: 'list',
        listItemType: 'text', // Each item is a network name
      },
      {
        name: 'Ports',
        icon: <PortInput style={{ fontSize: '24px' }} />,
        id: 'ports',
        color: '#4169E1', // Royal Blue
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
        icon: <Crown style={{ fontSize: '24px' }} />,
        id: 'privileged',
        color: '#008080', // Teal
        fieldType: 'checkbox', // Single checkbox for privileged mode
      },
      {
        name: 'Restart',
        icon: <Restart style={{ fontSize: '24px' }} />,
        id: 'restart',
        color: '#FF69B4', // Hot Pink
        fieldType: 'select',
        selectOptions: ['no', 'on-failure', 'always', 'unless-stopped'], // Dropdown selection for restart policy
      },
      {
        name: 'Secrets',
        icon: <UserSecret style={{ fontSize: '24px' }} />,
        id: 'secrets',
        color: '#4B0082', // Indigo
        fieldType: 'list',
        listItemType: 'text', // Each item is a text field for secrets
      },
      {
        name: 'Volumes',
        icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
        id: 'volumes',
        color: '#696969', // Dim Gray
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
    icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
    id: 'volumes',
    color: '#2E8B57', // Sea Green
    fieldType: 'list',
    listItemType: 'group',
    fields: [
      {
        id: 'name',
        name: 'Volume Name',
        fieldType: 'text',
      },
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
    name: 'Networks',
    icon: <ElNetwork style={{ fontSize: '24px' }} />,
    id: 'networks',
    color: '#4682B4', // Steel Blue
    fieldType: 'list',
    listItemType: 'group',
    fields: [
      {
        id: 'name',
        name: 'Network Name',
        fieldType: 'text',
      },
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
    name: 'Configs',
    icon: <Config style={{ fontSize: '24px' }} />,
    id: 'configs',
    color: '#DC143C', // Crimson
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
    name: 'Secrets',
    icon: <UserSecret style={{ fontSize: '24px' }} />,
    id: 'secrets',
    color: '#FF4500', // Orange Red
    fieldType: 'list',
    listItemType: 'group',
    fields: [
      {
        id: 'secret_name',
        name: 'Secret Name',
        fieldType: 'text',
      },
      {
        id: 'file',
        name: 'File',
        fieldType: 'text', // Path to the secret file
      },
    ],
  },
];
