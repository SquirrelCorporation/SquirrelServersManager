import { Component } from '@modules/containers/application/services/components/core/component';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import { describe, expect, test, vi } from 'vitest';
import '../../../test-setup';

// Create a mock EventEmitterService
const mockEventEmitterService = {
  emit: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
};

// Create a concrete implementation of the abstract Component class for testing
class TestComponent extends Component<any> {
  constructor() {
    super(mockEventEmitterService as any);
  }
}

describe('Component Tests', () => {
  test('should mask sensitive data correctly', () => {
    // Test the static mask method
    expect(Component.mask('password')).toBe('p******d');
    expect(Component.mask('token', 2, '*')).toBe('to*en');
    expect(Component.mask('abc')).toBe('a*c');
    expect(Component.mask('ab')).toBe('ab');
    expect(Component.mask('')).toBe(undefined);
    expect(Component.mask(undefined)).toBe(undefined);
  });

  test('should correctly set component properties during registration', async () => {
    const component = new TestComponent();

    await component.register('test-id', Kind.REGISTRY, 'test-type', 'test-name', {
      property1: 'value1',
      property2: 'value2',
    });

    expect(component._id).toBe('test-id');
    expect(component.kind).toBe(Kind.REGISTRY);
    expect(component.type).toBe('test-type');
    expect(component.name).toBe('test-name');
    expect(component.configuration).toEqual({
      property1: 'value1',
      property2: 'value2',
    });
  });

  test('should return the correct component ID', async () => {
    const component = new TestComponent();

    await component.register('test-id', Kind.WATCHER, 'test-type', 'test-name', {});

    expect(component.getId()).toBe('watcher.test-type.test-name');
  });
});
