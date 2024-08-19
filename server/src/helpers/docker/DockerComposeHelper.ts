import { API } from 'ssm-shared-lib';
import { Document } from 'yaml';

class DockerComposeHelper {
  private setCommand(dockerCompose: Document, template: API.Template) {
    if (template.command) {
      dockerCompose.setIn(['services', template.title, 'command'], template.command);
    }
  }

  private setPrivileged(dockerCompose: Document, template: API.Template) {
    if (template.privileged) {
      dockerCompose.setIn(['services', template.title, 'privileged'], true);
    }
  }

  private setNetwork(dockerCompose: Document, template: API.Template) {
    if (template.network) {
      const networkMode =
        template.network === 'host'
          ? 'host'
          : template.network !== 'docker'
            ? template.network
            : undefined;
      if (networkMode) {
        dockerCompose.setIn(['services', template.title, 'network_mode'], networkMode);
      }
    }
  }

  private setEnvironment(dockerCompose: Document, template: API.Template) {
    if (template.env) {
      dockerCompose.setIn(
        ['services', template.title, 'environment'],
        template.env.map((env) => `${env.name}=${env.default}`),
      );
    }
  }

  private setLabels(dockerCompose: Document, template: API.Template) {
    if (template.labels) {
      dockerCompose.setIn(
        ['services', 'labels'],
        template.labels.map((label) => `${label.name}=${label.value}`),
      );
    }
  }

  private setRestartPolicy(dockerCompose: Document, template: API.Template) {
    if (template.restart_policy) {
      dockerCompose.setIn(['services', template.title, 'restart'], template.restart_policy);
    }
  }

  private setPorts(dockerCompose: Document, template: API.Template) {
    if (template.ports) {
      dockerCompose.setIn(
        ['services', template.title, 'ports'],
        template.ports.map(
          (port) => `${port.host}:${port.container}${port.protocol ? '/' + port.protocol : ''}`,
        ),
      );
    }
  }

  private setVolumes(dockerCompose: Document, template: API.Template) {
    if (template.volumes) {
      const dockerVolumes = template.volumes.filter((v) => !v.bind && v.container);
      const hostVolumes = template.volumes.filter((v) => v.bind && v.container);
      if (hostVolumes.length > 0) {
        dockerCompose.setIn(
          ['services', template.title, 'volumes'],
          hostVolumes.map((v) => `${v.bind}:${v.container}${v.mode ? ':' + v.mode : ''}`),
        );
      }
      if (dockerVolumes.length > 0) {
        const dockerVolumesToCreate: string[] = [];
        dockerCompose.setIn(
          ['services', template.title, 'volumes'],
          dockerVolumes.map((v, i) => {
            const volumeName = `${template.name}_${v.container.replace(/\//g, '_')}_${i}`;
            dockerVolumesToCreate.push(volumeName);
            return `${volumeName}:${v.container}${v.mode ? ':' + v.mode : ''}`;
          }),
        );
        dockerVolumesToCreate.forEach((volume) => {
          dockerCompose.setIn(
            ['volumes', volume, 'labels'],
            ['ssm.volume.description=Created by SSM '],
          );
        });
      }
    }
  }

  private enableHwa(dockerCompose: Document, template: API.Template) {
    if (template.env && template.env.some((e) => e.name === 'DRINODE')) {
      dockerCompose.setIn(
        ['services', template.title, 'deploy', 'resources', 'reservations', 'devices'],
        [{ driver: 'nvidia', count: 1, capabilities: ['gpu'] }],
      );
    }
  }

  public fromJsonTemplateToYml(template: API.Template) {
    const dockerCompose = new Document({});

    dockerCompose.setIn(['services', template.title], {
      container_name: template.name,
      image: template.image,
    });

    this.setCommand(dockerCompose, template);
    this.setPrivileged(dockerCompose, template);
    this.setNetwork(dockerCompose, template);
    this.setEnvironment(dockerCompose, template);
    this.setLabels(dockerCompose, template);
    this.setRestartPolicy(dockerCompose, template);
    this.setPorts(dockerCompose, template);
    this.setVolumes(dockerCompose, template);
    this.enableHwa(dockerCompose, template);

    return dockerCompose.toString();
  }
}

export default new DockerComposeHelper();
