import { MenuElementType } from '@/components/ComposeEditor/types';

export const Templates: MenuElementType[] = [
  {
    name: 'MySQL',
    category: 'services',
    id: 'mysql',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'mysql:5.7',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [3306],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [3306],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/var/lib/mysql'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/var/lib/mysql'],
          },
        ],
      },
      {
        id: 'environment',
        name: 'Environment Variables',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'name',
            name: 'Name',
            fieldType: 'text',
            value: [
              'MYSQL_ROOT_PASSWORD',
              'MYSQL_DATABASE',
              'MYSQL_USER',
              'MYSQL_PASSWORD',
            ],
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
            value: ['rootpassword', 'mydatabase', 'myuser', 'mypassword'],
          },
        ],
      },
    ],
  },
  {
    name: 'Redis',
    id: 'redis',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'redis:latest',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [6379],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [6379],
          },
        ],
      },
    ],
  },
  {
    name: 'PostgreSQL',
    id: 'postgresql',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'postgres:latest',
      },
      {
        id: 'environment',
        name: 'Environment Variables',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'name',
            name: 'Name',
            fieldType: 'text',
            value: ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'],
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
            value: ['mypostgresdb', 'postgresuser', 'postgrespassword'],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/var/lib/postgresql/data'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/var/lib/postgresql/data'],
          },
        ],
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [5432],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [5432],
          },
        ],
      },
    ],
  },
  {
    name: 'Nginx',
    id: 'nginx',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'nginx:latest',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [80],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [80],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/usr/share/nginx/html'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/usr/share/nginx/html'],
          },
        ],
      },
    ],
  },
  {
    name: 'MongoDB',
    id: 'mongo',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'mongo:latest',
      },
      {
        id: 'environment',
        name: 'Environment Variables',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'name',
            name: 'Name',
            fieldType: 'text',
            value: ['MONGO_INITDB_ROOT_USERNAME', 'MONGO_INITDB_ROOT_PASSWORD'],
          },
          {
            id: 'value',
            name: 'Value',
            fieldType: 'text',
            value: ['mongoadmin', 'mongopassword'],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/data/db'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/data/db'],
          },
        ],
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [27017],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [27017],
          },
        ],
      },
    ],
  },
  {
    name: 'RabbitMQ',
    id: 'rabbitmq',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'rabbitmq:management',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [5672, 15672],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [5672, 15672],
          },
        ],
      },
    ],
  },
  {
    name: 'ElasticSearch',
    id: 'elastic',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'docker.elastic.co/elasticsearch/elasticsearch:7.10.1',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [9200, 9300],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [9200, 9300],
          },
        ],
      },
    ],
  },
  {
    name: 'Kibana',
    id: 'kibana',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'docker.elastic.co/kibana/kibana:7.10.1',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [5601],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [5601],
          },
        ],
      },
    ],
  },
  {
    name: 'Prometheus',
    id: 'prometheus',
    isTemplate: true,
    category: 'services',
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'prom/prometheus:latest',
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/prometheus'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/etc/prometheus'],
          },
        ],
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [9090],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [9090],
          },
        ],
      },
    ],
  },
  {
    name: 'Grafana',
    id: 'grafana',
    isTemplate: true,
    category: 'services',
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'grafana/grafana:latest',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [3000],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [3000],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/var/lib/grafana'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/var/lib/grafana'],
          },
        ],
      },
    ],
  },
  {
    name: 'InfluxDB',
    id: 'influx',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'influxdb:latest',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [8086],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [8086],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/var/lib/influxdb'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/var/lib/influxdb'],
          },
        ],
      },
    ],
  },
  {
    name: 'Apache',
    id: 'apache',
    category: 'services',
    isTemplate: true,
    children: [
      {
        id: 'image',
        name: 'Image',
        fieldType: 'text',
        value: 'httpd:latest',
      },
      {
        id: 'ports',
        name: 'Ports',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'published',
            name: 'Published Port',
            fieldType: 'number',
            value: [80],
          },
          {
            id: 'target',
            name: 'Target Port',
            fieldType: 'number',
            value: [80],
          },
        ],
      },
      {
        id: 'volumes',
        name: 'Volumes',
        fieldType: 'list',
        listItemType: 'group',
        fields: [
          {
            id: 'source',
            name: 'Source',
            fieldType: 'text',
            value: ['/usr/local/apache2/htdocs'],
          },
          {
            id: 'target',
            name: 'Target',
            fieldType: 'text',
            value: ['/usr/local/apache2/htdocs'],
          },
        ],
      },
    ],
  },
];
