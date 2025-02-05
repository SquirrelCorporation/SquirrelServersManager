import Joi from 'joi';
import _joi from 'joi';
import pino from 'pino';
import logger from '../../../logger';
import { RemoteSystemInformationConfigurationSchema } from './types';

export default class Component {
  public _id: string;
  public name: string;
  public configuration!: RemoteSystemInformationConfigurationSchema;
  public logger!: pino.Logger<never>;
  public joi: Joi.Root;

  /**
   * Constructor.
   */
  constructor() {
    this.joi = _joi;
    this._id = 'unknown';
    this.name = 'unknown';
  }

  getConfigurationSchema() {
    return this.joi.object().keys({
      cpu: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      os: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      system: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      bluetooth: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      cpuStats: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      memStats: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      mem: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      networkInterfaces: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      fileSystem: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      fileSystemStats: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      usb: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      wifi: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      graphics: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      versions: this.joi.object().keys({
        watch: this.joi.boolean().default(true),
        cron: this.joi.string().default('0 * * * *'),
      }),
      host: this.joi.string(),
      deviceUuid: this.joi.string(),
    });
  }
  /**
   * Register the component.
   * @param _id
   * @param name the name of the component
   * @param configuration the configuration of the component
   */
  async register(
    _id: string,
    name: string,
    configuration: RemoteSystemInformationConfigurationSchema,
  ) {
    this._id = _id;
    this.name = name;
    this.configuration = this.validateConfiguration(configuration);
    this.logger = logger.child(
      {
        module: `RemoteSystemInformation`,
        moduleId: `${this._id}`,
        moduleName: `${name}`,
        moduleType: `Watcher`,
      },
      { msgPrefix: `[REMOTE_SYSTEM_INFORMATION][WATCHER] - ` },
    );
    this.logger.info(
      `Registering WATCHER with configuration: ${JSON.stringify(this.maskConfiguration())}`,
    );
    await this.init();
    return this;
  }

  async init(): Promise<void> {}

  /**
   * Validate the configuration of the component.
   *
   * @param configuration the configuration
   * @returns {*} or throw a validation error
   */
  validateConfiguration(configuration: RemoteSystemInformationConfigurationSchema) {
    const schema = this.getConfigurationSchema();
    const schemaValidated = schema.validate(configuration);
    if (schemaValidated.error) {
      throw schemaValidated.error;
    }
    return schemaValidated.value ? schemaValidated.value : {};
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration() {
    return this.configuration;
  }

  getId() {
    return `${this.name}`;
  }

  /**
   * Deregister the component.
   * @returns {Promise<void>}
   */
  async deregister() {
    this.logger.info('Deregister component');
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
}
