import type { SSMServicesTypes } from '../../../../../types/typings';
import Gitea from '../gitea/Gitea';

/**
 * Forgejo Container Registry integration.
 */
class Forgejo extends Gitea {
  /**
   * Normalize image according to Forgejo Container Registry characteristics.
   * @param image
   * @returns {*}
   */
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = super.normalizeImage(image);
    imageNormalized.registry.name = 'forgejo';
    return imageNormalized;
  }
}

export default Forgejo;
