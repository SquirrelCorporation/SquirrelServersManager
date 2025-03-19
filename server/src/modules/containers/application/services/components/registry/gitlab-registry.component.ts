import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { Image, RequestOptionsType } from '@modules/containers/types';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child({ module: 'GitLabRegistryComponent' }, { msgPrefix: '[GITLAB_REGISTRY] - ' });

/**
 * Docker Gitlab integration.
 */
@Injectable()
export class GitLabRegistryComponent extends AbstractRegistryComponent {

  /**
   * Initialize the component
   */
  async init(): Promise<void> {
    logger.info('Initializing GitLab registry component');
  }

  /**
   * Get the Gitlab configuration schema.
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
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      url: this.configuration.url,
      authurl: this.configuration.authurl,
      token: AbstractRegistryComponent.mask(this.configuration.token),
    };
  }

  /**
   * Return true if image has no registry url.
   */
  match(image: Image): boolean {
    return this.configuration.url?.indexOf(image.registry.url) !== -1;
  }

  /**
   * Normalize images according to Gitlab characteristics.
   */
  normalizeImage(image: Image): Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'gitlab';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to Gitlab.
   */
  async authenticate(
    image: Image,
    requestOptions: RequestOptionsType,
  ): Promise<RequestOptionsType> {
    if (!this.configuration.token) {
      throw new Error('Token is missing');
    }
    const request: RequestOptionsType = {
      method: 'GET',
      url: `${this.configuration.authurl}/jwt/auth?service=container_registry&scope=repository:${image.name}:pull`,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${AbstractRegistryComponent.base64Encode('', this.configuration.token)}`,
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
   */
  getAuthPull(): { password: string; username: string } {
    return {
      username: '',
      password: this.configuration.token as string,
    };
  }
}