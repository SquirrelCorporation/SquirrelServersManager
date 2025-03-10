import { beforeEach, describe, expect, it } from 'vitest';
import { ShellWrapperService } from '../../../application/services/shell-wrapper.service';

describe('ShellWrapperService', () => {
  let service: ShellWrapperService;

  beforeEach(() => {
    service = new ShellWrapperService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all required methods', () => {
    expect(service.mkdir).toBeDefined();
    expect(service.rm).toBeDefined();
    expect(service.cat).toBeDefined();
    expect(service.echo).toBeDefined();
    expect(service.touch).toBeDefined();
    expect(service.test).toBeDefined();
    expect(service.chmod).toBeDefined();
    expect(service.cp).toBeDefined();
    expect(service.ln).toBeDefined();
    expect(service.exec).toBeDefined();
    expect(service.to).toBeDefined();
  });
});