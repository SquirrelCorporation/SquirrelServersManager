import { ContainerImage } from '@/components/Icons/CustomIcons';

export const Templates = {
  id: 'services',
  children: [
    {
      name: 'MySQL',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'mysql',
      color: '#DC143C', // Crimson
      fieldType: 'object',
      fields: [
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
              value: '3306',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '3306',
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
              value: '/var/lib/mysql',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/var/lib/mysql',
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
              id: 'MYSQL_ROOT_PASSWORD',
              name: 'MYSQL_ROOT_PASSWORD',
              fieldType: 'text',
              value: 'rootpassword',
            },
            {
              id: 'MYSQL_DATABASE',
              name: 'MYSQL_DATABASE',
              fieldType: 'text',
              value: 'mydatabase',
            },
            {
              id: 'MYSQL_USER',
              name: 'MYSQL_USER',
              fieldType: 'text',
              value: 'myuser',
            },
            {
              id: 'MYSQL_PASSWORD',
              name: 'MYSQL_PASSWORD',
              fieldType: 'text',
              value: 'mypassword',
            },
          ],
        },
      ],
    },
    {
      name: 'Redis',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'redis',
      color: '#DC143C', // Crimson
      fieldType: 'object',
      fields: [
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
              value: '6379',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '6379',
            },
          ],
        },
      ],
    },
    {
      name: 'PostgreSQL',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'postgresql',
      color: '#191970', // Midnight Blue
      fieldType: 'object',
      fields: [
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
              id: 'POSTGRES_DB',
              name: 'POSTGRES_DB',
              fieldType: 'text',
              value: 'mypostgresdb',
            },
            {
              id: 'POSTGRES_USER',
              name: 'POSTGRES_USER',
              fieldType: 'text',
              value: 'postgresuser',
            },
            {
              id: 'POSTGRES_PASSWORD',
              name: 'POSTGRES_PASSWORD',
              fieldType: 'text',
              value: 'postgrespassword',
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
              value: '/var/lib/postgresql/data',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/var/lib/postgresql/data',
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
              value: '5432',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '5432',
            },
          ],
        },
      ],
    },
    {
      name: 'Nginx',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'nginx',
      color: '#FF4500', // Orange Red
      fieldType: 'object',
      fields: [
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
              value: '80',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '80',
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
              value: '/usr/share/nginx/html',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/usr/share/nginx/html',
            },
          ],
        },
      ],
    },
    {
      name: 'MongoDB',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'mongodb',
      color: '#8A2BE2', // Blue Violet
      fieldType: 'object',
      fields: [
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
              id: 'MONGO_INITDB_ROOT_USERNAME',
              name: 'MONGO_INITDB_ROOT_USERNAME',
              fieldType: 'text',
              value: 'mongoadmin',
            },
            {
              id: 'MONGO_INITDB_ROOT_PASSWORD',
              name: 'MONGO_INITDB_ROOT_PASSWORD',
              fieldType: 'text',
              value: 'mongopassword',
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
              value: '/data/db',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/data/db',
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
              value: '27017',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '27017',
            },
          ],
        },
      ],
    },
    {
      name: 'RabbitMQ',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'rabbitmq',
      color: '#00CED1', // Dark Turquoise
      fieldType: 'object',
      fields: [
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
              value: '5672',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '5672',
            },
            {
              id: 'management_published',
              name: 'Management Published Port',
              fieldType: 'number',
              value: '15672',
            },
            {
              id: 'management_target',
              name: 'Management Target Port',
              fieldType: 'number',
              value: '15672',
            },
          ],
        },
      ],
    },
    {
      name: 'ElasticSearch',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'elasticsearch',
      color: '#4682B4', // Steel Blue
      fieldType: 'object',
      fields: [
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
              value: '9200',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '9200',
            },
            {
              id: 'transport_published',
              name: 'Transport Published Port',
              fieldType: 'number',
              value: '9300',
            },
            {
              id: 'transport_target',
              name: 'Transport Target Port',
              fieldType: 'number',
              value: '9300',
            },
          ],
        },
      ],
    },
    {
      name: 'Kibana',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'kibana',
      color: '#9932CC', // Dark Orchid
      fieldType: 'object',
      fields: [
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
              value: '5601',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '5601',
            },
          ],
        },
      ],
    },
    {
      name: 'Prometheus',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'prometheus',
      color: '#FF6347', // Tomato
      fieldType: 'object',
      fields: [
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
              value: '/prometheus',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/etc/prometheus',
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
              value: '9090',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '9090',
            },
          ],
        },
      ],
    },
    {
      name: 'Grafana',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'grafana',
      color: '#FF69B4', // Hot Pink
      fieldType: 'object',
      fields: [
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
              value: '3000',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '3000',
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
              value: '/var/lib/grafana',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/var/lib/grafana',
            },
          ],
        },
      ],
    },
    {
      name: 'InfluxDB',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'influxdb',
      color: '#1E90FF', // Dodger Blue
      fieldType: 'object',
      fields: [
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
              value: '8086',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '8086',
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
              value: '/var/lib/influxdb',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/var/lib/influxdb',
            },
          ],
        },
      ],
    },
    {
      name: 'Apache',
      icon: <ContainerImage style={{ fontSize: '24px' }} />,
      id: 'apache',
      color: '#FF7F50', // Coral
      fieldType: 'object',
      fields: [
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
              value: '80',
            },
            {
              id: 'target',
              name: 'Target Port',
              fieldType: 'number',
              value: '80',
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
              value: '/usr/local/apache2/htdocs',
            },
            {
              id: 'target',
              name: 'Target',
              fieldType: 'text',
              value: '/usr/local/apache2/htdocs',
            },
          ],
        },
      ],
    },
  ],
};
