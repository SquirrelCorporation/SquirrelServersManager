import { Injectable } from '@nestjs/common';
import { GiteaRegistryComponent } from '@modules/containers/application/services/components/registry/gitea-registry.component';
import { SSMServicesTypes } from '../../../../../../types/typings';

/**
 * Forgejo Container Registry integration.
 */
@Injectable()
export class ForgejoRegistryComponent extends GiteaRegistryComponent {
  /**
   * Normalize image according to Forgejo Container Registry characteristics.
   */
  normalizeImage(image: SSMServicesTypes.Image): SSMServicesTypes.Image {
    const imageNormalized = super.normalizeImage(image);
    imageNormalized.registry.name = 'forgejo';
    return imageNormalized;
  }
}