import { SSMServicesTypes } from '../../../../../types/SSMServicesTypes';
import Registry from '../../Registry';

/**
 * Hotio.dev Container Registry integration.
 */
export default class Hotio extends Registry {
  getConfigurationSchema() {
    return this.joi.object().allow({});
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return /^.*\.?hotio.dev/.test(image.registry.url);
  }

  /**
   * Normalize image according to Github Container Registry characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'hotio';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }
}
