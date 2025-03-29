import { describe, expect, it } from 'vitest';
import { transformToDockerCompose } from '../docker-compose-json-transformer.util';

describe('transformToDockerCompose', () => {
  const baseInput = {
    name: '',
    services: {},
    configs: {},
    networks: {},
    volumes: {},
    secrets: {},
  };

  it('should transform services correctly', () => {
    const input = {
      ...baseInput,
      services: {
        service1: {
          name: 'mysql',
          image: 'mysql:5.7',
          ports: [
            {
              published: 3306,
              target: 3306,
            },
          ],
          'service-volumes': [
            {
              source: '/var/lib/mysql',
              target: '/var/lib/mysql',
            },
          ],
          environment: [
            {
              name: 'MYSQL_ROOT_PASSWORD',
              value: 'rootpassword',
            },
            {
              name: 'MYSQL_DATABASE',
              value: 'mydatabase',
            },
            {
              name: 'MYSQL_USER',
              value: 'myuser',
            },
            {
              name: 'MYSQL_PASSWORD',
              value: 'mypassword',
            },
          ],
        },
      },
    };

    const expectedYaml = `services:
  mysql:
    image: mysql:5.7
    ports:
      - '3306:3306'
    volumes:
      - /var/lib/mysql:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=mydatabase
      - MYSQL_USER=myuser
      - MYSQL_PASSWORD=mypassword
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should transform configs correctly', () => {
    const input = {
      ...baseInput,
      configs: {
        config1: {
          name: 'config1',
          'config-files': [
            {
              config_name: 'aze',
              file: 'ae',
            },
          ],
        },
      },
    };

    const expectedYaml = `configs:
  config1:
    files:
      - aze=ae
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should handle empty input gracefully', () => {
    const input = baseInput;
    const expectedYaml = `{}
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should transform networks correctly', () => {
    const input = {
      ...baseInput,
      networks: {
        network1: {
          name: 'mynetwork',
          'network-driver': 'bridge',
          'network-labels': [
            {
              key: 'label1',
              value: 'value1',
            },
          ],
        },
      },
    };

    const expectedYaml = `networks:
  mynetwork:
    driver: bridge
    labels:
      label1: value1
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should transform volumes correctly', () => {
    const input = {
      ...baseInput,
      volumes: {
        volume1: {
          name: 'myvolume',
          'volume-external': true,
          'volume-driver': {
            driver: 'local',
            driver_opts: [
              {
                opt_name: 'o',
                opt_value: 'value',
              },
            ],
          },
        },
      },
    };

    const expectedYaml = `volumes:
  myvolume:
    external: true
    driver: local
    driver_opts:
      o: value
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should transform secrets correctly', () => {
    const input = {
      ...baseInput,
      secrets: {
        secret1: {
          name: 'mysecret',
          'secret-file': '/run/secrets/mysecret',
          'secret-env': 'mysecret_env',
        },
      },
    };

    const expectedYaml = `secrets:
  mysecret:
    file: /run/secrets/mysecret
    environment: mysecret_env
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should handle mixed service fields and clean undefined values', () => {
    const input = {
      ...baseInput,
      services: {
        service1: {
          name: 'web',
          image: 'nginx',
          ports: [],
          environment: [{ name: 'ENV_VAR1', value: 'value1' }],
        },
      },
    };

    const expectedYaml = `services:
  web:
    image: nginx
    ports: []
    environment:
      - ENV_VAR1=value1
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should handle full input with all sections filled', () => {
    const input = {
      ...baseInput,
      version: '3.8',
      services: {
        service1: {
          name: 'web',
          image: 'nginx',
          ports: [{ published: 80, target: 80 }],
          environment: [{ name: 'ENV_VAR1', value: 'value1' }],
        },
      },
      configs: {
        config1: {
          name: 'config1',
          'config-files': [{ config_name: 'aze', file: 'ae' }],
        },
      },
      networks: {
        network1: {
          name: 'mynetwork',
          'network-driver': 'bridge',
        },
      },
      volumes: {
        volume1: {
          name: 'myvolume',
          'volume-external': true,
        },
      },
      secrets: {
        secret1: {
          name: 'mysecret',
          'secret-file': '/run/secrets/mysecret',
        },
      },
    };

    const expectedYaml = `version: '3.8'
services:
  web:
    image: nginx
    ports:
      - '80:80'
    environment:
      - ENV_VAR1=value1
configs:
  config1:
    files:
      - aze=ae
networks:
  mynetwork:
    driver: bridge
volumes:
  myvolume:
    external: true
secrets:
  mysecret:
    file: /run/secrets/mysecret
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });

  it('should handle missing version field', () => {
    const input = { ...baseInput };

    const expectedYaml = `{}
`;

    const result = transformToDockerCompose(input);
    expect(result).toStrictEqual(expectedYaml);
  });
});
