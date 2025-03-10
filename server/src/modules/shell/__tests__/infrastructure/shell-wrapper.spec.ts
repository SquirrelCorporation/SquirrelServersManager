import { describe, expect, it } from 'vitest';
import { ShellWrapper } from '../../infrastructure/shell-wrapper';

describe('ShellWrapper', () => {
  it('should be defined', () => {
    expect(ShellWrapper).toBeDefined();
  });

  it('should have all required methods', () => {
    expect(ShellWrapper.mkdir).toBeDefined();
    expect(ShellWrapper.rm).toBeDefined();
    expect(ShellWrapper.cat).toBeDefined();
    expect(ShellWrapper.echo).toBeDefined();
    expect(ShellWrapper.touch).toBeDefined();
    expect(ShellWrapper.test).toBeDefined();
    expect(ShellWrapper.chmod).toBeDefined();
    expect(ShellWrapper.cp).toBeDefined();
    expect(ShellWrapper.ln).toBeDefined();
    expect(ShellWrapper.exec).toBeDefined();
    expect(ShellWrapper.to).toBeDefined();
  });
});