import _joi from 'joi';
import Joi from 'joi';

abstract class ThirdParty<T> {
  public joi: Joi.Root;
  public configuration: T;
  public childLogger: any;

  /**
   * Constructor.
   */
  constructor() {
    this.joi = _joi;
    // @ts-expect-error init
    this.configuration = {};
    this.childLogger = undefined;
  }
}

export default ThirdParty;
