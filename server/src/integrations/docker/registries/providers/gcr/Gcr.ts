import axios from 'axios';
import type { SSMServicesTypes } from '../../../../../types/typings';
import Registry from '../../Registry';

/**
 * Google Container Registry integration.
 */
export default class Gcr extends Registry {
  getConnectedConfigurationSchema() {
    return [
      {
        name: 'clientemail',
        type: 'string',
      },
      {
        name: 'privatekey',
        type: 'string',
      },
    ];
  }

  // @ts-expect-error alternatives type
  getConfigurationSchema() {
    return this.joi.alternatives([
      this.joi.object().allow({}),
      this.joi.object().keys({
        clientemail: this.joi.string().required(),
        privatekey: this.joi.string().required(),
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
      clientemail: this.configuration.clientemail,
      privatekey: Gcr.mask(this.configuration.privatekey),
    };
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return /^.*\.?gcr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to AWS ECR characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'gcr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ) {
    if (!this.configuration.clientemail) {
      return requestOptions;
    }
    const request: SSMServicesTypes.RequestOptionsType = {
      method: 'GET',
      url: `https://gcr.io/v2/token?scope=repository:${image.name}:pull`,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Gcr.base64Encode(
          '_json_key',
          JSON.stringify({
            client_email: this.configuration.clientemail,
            private_key: this.configuration.privatekey,
          }),
        )}`,
      },
    };

    const response = await axios(request);
    const requestOptionsWithAuth = requestOptions;
    if (requestOptionsWithAuth.headers) {
      requestOptionsWithAuth.headers.Authorization = `Bearer ${response.data.token}`;
    }
    return requestOptionsWithAuth;
  }

  getAuthPull() {
    return {
      username: this.configuration.clientemail,
      password: this.configuration.privatekey,
    };
  }
}
