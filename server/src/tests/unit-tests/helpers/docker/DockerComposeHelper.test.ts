import { describe, expect, test } from 'vitest';
import { API } from 'ssm-shared-lib';
import yaml from 'yaml';
import DockerComposeHelper from '../../../../helpers/docker/DockerComposeHelper';

describe('DockerComposeHelper', () => {
  test('fromJsonTemplateToYml: Basic conversion', () => {
    const template: API.Template = {
      title: 'app',
      name: 'my-app',
      image: 'app:latest',
      command: 'echo hello',
      // @ts-expect-error partial type
      env: [{ name: 'MY_ENV', default: 'default_value' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain('container_name: my-app');
    expect(result).toContain('image: app:latest');
    expect(result).toContain('command: echo hello');
    expect(result).toContain('MY_ENV=default_value');
  });

  test('fromJsonTemplateToYml: With privileged', () => {
    // @ts-expect-error partial type
    const template: API.Template = {
      title: 'app',
      name: 'my-app',
      image: 'app:latest',
      privileged: true,
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain('privileged: true');
  });

  test('fromJsonTemplateToYml: With network_mode', () => {
    // @ts-expect-error partial type
    const template: API.Template = {
      title: 'app',
      name: 'my-app',
      image: 'app:latest',
      network: 'custom_network',
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain('network_mode: custom_network');
  });

  test('fromJsonTemplateToYml: Without network_mode', () => {
    // @ts-expect-error partial type
    const template: API.Template = {
      title: 'app',
      name: 'my-app',
      image: 'app:latest',
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).not.toContain('network_mode:');
  });

  test('fromJsonTemplateToYml: Pure fields', async () => {
    const template: API.Template = {
      title: 'my-title',
      name: 'my-name',
      image: 'my-image',
      command: 'my-command',
      privileged: true,
      network: 'my-network',
      restart_policy: 'always',
      // @ts-expect-error partial type
      env: [{ name: 'KEY', default: 'VALUE' }],
      labels: [{ name: 'KEY', value: 'VALUE' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);
    expect(result).toContain(
      'services:\n  my-title:\n    container_name: my-name\n    image: my-image' +
        '\n    command: my-command\n    privileged: true' +
        '\n    network_mode: my-network' +
        '\n    environment:\n      - KEY=VALUE' +
        '\n    restart: always' +
        '\n  labels:\n    - KEY=VALUE\n',
    );
  });

  test('fromJsonTemplateToYml: Ports are present', async () => {
    const template: API.Template = {
      title: 'my-title',
      name: 'my-name',
      // @ts-expect-error partial type
      ports: [{ host: '8080', container: '80' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain(
      'services:\n  my-title:\n' +
        '    container_name: my-name\n' +
        '    image: undefined\n' +
        '    ports:\n      - 8080:80\n',
    );
  });

  test('fromJsonTemplateToYml: Host volumes are present', async () => {
    // @ts-expect-error partial type
    const template: API.Template = {
      title: 'my-title',
      name: 'my-name',
      volumes: [{ bind: '/host-path', container: '/container-path', mode: 'rw' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain(
      'services:\n  my-title:\n' +
        '    container_name: my-name\n' +
        '    image: undefined\n' +
        '    volumes:\n      - /host-path:/container-path:rw\n',
    );
  });

  test('fromJsonTemplateToYml: Docker volumes are present', async () => {
    const template: API.Template = {
      title: 'my-title',
      name: 'my-name',
      // @ts-expect-error partial type
      volumes: [{ bind: null, container: '/container-path', mode: 'rw' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain(
      'services:\n  my-title:\n' +
        '    container_name: my-name\n' +
        '    image: undefined\n' +
        '    volumes:\n      - my-name__container-path_0:/container-path:rw\n' +
        'volumes:\n  my-name__container-path_0:\n' +
        '    labels:\n      - "ssm.volume.description=Created by SSM "\n',
    );
  });

  test('fromJsonTemplateToYml: Enable HWA', async () => {
    const template: API.Template = {
      title: 'my-title',
      // @ts-expect-error partial type
      env: [{ name: 'DRINODE', default: 'enabled' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    expect(result).toContain(
      'services:\n' +
        '  my-title:\n' +
        '    container_name: undefined\n' +
        '    image: undefined\n' +
        '    environment:\n' +
        '      - DRINODE=enabled\n' +
        '    deploy:\n' +
        '      resources:\n' +
        '        reservations:\n' +
        '          devices:\n' +
        '            - driver: nvidia\n' +
        '              count: 1\n' +
        '              capabilities:\n' +
        '                - gpu\n',
    );
  });

  test('fromJsonTemplateToYml: Can be parsed to YAML', async () => {
    const template: API.Template = {
      title: 'my-title',
      name: 'my-name',
      image: 'my-image',
      command: 'my-command',
      privileged: true,
      network: 'my-network',
      restart_policy: 'always',
      // @ts-expect-error partial type
      ports: [{ bind: '800' }],
      volumes: [{ container: '/container-path' }],
      // @ts-expect-error partial type
      env: [{ name: 'KEY', default: 'VALUE' }],
      labels: [{ name: 'KEY', value: 'VALUE' }],
    };

    const result = DockerComposeHelper.fromJsonTemplateToYml(template);

    let errorOccurred = false;
    try {
      yaml.parse(result);
    } catch {
      errorOccurred = true;
    }

    expect(errorOccurred).toBe(false);
  });
});
