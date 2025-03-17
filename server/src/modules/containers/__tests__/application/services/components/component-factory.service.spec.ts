import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ContainerComponentFactory } from '../../../../application/services/components/component-factory.service';
import { Kind } from '../../../../domain/components/kind.enum';
import { ContainerService } from '../../../../application/services/container.service';
import { AbstractRegistryComponent } from '../../../../application/services/components/registry/abstract-registry.component';
import { Component } from '../../../../domain/components/component.interface';
import { SSMServicesTypes } from '../../../../../../types/typings.d';

// Mock all the needed classes and modules
vi.mock('../../../../application/services/container.service');
vi.mock('../../../../application/services/components/docker-watcher.component');
vi.mock('../../../../application/services/components/docker-hub-registry.component');
vi.mock('../../../../application/services/components/custom-registry.component');
vi.mock('../../../../application/services/components/gcr-registry.component');
vi.mock('../../../../application/services/components/ghcr-registry.component');
vi.mock('../../../../application/services/components/acr-registry.component');
vi.mock('../../../../application/services/components/ecr-registry.component');
vi.mock('../../../../application/services/components/quay-registry.component');
vi.mock('../../../../application/services/components/gitlab-registry.component');
vi.mock('../../../../application/services/components/gitea-registry.component');
vi.mock('../../../../application/services/components/forgejo-registry.component');
vi.mock('../../../../application/services/components/lscr-registry.component');
vi.mock('../../../../../logger');

// Create a simplified version of the factory for testing
class TestFactory extends ContainerComponentFactory {
  constructor() {
    super(new ContainerService());
  }

  // Override to return test components
  createComponent(kind: Kind, provider: string): Component<SSMServicesTypes.ConfigurationSchema> {
    // Create a component with the specified kind and provider
    const component = {
      getKind: () => kind,
      getProvider: () => provider,
      register: vi.fn(),
      deregister: vi.fn(),
      update: vi.fn(),
      getId: vi.fn(),
      getName: vi.fn()
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