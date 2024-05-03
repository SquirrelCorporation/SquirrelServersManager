import axios from 'axios';
import logger from '../../../../../logger';
import { SSMServicesTypes } from '../../../typings';
import Custom from '../custom/Custom';

const URL = 'https://registry-1.docker.io';
/**
 * Docker Hub integration.
 */
export default class Hub extends Custom {
  async init() {
    this.configuration.url = URL;
    if (this.configuration.token) {
      this.configuration.password = this.configuration.token;
    }
  }

  getConnectedConfigurationSchema() {
    return [
      {
        name: 'login',
        type: 'string',
      },
      {
        name: 'Connection type',
        type: 'choice',
        values: [
          [
            {
              name: 'password',
              type: 'string',
            },
          ],
          [
            {
              name: 'token',
              type: 'string',
            },
          ],
          [
            {
              name: 'auth',
              type: 'string',
            },
          ],
        ],
      },
    ];
  }
  /**
   * Get the Hub configuration schema.
   * @returns {*}
   */
  // @ts-expect-error alternative type
  getConfigurationSchema() {
    return this.joi.alternatives([
      this.joi.object().allow({}),
      this.joi.object().keys({
        login: this.joi.string(),
        password: this.joi.string(),
        token: this.joi.string(),
        auth: this.joi.string().base64(),
      }),
    ]);
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      url: this.configuration.url,
      login: this.configuration.login,
      password: Hub.mask(this.configuration.password),
      token: Hub.mask(this.configuration.token),
      auth: Hub.mask(this.configuration.auth),
    };
  }

  /**
   * Return true if image has no core url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return !image.registry.url || /^.*\.?docker.io$/.test(image.registry.url);
  }

  /**
   * Normalize images according to Hub characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
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
  // eslint-disable-next-line class-methods-use-this
  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ) {
    const request: SSMServicesTypes.RequestOptionsType = {
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
        '[HUB] An authentication credentials for registry docker.io has been set, trying...',
      );
    }
    if (credentials && request.headers) {
      request.headers.Authorization = `Basic ${credentials}`;
    }
    try {
      const response = await axios.request(request);
      const requestOptionsWithAuth = requestOptions;
      if (requestOptionsWithAuth.headers) {
        requestOptionsWithAuth.headers.Authorization = `Bearer ${response.data.token}`;
      }
      this.childLogger.info(`[HUB] - Authentication done - ${response.status}`);
      return requestOptionsWithAuth;
    } catch (e: any) {
      this.childLogger.error('[HUB] - Authentication failed');
      throw e;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getImageFullName(image: SSMServicesTypes.Image, tagOrDigest: string) {
    let fullName = super.getImageFullName(image, tagOrDigest);
    fullName = fullName.replace(/registry-1.docker.io\//, '');
    fullName = fullName.replace(/library\//, '');
    return fullName;
  }
}
