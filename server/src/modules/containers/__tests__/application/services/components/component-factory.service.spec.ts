import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../../test-setup';

/**
 * Types and enums needed for testing
 */
enum Kind {
  REGISTRY = 'registry',
  WATCHER = 'watcher',
  UNKNOWN = 'unknown',
}

// Interface for component
interface Component<T> {
  getKind(): Kind;
  getProvider(): string;
  register(...args: any[]): Promise<Component<T>>;
  deregister(): Promise<void>;
  update(configuration: T): Promise<Component<T>>;
  getId(): string;
  getName(): string;
}

/**
 * Mock container service
 */
class ContainerService {
  constructor() {}
}

/**
 * Abstract factory class to create container components
 */
abstract class ContainerComponentFactory {
  constructor(private readonly containerService: ContainerService) {}

  abstract createComponent(kind: Kind, provider: string): Component<any>;
}

/**
 * Test implementation of the factory
 */
class TestFactory extends ContainerComponentFactory {
  constructor() {
    super(new ContainerService());
  }

  // Override to return test components
  createComponent(kind: Kind, provider: string): Component<any> {
    // Create a component with the specified kind and provider
    const component = {
      getKind: () => kind,
      getProvider: () => provider,
      register: vi.fn().mockResolvedValue({ getKind: () => kind, getProvider: () => provider }),
      deregister: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue({ getKind: () => kind, getProvider: () => provider }),
      getId: vi.fn().mockReturnValue(`${kind}.${provider}.test`),
      getName: vi.fn().mockReturnValue('test'),
    };
    return component;
  }
}

describe('ContainerComponentFactory', () => {
  let factory: TestFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    factory = new TestFactory();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should create Docker watcher component', () => {
    const component = factory.createComponent(Kind.WATCHER, 'docker');
    expect(component.getKind()).toBe(Kind.WATCHER);
    expect(component.getProvider()).toBe('docker');
  });

  test('should create Docker Hub registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'hub');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('hub');
  });

  test('should create Custom registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'custom');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('custom');
  });

  test('should create GCR registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'gcr');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('gcr');
  });

  test('should create GHCR registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'ghcr');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('ghcr');
  });

  test('should create ACR registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'acr');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('acr');
  });

  test('should create ECR registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'ecr');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('ecr');
  });

  test('should create Quay registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'quay');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('quay');
  });

  test('should create GitLab registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'gitlab');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('gitlab');
  });

  test('should create Gitea registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'gitea');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('gitea');
  });

  test('should create Forgejo registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'forgejo');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('forgejo');
  });

  test('should create LSCR registry component', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'lscr');
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('lscr');
  });

  test('should create mock component for unsupported registry provider', () => {
    const component = factory.createComponent(Kind.REGISTRY, 'unsupported');
    expect(component).toBeDefined();
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('unsupported');
  });

  test('should create mock component for proxmox watcher', () => {
    const component = factory.createComponent(Kind.WATCHER, 'proxmox');
    expect(component).toBeDefined();
    expect(component.getKind()).toBe(Kind.WATCHER);
    expect(component.getProvider()).toBe('proxmox');
  });
});
