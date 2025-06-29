import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { Image, RequestOptionsType } from '@modules/containers/types';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child(
  { module: 'AcrRegistryComponent' },
  { msgPrefix: '[ACR_REGISTRY] - ' },
);

/**
 * Azure Container Registry integration.
 */
@Injectable()
export class AcrRegistryComponent extends AbstractRegistryComponent {
  /**
   * Initialize the component
   */
  async init(): Promise<void> {
    logger.info('Initializing ACR registry component');
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema() {
    return this.joi.object().keys({
      name: this.joi.string().optional(),
      provider: this.joi.string().optional(),
      clientid: this.joi.string().required(),
      clientsecret: this.joi.string().required(),
    });
  }

  /**
   * Sanitize sensitive data
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      clientid: this.configuration.clientid,
      clientsecret: AbstractRegistryComponent.mask(this.configuration.clientsecret),
    };
  }

  /**
   * Return true if image has ACR registry URL
   */
  match(image: Image): boolean {
    return /^.*\.?azurecr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to ACR characteristics
   */
  normalizeImage(image: Image): Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'acr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to ACR
   */
  async authenticate(
    image: Image,
    requestOptions: RequestOptionsType,
  ): Promise<RequestOptionsType> {
    const requestOptionsWithAuth = requestOptions;
    if (
      requestOptionsWithAuth.headers &&
      this.configuration.clientid &&
      this.configuration.clientsecret
    ) {
      requestOptionsWithAuth.headers.Authorization = `Basic ${AbstractRegistryComponent.base64Encode(
        this.configuration.clientid,
        this.configuration.clientsecret,
      )}`;
    }
    return requestOptionsWithAuth;
  }

  /**
   * Get authentication for pull operations
   */
  getAuthPull(): { username: string; password: string } {
    return {
      username: this.configuration.clientid as string,
      password: this.configuration.clientsecret as string,
    };
  }
}
