import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AbstractRegistryComponent } from '../../../../application/services/components/abstract-registry.component';
import { Kind } from '../../../../domain/components/kind.enum';
import { SSMServicesTypes } from '../../../../../../types/typings.d';

// Create a concrete implementation of AbstractRegistryComponent for testing
class TestRegistryComponent extends AbstractRegistryComponent {
  constructor() {
    super();
    this.provider = 'test';
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
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
    };

    // @ts-ignore - partial mock
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
    const setupSpy = vi.spyOn(component, 'setup' as any);
    
    const config: SSMServicesTypes.ConfigurationSchema = {
      auth: { username: 'test', password: 'password' }
    };
    
    await component.register('test-id', Kind.REGISTRY, 'test-provider', 'test-name', config);
    
    expect(setupSpy).toHaveBeenCalled();
    expect(component.getId()).toBe('registry.test-provider.test-name'); // Match the actual behavior
    expect(component.getName()).toBe('test-name');
    expect(component.getProvider()).toBe('test-provider');
  });

  test('should deregister component correctly', async () => {
    const cleanupSpy = vi.spyOn(component, 'cleanup' as any);
    
    component['id'] = 'test-id';
    component['provider'] = 'test-provider';
    component['name'] = 'test-name';
    
    await component.deregister();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });

  test('should update component configuration', async () => {
    const updateSpy = vi.spyOn(component, 'onConfigurationUpdated' as any);
    
    component['id'] = 'test-id';
    component['provider'] = 'test-provider';
    component['name'] = 'test-name';
    
    const config: SSMServicesTypes.ConfigurationSchema = {
      auth: { username: 'test', password: 'password' }
    };
    
    await component.update(config);
    
    expect(updateSpy).toHaveBeenCalled();
    expect(component['configuration']).toEqual(config);
  });

  test('should handle errors in listImages method', async () => {
    const error = new Error('Test error');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'listImages').mockRejectedValueOnce(error);
    
    await expect(component.listImages()).rejects.toThrow(error);
  });

  test('should handle errors in searchImages method', async () => {
    const error = new Error('Test error');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'searchImages').mockRejectedValueOnce(error);
    
    await expect(component.searchImages()).rejects.toThrow(error);
  });

  test('should handle errors in getImageInfo method', async () => {
    const error = new Error('Test error');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'getImageInfo').mockRejectedValueOnce(error);
    
    await expect(component.getImageInfo('')).rejects.toThrow(error);
  });

  test('should handle errors in testConnection method', async () => {
    const error = new Error('Test error');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(component, 'testConnection').mockRejectedValueOnce(error);
    
    await expect(component.testConnection()).rejects.toThrow(error);
  });
});