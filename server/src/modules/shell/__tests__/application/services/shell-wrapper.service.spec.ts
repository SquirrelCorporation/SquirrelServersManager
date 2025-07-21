import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShellWrapperService } from '../../../application/services/shell-wrapper.service';

// Mocking the actual shell-wrapper since we don't want to execute real shell commands
vi.mock('../../../infrastructure/shell-wrapper', () => ({
  ShellWrapper: {
    mkdir: vi.fn().mockReturnValue({ code: 0 }),
    rm: vi.fn().mockReturnValue({ code: 0 }),
    cat: vi.fn().mockReturnValue({ toString: () => 'file content', code: 0 }),
    echo: vi.fn().mockReturnValue({ code: 0 }),
    touch: vi.fn().mockReturnValue({ code: 0 }),
    test: vi.fn().mockReturnValue(true),
    chmod: vi.fn().mockReturnValue({ code: 0 }),
    cp: vi.fn().mockReturnValue({ code: 0 }),
    ln: vi.fn().mockReturnValue({ code: 0 }),
    exec: vi.fn().mockReturnValue({ stdout: 'command output', code: 0 }),
    cd: vi.fn().mockReturnValue({ code: 0 }),
    to: vi.fn().mockReturnValue({ code: 0 }),
  },
}));

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
    expect(service.cd).toBeDefined();
    expect(service.to).toBeDefined();
  });

  describe('mkdir', () => {
    it('should call the infrastructure mkdir method', () => {
      const result = service.mkdir('-p', '/some/dir');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('rm', () => {
    it('should call the infrastructure rm method', () => {
      const result = service.rm('-rf', '/some/dir');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('cat', () => {
    it('should call the infrastructure cat method', () => {
      const result = service.cat('/some/file.txt');
      expect(result.toString()).toBe('file content');
    });
  });

  describe('echo', () => {
    it('should call the infrastructure echo method', () => {
      const result = service.echo('Hello world');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('touch', () => {
    it('should call the infrastructure touch method', () => {
      const result = service.touch('/some/file.txt');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('test', () => {
    it('should call the infrastructure test method', () => {
      const result = service.test('-f', '/some/file.txt');
      expect(result).toBe(true);
    });
  });

  describe('chmod', () => {
    it('should call the infrastructure chmod method', () => {
      const result = service.chmod('755', '/some/file.txt');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('cp', () => {
    it('should call the infrastructure cp method', () => {
      const result = service.cp('/some/source.txt', '/some/dest.txt');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('ln', () => {
    it('should call the infrastructure ln method', () => {
      const result = service.ln('-s', '/some/source', '/some/link');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('exec', () => {
    it('should call the infrastructure exec method', () => {
      const result = service.exec('ls -la');
      expect(result).toEqual({ stdout: 'command output', code: 0 });
    });
  });

  describe('cd', () => {
    it('should call the infrastructure cd method', () => {
      const result = service.cd('/some/dir');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('to', () => {
    it('should call the infrastructure to method', () => {
      const result = service.to('content', '/some/file.txt');
      expect(result).toEqual({ code: 0 });
    });
  });
});
