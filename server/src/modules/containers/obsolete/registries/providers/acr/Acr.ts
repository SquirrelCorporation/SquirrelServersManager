import type { SSMServicesTypes } from '../../../../../types/typings.d.ts';
import Registry from '../../Registry';

/**
 * Azure Container Registry integration.
 */
class Acr extends Registry {
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
   * @returns {*}
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      clientid: this.configuration.clientid,
      clientsecret: Acr.mask(this.configuration.clientsecret),
    };
  }

  /**
   * Return true if image has not registryUrl.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return /^.*\.?azurecr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to AWS ECR characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'acr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ) {
    const requestOptionsWithAuth = requestOptions;
    if (
      requestOptionsWithAuth.headers &&
      this.configuration.clientid &&
      this.configuration.clientsecret
    ) {
      requestOptionsWithAuth.headers.Authorization = `Basic ${Acr.base64Encode(this.configuration.clientid, this.configuration.clientsecret)}`;
    }
    return requestOptionsWithAuth;
  }

  getAuthPull() {
    return {
      username: this.configuration.clientid,
      password: this.configuration.clientsecret,
    };
  }
}

export default Acr;
