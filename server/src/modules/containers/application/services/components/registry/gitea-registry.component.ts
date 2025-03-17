import { Injectable } from '@nestjs/common';
import { CustomRegistryComponent } from '@modules/containers/application/services/components/registry/custom-registry.component';
import { SSMServicesTypes } from '../../../../../../types/typings';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child({ module: 'GiteaRegistryComponent' }, { msgPrefix: '[GITEA_REGISTRY] - ' });

/**
 * Gitea Container Registry integration.
 */
@Injectable()
export class GiteaRegistryComponent extends CustomRegistryComponent {

  /**
   * Custom init behavior.
   */
  async init(): Promise<void> {
    logger.info('Initializing Gitea Container Registry');

    // Prepend the URL with https protocol if protocol is missing
    if (this.configuration.url && !this.configuration.url?.toLowerCase().startsWith('http')) {
      this.configuration.url = `https://${this.configuration.url}`;
    }
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema() {
    return this.joi.object().keys({
      name: this.joi.string().optional(),
      provider: this.joi.string().optional(),
      url: this.joi.string().uri().required(),
      login: this.joi
        .alternatives()
        .conditional('password', {
          not: undefined,
          then: this.joi.string().required(),
          otherwise: this.joi.any().forbidden(),
        }),
      password: this.joi
        .alternatives()
        .conditional('login', {
          not: undefined,
          then: this.joi.string().required(),
          otherwise: this.joi.any().forbidden(),
        }),
      auth: this.joi
        .alternatives()
        .conditional('login', {
          not: undefined,
          then: this.joi.any().forbidden(),
          otherwise: this.joi
            .alternatives()
            .try(this.joi.string().base64(), this.joi.string().valid('')),
        }),
    });
  }

  /**
   * Return true if image registry match gitea fqdn.
   */
  match(image: SSMServicesTypes.Image): boolean {
    if (!this.configuration.url) {
      throw new Error('Configuration url is undefined');
    }
    const fqdnFull = /(?:https?:\/\/)?(.*)/.exec(this.configuration.url);
    const fqdnConfigured = fqdnFull ? fqdnFull[1].toLowerCase() : null;
    const imageRegistryFqdnFull = /(?:https?:\/\/)?(.*)/.exec(image.registry.url);
    const imageRegistryFqdn = imageRegistryFqdnFull ? imageRegistryFqdnFull[1].toLowerCase() : null;
    return fqdnConfigured === imageRegistryFqdn;
  }

  /**
   * Normalize image according to Gitea Container Registry characteristics.
   */
  normalizeImage(image: SSMServicesTypes.Image): SSMServicesTypes.Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'gitea';
    imageNormalized.registry.url = `${this.configuration.url}/v2`;
    return imageNormalized;
  }
}