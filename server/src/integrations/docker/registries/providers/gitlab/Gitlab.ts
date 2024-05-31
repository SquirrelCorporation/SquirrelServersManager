import axios from 'axios';
import { SSMServicesTypes } from '../../../../../types/typings';
import Registry from '../../Registry';

/**
 * Docker Gitlab integration.
 */
class Gitlab extends Registry {
  /**
   * Get the Gitlab configuration schema.
   * @returns {*}
   */
  getConfigurationSchema(): any {
    return this.joi.object().keys({
      url: this.joi.string().uri().default('https://registry.gitlab.com'),
      authurl: this.joi.string().uri().default('https://gitlab.com'),
      token: this.joi.string().required(),
    });
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      url: this.configuration.url,
      authurl: this.configuration.authurl,
      token: Gitlab.mask(this.configuration.token),
    };
  }

  /**
   * Return true if image has no registry url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return this.configuration.url?.indexOf(image.registry.url) !== -1;
  }

  /**
   * Normalize images according to Gitlab characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'gitlab';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to Gitlab.
   * @param image
   * @param requestOptions
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line class-methods-use-this
  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ): Promise<any> {
    if (!this.configuration.token) {
      throw new Error('Token is missing');
    }
    const request: SSMServicesTypes.RequestOptionsType = {
      method: 'GET',
      url: `${this.configuration.authurl}/jwt/auth?service=container_registry&scope=repository:${image.name}:pull`,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Gitlab.base64Encode('', this.configuration.token)}`,
      },
    };
    const response = await axios(request);
    const requestOptionsWithAuth = requestOptions;
    if (requestOptionsWithAuth.headers) {
      requestOptionsWithAuth.headers.Authorization = `Bearer ${response.data.token}`;
    }
    return requestOptionsWithAuth;
  }

  /**
   * Return empty username and personal access token value.
   * @returns {{password: (string|undefined|*), username: string}}
   */
  getAuthPull(): { password: string | undefined | any; username: string } {
    return {
      username: '',
      password: this.configuration.token,
    };
  }
}

export default Gitlab;
