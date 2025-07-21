import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomRegistryComponent } from '@modules/containers/application/services/components/registry/custom-registry.component';
import Joi from 'joi';
import { Image, RequestOptionsType } from '@modules/containers/types';
import PinoLogger from '../../../../../../logger';
import { AbstractRegistryComponent } from './abstract-registry.component';

const logger = PinoLogger.child(
  { module: 'DockerHubRegistryComponent' },
  { msgPrefix: '[DOCKER_HUB_REGISTRY] - ' },
);
const URL = 'https://registry-1.docker.io';

/**
 * Docker Hub integration.
 */
@Injectable()
export class DockerHubRegistryComponent extends CustomRegistryComponent {
  /**
   * Set up Docker Hub-specific configuration
   */
  async init(): Promise<void> {
    logger.info(`Initializing Docker Hub registry: ${this.name}`);
    this.configuration.url = URL;
    if (this.configuration.token) {
      this.configuration.password = this.configuration.token;
    }
  }

  /**
   * Get the Hub configuration schema.
   * @returns {*}
   */
  getConfigurationSchema(): Joi.AlternativesSchema<any> {
    return this.joi.alternatives().try(
      this.joi.object().optional().keys({
        name: this.joi.string().optional(),
        provider: this.joi.string().optional(),
        login: this.joi.string(),
        password: this.joi.string(),
        token: this.joi.string(),
        auth: this.joi.string().base64(),
      }),
      this.joi.object().equal({}),
    );
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration(): any {
    return {
      ...this.configuration,
      url: this.configuration.url,
      login: this.configuration.login,
      password: AbstractRegistryComponent.mask(this.configuration.password),
      token: AbstractRegistryComponent.mask(this.configuration.token),
      auth: AbstractRegistryComponent.mask(this.configuration.auth),
    };
  }

  /**
   * Return true if image has no core url.
   * @param image the image
   * @returns {boolean}
   */
  match(image: Image): boolean {
    return !image.registry.url || /^.*\.?docker.io$/.test(image.registry.url);
  }

  /**
   * Normalize images according to Hub characteristics.
   * @param image
   * @returns {*}
   */
  normalizeImage(image: Image): Image {
    const imageNormalized = super.normalizeImage(image);
    imageNormalized.registry.name = 'hub';
    if (imageNormalized.name) {
      imageNormalized.name = imageNormalized.name.includes('/')
        ? imageNormalized.name
        : `library/${imageNormalized.name}`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to Hub.
   * @param image
   * @param requestOptions
   * @returns {Promise<*>}
   */
  async authenticate(
    image: Image,
    requestOptions: RequestOptionsType,
  ): Promise<RequestOptionsType> {
    const request: RequestOptionsType = {
      method: 'GET',
      url: `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${image.name}:pull&grant_type=password`,
      headers: {
        Accept: 'application/json',
      },
    };

    // Add Authorization if any
    const credentials = this.getAuthCredentials();
    if (credentials) {
      this.childLogger.info(
        'An authentication credentials for registry docker.io has been set, trying...',
      );
    }
    if (credentials && request.headers) {
      request.headers.Authorization = `Basic ${credentials}`;
    }
    try {
      const response = await axios(request);
      const requestOptionsWithAuth = requestOptions;
      if (requestOptionsWithAuth.headers) {
        requestOptionsWithAuth.headers.Authorization = `Bearer ${response.data.token}`;
      }
      this.childLogger.debug(`Authentication done - ${response.status}`);
      return requestOptionsWithAuth;
    } catch (e: any) {
      this.childLogger.error('Authentication failed');
      throw e;
    }
  }

  /**
   * Format the full image name
   */
  getImageFullName(image: Image, tagOrDigest: string): string {
    let fullName = super.getImageFullName(image, tagOrDigest);
    fullName = fullName.replace(/registry-1.docker.io\//, '');
    fullName = fullName.replace(/library\//, '');
    return fullName;
  }
}
