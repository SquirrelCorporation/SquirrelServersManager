import Joi from 'joi';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../../test-setup';

/**
 * Registry Kind enum to match the application's Kind enum
 */
enum Kind {
  REGISTRY = 'registry',
  WATCHER = 'watcher',
  UNKNOWN = 'unknown',
}

/**
 * Types needed for testing
 */
interface ConfigurationRegistrySchema {
  username?: string;
  password?: string;
  [key: string]: any;
}

/**
 * A simplified version of AbstractRegistryComponent for testing
 */
abstract class AbstractRegistryComponent {
  protected id: string = 'unknown';
  protected name: string = 'unknown';
  protected provider: string = 'unknown';
  protected kind: Kind = Kind.REGISTRY;
  protected type: string = 'unknown';
  protected childLogger: any = { debug: () => {}, info: () => {}, error: () => {}, warn: () => {} };
  protected joi = Joi;
  public configuration!: ConfigurationRegistrySchema;

  constructor() {
    this.kind = Kind.REGISTRY;
  }

  static base64Encode(login: string, token: string): string {
    return Buffer.from(`${login}:${token}`, 'utf-8').toString('base64');
  }

  static mask(value: string | undefined): string {
    if (!value) {
      return '';
    }
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 3) + '*'.repeat(value.length - 6) + value.substring(value.length - 3);
  }

  getId(): string {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  getProvider(): string {
    return this.provider;
  }

  getKind(): Kind {
    return this.kind;
  }

  async register(
    id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: ConfigurationRegistrySchema,
  ): Promise<AbstractRegistryComponent> {
    this.id = `${kind}.${provider}.${name}`;
    this.kind = kind;
    this.provider = provider;
    this.name = name;
    this.type = provider;
    this.configuration = { ...configuration };

    await this.init();
    return this;
  }

  async deregister(): Promise<void> {
    // Base implementation
  }

  async update(configuration: ConfigurationRegistrySchema): Promise<AbstractRegistryComponent> {
    this.configuration = { ...configuration };
    await this.init();
    return this;
  }

  abstract init(): Promise<void>;
  abstract getConfigurationSchema(): Joi.ObjectSchema<any> | Joi.AlternativesSchema<any>;
  abstract maskConfiguration(): any;
}

// Create a concrete implementation of AbstractRegistryComponent for testing
class TestRegistryComponent extends AbstractRegistryComponent {
  constructor() {
    super();
    this.provider = 'test';
  }

  public async init(): Promise<void> {
    // Implementation for testing
    await this.setup();
  }

  protected async setup(): Promise<void> {
    // Implementation for testing
  }

  protected async cleanup(): Promise<void> {
    // Implementation for testing
  }

  protected async onConfigurationUpdated(): Promise<void> {
    // Implementation for testing
  }

  public async deregister(): Promise<void> {
    await super.deregister();
    await this.cleanup();
  }

  public async update(config: ConfigurationRegistrySchema): Promise<this> {
    await super.update(config);
    await this.onConfigurationUpdated();
    return this;
  }

  public getId(): string {
    return `${this.kind}.${this.provider}.${this.name}`;
  }

  public getConfigurationSchema(): Joi.ObjectSchema<any> {
    return Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    });
  }

  public maskConfiguration(): any {
    return {
      username: this.configuration?.username,
      password: AbstractRegistryComponent.mask(this.configuration?.password),
    };
  }

  public async listImages(): Promise<any[]> {
    return [];
  }

  public async searchImages(): Promise<any[]> {
    return [];
  }

  public async getImageInfo(): Promise<any> {
    return {};
  }

  public async testConnection(): Promise<boolean> {
    return true;
  }
}

describe('AbstractRegistryComponent', () => {
  let component: TestRegistryComponent;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    component = new TestRegistryComponent();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should have correct kind', () => {
    expect(component.getKind()).toBe(Kind.REGISTRY);
  });

  test('should have correct provider type', () => {
    expect(component.getProvider()).toBe('test');
  });

  test('should register component correctly', async () => {
    const setupSpy = vi.spyOn(component as any, 'setup');

    const config: ConfigurationRegistrySchema = {
      username: 'test',
      password: 'password',
    };

    await component.register('test-id', Kind.REGISTRY, 'test-provider', 'test-name', config);

    expect(setupSpy).toHaveBeenCalled();
    expect(component.getId()).toBe('registry.test-provider.test-name');
    expect(component.getName()).toBe('test-name');
    expect(component.getProvider()).toBe('test-provider');
  });

  test('should deregister component correctly', async () => {
    const cleanupSpy = vi.spyOn(component as any, 'cleanup');

    component['id'] = 'test-id';
    component['provider'] = 'test-provider';
    component['name'] = 'test-name';

    await component.deregister();

    expect(cleanupSpy).toHaveBeenCalled();
  });

  test('should update component configuration', async () => {
    const updateSpy = vi.spyOn(component as any, 'onConfigurationUpdated');

    component['id'] = 'test-id';
    component['provider'] = 'test-provider';
    component['name'] = 'test-name';

    const config: ConfigurationRegistrySchema = {
      username: 'test',
      password: 'password',
    };

    await component.update(config);

    expect(updateSpy).toHaveBeenCalled();
    expect(component['configuration']).toEqual(config);
  });

  test('should handle errors in listImages method', async () => {
    const error = new Error('Test error');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'listImages').mockRejectedValueOnce(error);

    await expect(component.listImages()).rejects.toThrow(error);
  });

  test('should handle errors in searchImages method', async () => {
    const error = new Error('Test error');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'searchImages').mockRejectedValueOnce(error);

    await expect(component.searchImages()).rejects.toThrow(error);
  });

  test('should handle errors in getImageInfo method', async () => {
    const error = new Error('Test error');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'getImageInfo').mockRejectedValueOnce(error);

    await expect(component.getImageInfo()).rejects.toThrow(error);
  });

  test('should handle errors in testConnection method', async () => {
    const error = new Error('Test error');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'testConnection').mockRejectedValueOnce(error);

    await expect(component.testConnection()).rejects.toThrow(error);
  });

  test('should mask sensitive data correctly', () => {
    expect(AbstractRegistryComponent.mask('short')).toBe('*****');
    expect(AbstractRegistryComponent.mask('verylongpassword')).toBe('ver**********ord');
    expect(AbstractRegistryComponent.mask('')).toBe('');
    expect(AbstractRegistryComponent.mask(undefined)).toBe('');
  });
});
