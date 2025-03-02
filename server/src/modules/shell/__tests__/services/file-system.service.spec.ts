import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileSystemService } from '../../services/file-system.service';
import { ShellWrapperService } from '../../services/shell-wrapper.service';

// Create a mock base that can be referenced
class MockShellWrapperService {
  mkdir = vi.fn().mockReturnValue({ code: 0 });
  rm = vi.fn().mockReturnValue({ code: 0 });
  cat = vi.fn().mockReturnValue({ toString: () => 'file content', code: 0 });
  to = vi.fn();
  cp = vi.fn().mockReturnValue({ code: 0 });
  test = vi.fn().mockReturnValue(true);
  echo = vi.fn();
  touch = vi.fn();
  chmod = vi.fn();
  ln = vi.fn();
  cd = vi.fn();
  exec = vi.fn();
}

describe('FileSystemService', () => {
  let service: FileSystemService;
  let shellWrapperService: MockShellWrapperService;

  beforeEach(async () => {
    // Create service instance with mock
    shellWrapperService = new MockShellWrapperService();

    // The key issue: We need to fix the executeCommand issue for bound methods
    // Mock internal executeCommand method to call the function directly
    service = new FileSystemService(shellWrapperService as unknown as ShellWrapperService);

    // Use spyOn to mock the executeCommand method which is internal
    // This replaces the method with one that calls the function directly
    const executeCommandSpy = vi.spyOn(service as any, 'executeCommand');
    executeCommandSpy.mockImplementation((fn: any, ...args: any[]) => {
      return fn(...args);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDirectory', () => {
    it('should create a directory', () => {
      const result = service.createDirectory('/tmp/test');
      expect(shellWrapperService.mkdir).toHaveBeenCalledWith('-p', '/tmp/test');
      expect(result).toEqual({ code: 0 });
    });

    it('should throw error if path is outside root directory', () => {
      expect(() => service.createDirectory('../outside', '/root')).toThrow(
        'Attempt to manipulate a file or directory outside the root directory',
      );
    });
  });

  describe('deleteFiles', () => {
    it('should delete files', () => {
      service.deleteFiles('/tmp/test');
      expect(shellWrapperService.rm).toHaveBeenCalledWith('-rf', '/tmp/test');
    });
  });

  describe('readFile', () => {
    it('should read a file', () => {
      const content = service.readFile('/tmp/test.txt');
      expect(shellWrapperService.cat).toHaveBeenCalledWith('/tmp/test.txt');
      expect(content).toBe('file content');
    });
  });

  describe('writeFile', () => {
    it('should write to a file', () => {
      service.writeFile('content', '/tmp/test.txt');
      expect(shellWrapperService.to).toHaveBeenCalledWith('content', '/tmp/test.txt');
    });
  });

  describe('copyFile', () => {
    it('should copy a file', () => {
      const result = service.copyFile('/tmp/source.txt', '/tmp/dest.txt');
      expect(shellWrapperService.cp).toHaveBeenCalledWith('/tmp/source.txt', '/tmp/dest.txt');
      expect(result).toEqual({ code: 0 });
    });
  });

  describe('test', () => {
    it('should test if a file exists', () => {
      const result = service.test('-f', '/tmp/test.txt');
      expect(shellWrapperService.test).toHaveBeenCalledWith('-f', '/tmp/test.txt');
      expect(result).toBe(true);
    });
  });
});
