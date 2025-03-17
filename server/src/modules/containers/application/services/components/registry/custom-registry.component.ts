import { Injectable } from '@nestjs/common';
import Joi from 'joi';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { SSMServicesTypes } from '../../../../../../types/typings';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child({ module: 'CustomRegistryComponent' }, { msgPrefix: '[CUSTOM_REGISTRY] - ' });

/**
 * Docker Custom Registry V2 integration.
 */
@Injectable()
export class CustomRegistryComponent extends AbstractRegistryComponent {

  /**
   * Set up the registry on initialization
   */
  async init(): Promise<void> {
    logger.info(`Setting up custom registry: ${this.name}`);

    if (this.configuration.url) {
      // Ensure URL ends with /v2
      this.configuration.url = `${this.configuration.url.replace(/\/v2\/?$/, '')}/v2`;
    }
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema(): Joi.ObjectSchema<any> | Joi.AlternativesSchema<any> {
    return this.joi
      .object()
      .optional()
      .keys({
        name: this.joi.string().optional(),
        provider: this.joi.string().optional(),
        url: this.joi.string().uri().required(),
        login: this.joi.alternatives().conditional('password', {
          not: undefined,
          then: this.joi.string().required(),
          otherwise: this.joi.any().forbidden(),
        }),
        password: this.joi.alternatives().conditional('login', {
          not: undefined,
          then: this.joi.string().required(),
          otherwise: this.joi.any().forbidden(),
        }),
        auth: this.joi.alternatives().conditional('login', {
          not: undefined,
          then: this.joi.any().forbidden(),
          otherwise: this.joi
            .alternatives()
            .try(this.joi.string().base64(), this.joi.string().valid('')),
        }),
      });
  }

  /**
   * Sanitize sensitive data
   */
  maskConfiguration(): any {
    return {
      ...this.configuration,
      password: AbstractRegistryComponent.mask(this.configuration.password),
      auth: AbstractRegistryComponent.mask(this.configuration.auth),
    };
  }

  /**
   * Return true if image has the same URL as this registry
   * @param image the image
   * @returns {boolean}
   */
  match(image: SSMServicesTypes.Image): boolean {
    return this.configuration.url?.indexOf(image.registry.url) !== -1;
  }

  /**
   * Normalize images according to Custom characteristics.
   * @param image
   * @returns {*}
   */
  normalizeImage(image: SSMServicesTypes.Image): SSMServicesTypes.Image {
    const imageNormalized = { ...image };
    imageNormalized.registry.name = 'custom';
    imageNormalized.registry.url = `${this.configuration.url}/v2`;
    return imageNormalized;
  }

  /**
   * Authenticate to Registry.
   * @param image
   * @param requestOptions
   * @returns {Promise<*>}
   */
  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ): Promise<SSMServicesTypes.RequestOptionsType> {
    const requestOptionsWithAuth = { ...requestOptions };
    const credentials = this.getAuthCredentials();
    if (credentials && requestOptionsWithAuth.headers) {
      requestOptionsWithAuth.headers.Authorization = `Basic ${credentials}`;
    }
    return requestOptionsWithAuth;
  }

  /**
   * Return Base64 credentials if any.
   * @returns {string|undefined|*}
   */
  getAuthCredentials(): string | undefined {
    if (this.configuration.auth) {
      return this.configuration.auth;
    }
    if (this.configuration.login && this.configuration.password) {
      return AbstractRegistryComponent.base64Encode(this.configuration.login, this.configuration.password);
    }
    return undefined;
  }

  /**
   * Return authentication info for pull operations
   */
  getAuthPull(): undefined | { username?: string; password?: string } {
    if (this.configuration.login) {
      return {
        username: this.configuration.login,
        password: this.configuration.password,
      };
    }
    return undefined;
  }
}