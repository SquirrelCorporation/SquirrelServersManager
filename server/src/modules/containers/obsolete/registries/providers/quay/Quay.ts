import axios from 'axios';
import type { SSMServicesTypes } from '../../../../../types/typings.d.ts';
import Registry from '../../Registry';

/**
 * Quay.io Registry integration.
 */
export default class Quay extends Registry {
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
   * @returns {*}
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      namespace: this.configuration.namespace,
      account: this.configuration.account,
      token: Quay.mask(this.configuration.token),
    };
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return /^.*\.?quay.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to Github Container Registry characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'quay';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  async authenticate(image, requestOptions) {
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
    if (token) {
      requestOptionsWithAuth.headers.Authorization = `Bearer ${token}`;
    }
    return requestOptionsWithAuth;
  }

  /**
   * Return Base64 credentials if any.
   * @returns {string|undefined|*}
   */
  getAuthCredentials() {
    if (this.configuration.namespace && this.configuration.account && this.configuration.token) {
      return Quay.base64Encode(
        `${this.configuration.namespace}+${this.configuration.account}`,
        this.configuration.token,
      );
    }
    return undefined;
  }

  /**
   * Return username / password for Docker(+compose) triggers usage
   * @return {{password: string, username: string}|undefined}
   */
  getAuthPull() {
    if (this.configuration.namespace && this.configuration.account) {
      return {
        username: `${this.configuration.namespace}+${this.configuration.account}`,
        password: this.configuration.token,
      };
    }
    return undefined;
  }

  getTagsPage(image: SSMServicesTypes.Image, lastItem, link?: string) {
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
