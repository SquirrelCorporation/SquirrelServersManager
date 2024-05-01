import Joi from 'joi';
import _joi from 'joi';
import logger from '../../../logger';
import { SSMServicesTypes } from '../typings';
import { Kind } from './States';
import ConfigurationRegistrySchema = SSMServicesTypes.ConfigurationRegistrySchema;
import ConfigurationTriggerSchema = SSMServicesTypes.ConfigurationTriggerSchema;
import ConfigurationWatcherSchema = SSMServicesTypes.ConfigurationWatcherSchema;
import ConfigurationAuthenticationSchema = SSMServicesTypes.ConfigurationAuthenticationSchema;

export default class Component<
  T extends
    | ConfigurationRegistrySchema
    | ConfigurationTriggerSchema
    | ConfigurationWatcherSchema
    | ConfigurationAuthenticationSchema,
> {
  public joi: Joi.Root;
  public type: string;
  public name: string;
  public configuration: T;
  public childLogger;
  public kind: Kind;

  /**
   * Constructor.
   */
  constructor() {
    this.joi = _joi;
    this.kind = Kind.UNKNOWN;
    this.type = 'unknown';
    this.name = 'unknown';
    // @ts-expect-error init
    this.configuration = {};
    this.childLogger = undefined;
  }

  /**
   * Register the component.
   * @param kind
   * @param type the type of the component
   * @param name the name of the component
   * @param configuration the configuration of the component
   */
  async register(kind: Kind, type: string, name: string, configuration: T) {
    // Child log for the component
    this.kind = kind;
    this.type = type;
    this.name = name;
    this.configuration = this.validateConfiguration(configuration);
    this.childLogger = logger.child({ module: `registry/${type}/${name}` });
    this.childLogger.info(
      `Register with configuration ${JSON.stringify(this.maskConfiguration())}`,
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
  /* eslint-disable-next-line */
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

  getConnectedConfigurationSchema(): any {
    return undefined;
  }

  /**
   * Get the component configuration schema.
   * Can be overridden by the component implementation class
   * @returns {*}
   */
  getConfigurationSchema() {
    return this.joi.object();
  }

  /**
   * Init the component.
   * Can be overridden by the component implementation class
   */
  /* eslint-disable-next-line */
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

module.exports = Component;
