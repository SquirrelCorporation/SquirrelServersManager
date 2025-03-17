import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import PinoLogger from '../../../../../../logger';
import { SSMServicesTypes } from '../../../../../../types/typings';

const logger = PinoLogger.child({ module: 'GcrRegistryComponent' }, { msgPrefix: '[GCR_REGISTRY] - ' });

/**
 * Google Container Registry integration.
 */
@Injectable()
export class GcrRegistryComponent extends AbstractRegistryComponent {

  /**
   * Set up the registry component
   */
  async init(): Promise<void> {
    logger.info(`Initializing GCR registry: ${this.name}`);
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema() {
    return this.joi.alternatives().try(
      this.joi.object().optional().keys({
        name: this.joi.string().optional(),
        provider: this.joi.string().optional(),
        clientemail: this.joi.string().required(),
        privatekey: this.joi.string().required(),
      }),
      this.joi.object().equal({}),
    );
  }

  /**
   * Sanitize sensitive data
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      clientemail: this.configuration.clientemail,
      privatekey: AbstractRegistryComponent.mask(this.configuration.privatekey),
    };
  }

  /**
   * Return true if image has not registry url.
   * @param image the image
   * @returns {boolean}
   */
  match(image: SSMServicesTypes.Image): boolean {
    return /^.*\.?gcr.io$/.test(image.registry.url);
  }

  /**
   * Normalize image according to AWS ECR characteristics.
   * @param image
   * @returns {*}
   */
  normalizeImage(image: SSMServicesTypes.Image): SSMServicesTypes.Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'gcr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to GCR
   */
  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ): Promise<SSMServicesTypes.RequestOptionsType> {
    if (!this.configuration.clientemail) {
      return requestOptions;
    }
    const request: SSMServicesTypes.RequestOptionsType = {
      method: 'GET',
      url: `https://gcr.io/v2/token?scope=repository:${image.name}:pull`,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${AbstractRegistryComponent.base64Encode(
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

  /**
   * Get authentication info for pulls
   */
  getAuthPull(): { username: string; password: string } {
    return {
      username: this.configuration.clientemail as string,
      password: this.configuration.privatekey as string,
    };
  }
}