import { beforeEach, describe, expect, test, vi } from 'vitest';
import AbstractComponent from '../../../../../application/services/components/application/services/components/core/Component';
import type { SSMServicesTypes } from '../../../../types/typings';

class Component<
  T extends
    | SSMServicesTypes.ConfigurationRegistrySchema
    | SSMServicesTypes.ConfigurationTriggerSchema
    | SSMServicesTypes.ConfigurationWatcherSchema
    | SSMServicesTypes.ConfigurationAuthenticationSchema,
> extends AbstractComponent<T> {
  constructor() {
    super();
  }
}

describe('testing Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('mask should mask with * when called with defaults', () => {
    expect(Component.mask('abcdefgh')).toStrictEqual('a******h');
  });

  test('mask should mask with § when called with § masking char', () => {
    expect(Component.mask('abcdefgh', 1, '§')).toStrictEqual('a§§§§§§h');
  });

  test('mask should mask with § and keep 3 chars when called with § masking char and a number of 3', () => {
    expect(Component.mask('abcdefgh', 3, '§')).toStrictEqual('abc§§fgh');
  });

  test('mask should return undefined when value is undefined', () => {
    expect(Component.mask(undefined)).toStrictEqual(undefined);
  });

  test('mask should not fail when mask is longer than original string', () => {
    expect(Component.mask('abc', 5)).toStrictEqual('***');
  });

  test('getId should return the concatenation $type.$name', () => {
    const component = new Component();
    // @ts-expect-error partial type
    component.register('id', 'kind', 'type', 'name', { x: 'x' });
    expect(component.getId()).toEqual('kind.type.name');
  });

  test('register should call validateConfiguration and init methods of the component', () => {
    const component = new Component();
    const spyValidateConsiguration = vi.spyOn(component, 'validateConfiguration');
    const spyInit = vi.spyOn(component, 'init');
    // @ts-expect-error partial type
    component.register('id', 'kind', 'type', 'name', { x: 'x' });
    expect(spyValidateConsiguration).toHaveBeenCalledWith({ x: 'x' });
    expect(spyInit).toHaveBeenCalledTimes(1);
  });

  test('register should not call init when validateConfiguration fails', async () => {
    const component = new Component();
    component.validateConfiguration = () => {
      throw new Error('validation failed');
    };
    const spyInit = vi.spyOn(component, 'init');
    // @ts-expect-error partial type
    await expect(component.register('id', 'type', 'name', { x: 'x' })).rejects.toThrowError(
      'validation failed',
    );
    expect(spyInit).toHaveBeenCalledTimes(0);
  });

  test('register should throw when init fails', async () => {
    const component = new Component();
    component.init = () => {
      throw new Error('init failed');
    };
    // @ts-expect-error partial type
    await expect(component.register('id', 'type', 'name', { x: 'x' })).rejects.toThrowError(
      'init failed',
    );
  });
});
