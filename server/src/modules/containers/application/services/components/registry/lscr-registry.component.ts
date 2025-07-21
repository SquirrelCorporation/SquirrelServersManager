import { Injectable } from '@nestjs/common';
import { GhcrRegistryComponent } from '@modules/containers/application/services/components/registry/ghcr-registry.component';
import Joi from 'joi';
import { Image } from '@modules/containers/types';

/**
 * Linux-Server Container Registry integration.
 */
@Injectable()
export class LscrRegistryComponent extends GhcrRegistryComponent {
  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema(): Joi.ObjectSchema<any> | Joi.AlternativesSchema<any> {
    return this.joi.object().keys({
      username: this.joi.string().required(),
      token: this.joi.string().required(),
    });
  }

  /**
   * Return true if image has LSCR registry URL
   */
  match(image: Image): boolean {
    return /^.*\.?lscr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to LSCR registry characteristics
   */
  normalizeImage(image: Image): Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'lscr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }
}
