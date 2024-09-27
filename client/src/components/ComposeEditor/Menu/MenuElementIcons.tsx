import {
  Annotation,
  Apache,
  Attach,
  Build,
  CommandLine,
  Config,
  ContainerImage,
  ContainerVolumeSolid,
  Crown,
  DnsOutline,
  Elasticsearch,
  ElNetwork,
  EntranceAlt1,
  ExternalLink,
  ExternalTFVC,
  File,
  Grafana,
  HealthRecognition,
  Influxdb,
  Internal,
  Kibana,
  Labels,
  Link,
  LinkAlt,
  Mongodb,
  Mysql,
  Nginx,
  Open,
  PortInput,
  Postgresql,
  Prometheus,
  Rabbitmq,
  Redis,
  Restart,
  ServerEnvironment,
  Services,
  Title,
  UserSecret,
} from '@/components/Icons/CustomIcons';
import { RocketOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

interface MenuElementIconsType {
  icon: ReactNode;
  color: string;
}

const MenuElementIcons: { [key: string]: MenuElementIconsType } = {
  services: {
    icon: <Services style={{ fontSize: '24px' }} />,
    color: '#008080', // Teal
  },
  annotations: {
    icon: <Annotation style={{ fontSize: '24px' }} />,
    color: '#2ba82b', // Lime Green
  },
  attach: {
    icon: <LinkAlt style={{ fontSize: '24px' }} />,
    color: '#8A2BE2', // Blue Violet
  },
  build: {
    icon: <Build style={{ fontSize: '24px' }} />,
    color: '#DC143C', // Crimson
  },
  'service-configs': {
    icon: <Config style={{ fontSize: '24px' }} />,
    color: '#4682B4', // Steel Blue
  },
  command: {
    icon: <CommandLine style={{ fontSize: '24px' }} />,
    color: '#2b7c79', // Medium Turquoise
  },
  container_name: {
    icon: <Title style={{ fontSize: '24px' }} />,
    color: '#191970', // Midnight Blue
  },
  depends_on: {
    icon: <Link style={{ fontSize: '24px' }} />,
    color: '#FF6347', // Tomato
  },
  deploy: {
    icon: <RocketOutlined style={{ fontSize: '24px' }} />,
    color: '#DAA520', // Goldenrod
  },
  dns: {
    icon: <DnsOutline style={{ fontSize: '24px' }} />,
    color: '#FF8C00', // Dark Orange
  },
  entrypoint: {
    icon: <EntranceAlt1 style={{ fontSize: '24px' }} />,
    color: '#2E8B57', // Sea Green
  },
  env_file: {
    icon: <File style={{ fontSize: '24px' }} />,
    color: '#6A5ACD', // Slate Blue
  },
  environment: {
    icon: <ServerEnvironment style={{ fontSize: '24px' }} />,
    color: '#FF1493', // Deep Pink
  },
  expose: {
    icon: <Open style={{ fontSize: '24px' }} />,
    color: '#FF4500', // Orange Red
  },
  external_links: {
    icon: <ExternalTFVC style={{ fontSize: '24px' }} />,
    color: '#9932CC', // Dark Orchid
  },
  healthcheck: {
    icon: <HealthRecognition style={{ fontSize: '24px' }} />,
    color: '#00CED1', // Dark Turquoise
  },
  image: {
    icon: <ContainerImage style={{ fontSize: '24px' }} />,
    color: '#DC143C', // Crimson
  },
  'service-labels': {
    icon: <Labels style={{ fontSize: '24px' }} />,
    color: '#8B4513', // Saddle Brown
  },
  'service-networks': {
    icon: <ElNetwork style={{ fontSize: '24px' }} />,
    color: '#4682B4', // Steel Blue
  },
  ports: {
    icon: <PortInput style={{ fontSize: '24px' }} />,
    color: '#4169E1', // Royal Blue
  },
  privileged: {
    icon: <Crown style={{ fontSize: '24px' }} />,
    color: '#008080', // Teal
  },
  restart: {
    icon: <Restart style={{ fontSize: '24px' }} />,
    color: '#FF69B4', // Hot Pink
  },
  'service-secrets': {
    icon: <UserSecret style={{ fontSize: '24px' }} />,
    color: '#4B0082', // Indigo
  },
  'service-volumes': {
    icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
    color: '#696969', // Dim Gray
  },
  volumes: {
    icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
    color: '#2E8B57', // Sea Green
  },
  'volume-name': {
    icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
    color: '#696969', // Dim Gray
  },
  'volume-driver': {
    icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
    color: '#696969', // Dim Gray
  },
  'volume-labels': {
    icon: <Labels style={{ fontSize: '24px' }} />,
    color: '#8B4513', // Saddle Brown
  },
  'volume-external': {
    icon: <ExternalLink style={{ fontSize: '24px' }} />,
    color: '#008080', // Teal
  },
  networks: {
    icon: <ElNetwork style={{ fontSize: '24px' }} />,
    color: '#4682B4', // Steel Blue
  },
  'network-driver': {
    icon: <ContainerVolumeSolid style={{ fontSize: '24px' }} />,
    color: '#696969', // Dim Gray
  },
  'network-labels': {
    icon: <Labels style={{ fontSize: '24px' }} />,
    color: '#8B4513', // Saddle Brown
  },
  'network-attachable': {
    icon: <Attach style={{ fontSize: '24px' }} />,
    color: '#008080', // Teal
  },
  'network-internal': {
    icon: <Internal style={{ fontSize: '24px' }} />,
    color: '#768da8', // Teal
  },
  configs: {
    icon: <Config style={{ fontSize: '24px' }} />,
    color: '#DC143C', // Crimson
  },
  'config-files': {
    icon: <Config style={{ fontSize: '24px' }} />,
    color: '#DC143C', // Orange Red
  },
  'config-external': {
    icon: <ExternalLink style={{ fontSize: '24px' }} />,
    color: '#008080', // Teal
  },
  secrets: {
    icon: <UserSecret style={{ fontSize: '24px' }} />,
    color: '#FF4500', // Orange Red
  },
  'secret-file': {
    icon: <UserSecret style={{ fontSize: '24px' }} />,
    color: '#FF4500', // Orange Red
  },
  mysql: {
    icon: <Mysql style={{ fontSize: '24px' }} />,
    color: '#DC143C', // Crimson
  },
  redis: {
    icon: <Redis style={{ fontSize: '24px' }} />,
    color: '#DC143C', // Crimson
  },
  postgresql: {
    icon: <Postgresql style={{ fontSize: '24px' }} />,
    color: '#191970', // Midnight Blue
  },
  nginx: {
    icon: <Nginx style={{ fontSize: '24px' }} />,
    color: '#FF4500', // Orange Red
  },
  mongo: {
    icon: <Mongodb style={{ fontSize: '24px' }} />,
    color: '#8A2BE2', // Blue Violet
  },
  rabbitmq: {
    icon: <Rabbitmq style={{ fontSize: '24px' }} />,
    color: '#00CED1', // Dark Turquoise
  },
  elastic: {
    icon: <Elasticsearch style={{ fontSize: '24px' }} />,
    color: '#4682B4', // Steel Blue
  },
  kibana: {
    icon: <Kibana style={{ fontSize: '24px' }} />,
    color: '#9932CC', // Dark Orchid
  },
  prometheus: {
    icon: <Prometheus style={{ fontSize: '24px' }} />,
    color: '#FF6347', // Tomato
  },
  grafana: {
    icon: <Grafana style={{ fontSize: '24px' }} />,
    color: '#FF69B4', // Hot Pink
  },
  influx: {
    icon: <Influxdb style={{ fontSize: '24px' }} />,
    color: '#1E90FF', // Dodger Blue
  },
  apache: {
    icon: <Apache style={{ fontSize: '24px' }} />,
    color: '#FF7F50', // Coral
  },
};

export default MenuElementIcons;
