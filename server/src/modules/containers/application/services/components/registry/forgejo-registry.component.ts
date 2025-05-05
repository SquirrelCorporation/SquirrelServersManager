import { Injectable } from '@nestjs/common';
import { GiteaRegistryComponent } from '@modules/containers/application/services/components/registry/gitea-registry.component';
import { Image } from '@modules/containers/types';

/**
 * Forgejo Container Registry integration.
 */
@Injectable()
export class ForgejoRegistryComponent extends GiteaRegistryComponent {
  /**
   * Normalize image according to Forgejo Container Registry characteristics.
   */
  normalizeImage(image: Image): Image {
    const imageNormalized = super.normalizeImage(image);
    imageNormalized.registry.name = 'forgejo';
    return imageNormalized;
  }
}