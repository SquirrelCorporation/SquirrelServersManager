import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { SSMServicesTypes } from '../../../../../../types/typings';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child({ module: 'QuayRegistryComponent' }, { msgPrefix: '[QUAY_REGISTRY] - ' });

/**
 * Quay.io Registry integration.
 */
@Injectable()
export class QuayRegistryComponent extends AbstractRegistryComponent {

  /**
   * Initialize the component
   */
  async init(): Promise<void> {
    logger.info('Initializing Quay.io registry component');
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema() {
    return this.joi.alternatives().try(
      this.joi.object().optional().keys({
        name: this.joi.string().optional(),
        provider: this.joi.string().optional(),
        namespace: this.joi.string().required(),
        account: this.joi.string().required(),
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
      namespace: this.configuration.namespace,
      account: this.configuration.account,
      token: AbstractRegistryComponent.mask(this.configuration.token),
    };
  }

  /**
   * Return true if image has Quay registry URL
   */
  match(image: SSMServicesTypes.Image): boolean {
    return /^.*\.?quay.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to Quay.io characteristics
   */
  normalizeImage(image: SSMServicesTypes.Image): SSMServicesTypes.Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'quay';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to Quay.io
   */
  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ): Promise<SSMServicesTypes.RequestOptionsType> {
    const requestOptionsWithAuth = requestOptions;
    let token;

    // Add Authorization if any
    const credentials = this.getAuthCredentials();
    if (credentials) {
      const request: SSMServicesTypes.RequestOptionsType = {
        method: 'GET',
        url: `https://quay.io/v2/auth?service=quay.io&scope=repository:${image.name}:pull`,
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${credentials}`,
        },
      };
      try {
        const response = await axios(request);
        token = response.data.token;
      } catch (e: any) {
        this.childLogger.warn(`Error when trying to get an access token (${e.message})`);
      }
    }

    // Token? Put it in authorization header
    if (token && requestOptionsWithAuth.headers) {
      requestOptionsWithAuth.headers.Authorization = `Bearer ${token}`;
    }
    return requestOptionsWithAuth;
  }

  /**
   * Return Base64 credentials if any.
   */
  getAuthCredentials(): string | undefined {
    if (this.configuration.namespace && this.configuration.account && this.configuration.token) {
      return AbstractRegistryComponent.base64Encode(
        `${this.configuration.namespace}+${this.configuration.account}`,
        this.configuration.token,
      );
    }
    return undefined;
  }

  /**
   * Return username / password for Docker(+compose) triggers usage
   */
  getAuthPull(): undefined | { username: string; password: string } {
    if (this.configuration.namespace && this.configuration.account) {
      return {
        username: `${this.configuration.namespace}+${this.configuration.account}`,
        password: this.configuration.token as string,
      };
    }
    return undefined;
  }

  /**
   * Get tags page with pagination support for Quay.io
   */
  getTagsPage(image: SSMServicesTypes.Image, lastItem: string | undefined, link?: string): Promise<any> {
    // Default items per page (not honoured by all registries)
    const itemsPerPage = 1000;
    let nextPage = '';
    if (link) {
      const nextPageRegex = link.match(/^.*next_page=(.*)$/);
      if (nextPageRegex) {
        nextPage = `&next_page=${nextPageRegex[1]}`;
      }
    }
    return this.callRegistry({
      image,
      url: `${image.registry.url}/${image.name}/tags/list?n=${itemsPerPage}${nextPage}`,
    });
  }
}