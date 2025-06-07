import { vi } from 'vitest';
import { Kind } from './kind-mock';

// Mock for the Component class
export abstract class Component<T> {
  protected _id: string = '';
  kind: string = '';
  type: string = '';
  name: string = '';
  configuration: T = {} as T;
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  constructor(protected eventEmitter: any) {}

  // Static mask method for testing
  static mask(
    value: string | undefined,
    padLength: number = 1,
    maskChar: string = '*',
  ): string | undefined {
    if (value === '') {
      return undefined;
    }
    if (!value || value.length < 3) {
      return value;
    }

    const start = value.substring(0, padLength);
    const end = value.substring(value.length - padLength);
    const middle = maskChar.repeat(value.length - padLength * 2);

    return start + middle + end;
  }

  // Register method
  async register(
    id: string,
    kind: Kind,
    type: string,
    name: string,
    configuration: T,
  ): Promise<void> {
    this._id = id;
    this.kind = kind;
    this.type = type;
    this.name = name;
    this.configuration = configuration;
  }

  // Get ID method
  getId(): string {
    return `${this.kind}.${this.type}.${this.name}`;
  }
}
