import { vi } from 'vitest';

// Mock component enum
export enum ComponentKind {
  Registry = 'registry',
  Network = 'network',
  Volume = 'volume',
  Container = 'container',
}

// Mock Component class
export class Component {
  kind = ComponentKind.Registry;
  name = 'component';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  match() {
    return true;
  }

  // Add other methods as needed by the tests
  validateConfiguration(config: any) {
    return config;
  }
}
