import { API } from 'ssm-shared-lib';
import { Document } from 'yaml';

class DockerComposeHelper {
  public fromJsonTemplateToYml(template: API.Template) {
    const dockerCompose = new Document({});
    dockerCompose.setIn(['services', `${template.title}`], {
      container_name: `${template.name}`,
      image: `${template.image}`,
    });

    if (template.command) {
      dockerCompose.setIn(['services', `${template.title}`, 'command'], `${template.command}`);
    }

    if (template.privileged) {
      dockerCompose.setIn(['services', `${template.title}`, 'privileged'], true);
    }

    if (template.network) {
      if (template.network === 'host') {
        dockerCompose.setIn(['services', `${template.title}`, 'network_mode'], 'host');
      } else if (template.network !== 'docker') {
        dockerCompose.setIn(
          ['services', `${template.title}`, 'network_mode'],
          `${template.network}`,
        );
      }
    }
    if (template.env) {
      dockerCompose.setIn(
        ['services', `${template.title}`, 'environment'],
        template.env.map((env) => {
          return `${env.name}=${env.default}`;
        }),
      );
    }
    if (template.labels) {
      dockerCompose.setIn(
        ['services', 'labels'],
        template.labels.map((label) => {
          return `${label.name}=${label.value}`;
        }),
      );
    }
    // Restart policy
    if (template.restart_policy) {
      dockerCompose.setIn(
        ['services', `${template.title}`, 'restart'],
        `${template.restart_policy}`,
      );
    }
    // Restart policy
    if (template.ports) {
      dockerCompose.setIn(
        ['services', `${template.title}`, 'ports'],
        template.ports.map((port) => {
          return `${port.host}:${port.container}${port.protocol ? '/' + port.protocol : ''}`;
        }),
      );
    }
    if (template.volumes) {
      const dockerVolumes = template.volumes.filter((e) => !e.bind && e.container);
      const hostVolumes = template.volumes.filter((e) => e.bind && e.container);
      if (hostVolumes && hostVolumes.length > 0) {
        dockerCompose.setIn(
          ['services', `${template.title}`, 'volumes'],
          hostVolumes.map((volume) => {
            return `${volume.bind}:${volume.container}${volume.mode ? ':' + volume.mode : ''}`;
          }),
        );
      }
      if (dockerVolumes && dockerVolumes.length > 0) {
        const dockerVolumesToCreate: string[] = [];
        dockerCompose.setIn(
          ['services', `${template.title}`, 'volumes'],
          dockerVolumes.map((volume, index) => {
            const volumeName = `${template.name}_${volume.container.replace(/\//g, '_')}_${index}`;
            dockerVolumesToCreate.push(volumeName);
            return `${volumeName}:${volume.container}${volume.mode ? ':' + volume.mode : ''}`;
          }),
        );
        dockerVolumesToCreate
          .filter((item, index) => dockerVolumesToCreate.indexOf(item) === index)
          .map((volume) => {
            dockerCompose.setIn(
              ['volumes', volume, 'labels'],
              /* prettier-ignore */
              ['ssm.volume.description=Created by SSM '],
            );
          });
      }
    }
    // Enable HWA
    if (template.env) {
      if (template.env.find((e) => e.name === 'DRINODE')) {
        dockerCompose.setIn(
          ['services', `${template.title}`, 'deploy', 'resources', 'reservations', 'devices'],
          [{ driver: 'nvidia', count: 1, capabilities: ['gpu'] }],
        );
      }
    }
    return dockerCompose.toString();
  }
}

export default new DockerComposeHelper();
