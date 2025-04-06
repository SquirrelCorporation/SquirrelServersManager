import * as yaml from 'js-yaml';

/**
 * Function to transform Docker Compose JSON to YAML
 * @param input - The Docker Compose JSON object
 * @returns The YAML string
 */
export const transformToDockerCompose = (input: any) => {
  type ServiceType = {
    [key: string]: any;
  };

  type ConfigType = {
    [key: string]: any;
  };

  type NetworkType = {
    [key: string]: any;
  };

  type VolumeType = {
    [key: string]: any;
  };

  type SecretType = {
    [key: string]: any;
  };

  const services: ServiceType = {};
  const configs: ConfigType = {};
  const networks: NetworkType = {};
  const volumes: VolumeType = {};
  const secrets: SecretType = {};

  // Transform services if present (add your own logic here specific to services if needed)
  if (input.services) {
    for (const [key, value] of Object.entries(input.services as object)) {
      services[value.name] = {
        image: value.image,
        ports: value.ports?.map((port: any) => `${port.published}:${port.target}`),
        volumes: value['service-volumes']?.map(
          (volume: any) => `${volume.source}:${volume.target}`,
        ),
        environment: value.environment?.map((env: any) => `${env.name}=${env.value}`),
        build: value.build
          ? { context: value.build.context, dockerfile: value.build.dockerfile }
          : undefined,
        container_name: value.container_name,
        depends_on: value.depends_on,
        configs: value['service-configs'],
        deploy: value.deploy,
        dns: value.dns,
        entrypoint: value.entrypoint,
        env_file: value.env_file,
        expose: value.expose,
        external_links: value.external_links,
        healthcheck: value.healthcheck,
        labels: value['service-labels']?.map((label: any) => `${label.key}=${label.value}`),
        networks: value['service-networks'],
        privileged: value.privileged,
        restart: value.restart,
        secrets: value['service-secrets'],
        command: value.command,
        attach: value.attach,
      };

      // Remove any undefined fields
      services[value.name] = Object.fromEntries(
        Object.entries(services[value.name]).filter(([_, v]) => v != null),
      );
    }
  }

  // Transform configs if present
  if (input.configs) {
    for (const [key, value] of Object.entries(input.configs as object)) {
      configs[value.name] = {
        external: value['config-external'],
        labels: value['config-labels']?.map((label: any) => `${label.key}=${label.value}`),
        files: value['config-files']?.map((config: any) => `${config.config_name}=${config.file}`),
      };

      // Remove any undefined fields
      configs[value.name] = Object.fromEntries(
        Object.entries(configs[value.name]).filter(([_, v]) => v != null),
      );
    }
  }

  // Transform networks if present
  if (input.networks) {
    for (const [key, value] of Object.entries(input.networks as object)) {
      const network: any = {};

      if (value['network-driver']) {
        network.driver = value['network-driver'];
      }

      if (value['network-driver_opts']) {
        network.driver_opts = value['network-driver_opts']?.reduce((opts: any, opt: any) => {
          opts[opt.opt_name] = opt.opt_value;
          return opts;
        }, {});
      }

      if (value['network-attachable']) {
        network.attachable = value['network-attachable'];
      }

      if (value['network-internal']) {
        network.internal = value['network-internal'];
      }

      if (value['network-labels']) {
        network.labels = value['network-labels']
          ?.map((label: any) => `${label.key}=${label.value}`)
          .reduce((acc: any, cur: string) => {
            const [key, value] = cur.split('=');
            acc[key] = value;
            return acc;
          }, {});
      }

      if (
        (network.driver ||
          network.driver_opts ||
          network.attachable ||
          network.internal ||
          network.labels) &&
        Object.keys(network).length > 0
      ) {
        networks[value.name] = network;
      } else {
        networks[value.name] = null;
      }
    }
  }

  // Transform volumes if present
  if (input.volumes) {
    for (const [_, value] of Object.entries(input.volumes as object)) {
      const volume: any = {};

      if (value['volume-name']) {
        volume.name = value['volume-name'].name;
      }

      if (value['volume-external'] !== undefined) {
        volume.external = value['volume-external'];
      }

      if (value['volume-driver']) {
        volume.driver = value['volume-driver'].driver;

        if (value['volume-driver'].driver_opts) {
          volume.driver_opts = value['volume-driver'].driver_opts.reduce((opts: any, opt: any) => {
            opts[opt.opt_name] = opt.opt_value;
            return opts;
          }, {});
        }
      }

      if (value['volume-labels']) {
        volume.labels = value['volume-labels']?.reduce((acc: any, label: any) => {
          acc[label.key] = label.value;
          return acc;
        }, {});
      }

      // Clean up empty properties
      if (volume.driver_opts && Object.keys(volume.driver_opts).length === 0) {
        delete volume.driver_opts;
      }

      if (volume.labels && Object.keys(volume.labels).length === 0) {
        delete volume.labels;
      }

      if (
        volume.name ||
        volume.external !== undefined ||
        volume.driver ||
        volume.driver_opts ||
        volume.labels
      ) {
        volumes[value.name] = volume;
      } else {
        volumes[value.name] = null; // Mark for empty
      }
    }
  }

  // Transform secrets if present
  if (input.secrets) {
    for (const [key, value] of Object.entries(input.secrets as object)) {
      secrets[value.name] = {
        file: value['secret-file'],
        environment: value['secret-env'],
      };

      // Remove any undefined fields
      secrets[value.name] = Object.fromEntries(
        Object.entries(secrets[value.name]).filter(([_, v]) => v != null),
      );
    }
  }

  const dockerComposeYaml = {
    version: input.version ? input.version : undefined,
    services: Object.keys(services).length ? services : undefined,
    configs: Object.keys(configs).length ? configs : undefined,
    networks: Object.keys(networks).length ? networks : undefined,
    volumes: Object.keys(volumes).length ? volumes : undefined,
    secrets: Object.keys(secrets).length ? secrets : undefined,
  };

  // Remove any empty top-level keys
  const finalComposeYaml = Object.fromEntries(
    Object.entries(dockerComposeYaml).filter(([_, v]) => v != null),
  );
  return yaml
    .dump(finalComposeYaml, { noRefs: true })
    ?.replace(/(\s+\w+: null)/g, (match: string) => match.replace(': null', ':'));
};
