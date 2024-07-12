import Joi from 'joi';
import type { SSMServicesTypes } from '../../../../../types/typings';
import Ghcr from '../ghcr/Ghcr';

/**
 * Linux-Server Container Registry integration.
 */
class Lscr extends Ghcr {
  getConfigurationSchema(): Joi.ObjectSchema<any> | Joi.AlternativesSchema<any> {
    return this.joi.object().keys({
      username: this.joi.string().required(),
      token: this.joi.string().required(),
    });
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    return /^.*\.?lscr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to Github Container Registry characteristics.
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'lscr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }
}

export default Lscr;
