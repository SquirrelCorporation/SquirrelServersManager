import * as Joi from 'joi';
import { AlternativesSchema } from 'joi';
import pino from 'pino';
import {
  ConfigurationAuthenticationSchema,
  ConfigurationRegistrySchema,
  ConfigurationTriggerSchema,
  ConfigurationWatcherSchema,
} from '@modules/containers/types';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import EventManager from '../../../../../../core/events/EventManager';
import logger from '../../../../../../logger';

abstract class Component<
  T extends
    | ConfigurationRegistrySchema
    | ConfigurationTriggerSchema
    | ConfigurationWatcherSchema
    | ConfigurationAuthenticationSchema,
> extends EventManager {
  public _id: string;
  public joi: Joi.Root;
  public type: string;
  public name: string;
  public configuration!: T;
  public childLogger!: pino.Logger<never>;
  public kind: Kind;

  /**
   * Constructor.
   */
  constructor() {
    super();
    this._id = 'unknown';
    this.joi = Joi;
    this.kind = Kind.UNKNOWN;
    this.type = 'unknown';
    this.name = 'unknown';
  }

  /**
   * Register the component.
   * @param _id
   * @param kind
   * @param type the type of the component
   * @param name the name of the component
   * @param configuration the configuration of the component
   */
  async register(_id: string, kind: Kind, type: string, name: string, configuration: T) {
    this._id = _id;
    this.kind = kind;
    this.type = type;
    this.name = name;
    this.configuration = this.validateConfiguration(configuration);
    this.childLogger = logger.child(
      {
        module: `${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
        moduleId: `${this._id}`,
        moduleName: `${name}`,
        moduleType: `${type}`,
      },
      { msgPrefix: `[${kind.toUpperCase()}][${type.toUpperCase()}] - ` },
    );
    this.childLogger.info(
      `Registering ${this.kind?.toLowerCase()} with configuration: ${JSON.stringify(this.maskConfiguration())}`,
    );
    await this.init();
    return this;
  }

  /**
   * Deregister the component.
   * @returns {Promise<void>}
   */
  async deregister() {
    this.childLogger.info('Deregister component');
    await this.deregisterComponent();
    return this;
  }

  /**
   * Deregistger the component (do nothing by default).
   * @returns {Promise<void>}
   */

  async deregisterComponent() {
    // Do nothing by default
  }

  /**
   * Validate the configuration of the component.
   *
   * @param configuration the configuration
   * @returns {*} or throw a validation error
   */
  validateConfiguration(configuration: T) {
    const schema = this.getConfigurationSchema();
    const schemaValidated = schema.validate(configuration);
    if (schemaValidated.error) {
      throw schemaValidated.error;
    }
    return schemaValidated.value ? schemaValidated.value : {};
  }

  /**
   * Get the component configuration schema.
   * Can be overridden by the component implementation class
   * @returns {*}
   */
  getConfigurationSchema(): Joi.ObjectSchema<any> | AlternativesSchema<any> {
    return this.joi.object();
  }

  /**
   * Init the component.
   * Can be overridden by the component implementation class
   */

  async init() {}

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration() {
    return this.configuration;
  }

  /**
   * Get Component ID.
   * @returns {string}
   */
  getId() {
    return `${this.kind}.${this.type}.${this.name}`;
  }

  /**
   * Mask a String
   * @param value the value to mask
   * @param nb the number of chars to keep start/end
   * @param char the replacement char
   * @returns {string|undefined} the masked string
   */
  static mask(value: string | undefined, nb = 1, char = '*') {
    if (!value) {
      return undefined;
    }
    if (value.length < 2 * nb) {
      return char.repeat(value.length);
    }
    return `${value.substring(0, nb)}${char.repeat(
      Math.max(0, value.length - nb * 2),
    )}${value.substring(value.length - nb, value.length)}`;
  }
}

export default Component;
