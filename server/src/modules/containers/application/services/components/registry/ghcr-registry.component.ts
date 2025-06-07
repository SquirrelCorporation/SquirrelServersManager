import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import Joi from 'joi';
import { Image, RequestOptionsType } from '@modules/containers/types';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child(
  { module: 'GhcrRegistryComponent' },
  { msgPrefix: '[GHCR_REGISTRY] - ' },
);

/**
 * Github Container Registry integration.
 */
@Injectable()
export class GhcrRegistryComponent extends AbstractRegistryComponent {
  /**
   * Initialize the component
   */
  async init(): Promise<void> {
    logger.info('[GHCR] - Initializing GitHub Container Registry');
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema(): Joi.ObjectSchema<any> | Joi.AlternativesSchema<any> {
    return this.joi.alternatives().try(
      this.joi.object().optional().keys({
        username: this.joi.string().required(),
        token: this.joi.string().required(),
      }),
      this.joi.object().equal({}),
    );
  }

  /**
   * Sanitize sensitive data
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      username: this.configuration.username,
      token: AbstractRegistryComponent.mask(this.configuration.token),
    };
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  match(image: Image): boolean {
    return /^.*\.?ghcr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to Github Container Registry characteristics.
   * @param image
   * @returns {*}
   */
  normalizeImage(image: Image): Image {
    logger.info('[GHCR] - normalizeImage');
    const imageNormalized = image;
    imageNormalized.registry.name = 'ghcr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to GHCR
   */
  async authenticate(
    image: Image,
    requestOptions: RequestOptionsType,
  ): Promise<RequestOptionsType> {
    const requestOptionsWithAuth = requestOptions;
    const bearer = Buffer.from(
      this.configuration.token ? this.configuration.token : ':',
      'utf-8',
    ).toString('base64');
    if (requestOptionsWithAuth.headers) {
      requestOptionsWithAuth.headers.Authorization = `Bearer ${bearer}`;
    }
    return requestOptionsWithAuth;
  }

  /**
   * Get authentication info for pull operations
   */
  getAuthPull(): undefined | { username?: string; password?: string } {
    if (this.configuration.username && this.configuration.token) {
      return {
        username: this.configuration.username,
        password: this.configuration.token,
      };
    }
    return undefined;
  }
}
