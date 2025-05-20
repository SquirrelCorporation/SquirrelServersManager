import { describe, expect, it, vi } from 'vitest';
import { ShellWrapper } from '../../infrastructure/shell-wrapper';
import shell from 'shelljs';

// Mock ShellJS
vi.mock('shelljs', () => ({
  default: {
    mkdir: vi.fn(),
    rm: vi.fn(),
    cat: vi.fn(),
    echo: vi.fn(),
    touch: vi.fn(),
    test: vi.fn(),
    chmod: vi.fn(),
    cp: vi.fn(),
    ln: vi.fn(),
    exec: vi.fn(),
    cd: vi.fn(),
    ShellString: vi.fn((content) => ({
      to: vi.fn(),
      toString: () => content,
    })),
  }
}));

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
    expect(ShellWrapper.cd).toBeDefined();
    expect(ShellWrapper.to).toBeDefined();
  });

  describe('Methods binding', () => {
    it('should bind ShellJS methods correctly', () => {
      // Call wrapper methods
      ShellWrapper.mkdir('-p', '/tmp/test');
      ShellWrapper.rm('-rf', '/tmp/test');
      ShellWrapper.cat('/tmp/test/file.txt');
      ShellWrapper.echo('Hello world');
      ShellWrapper.touch('/tmp/test/file.txt');
      ShellWrapper.test('-f', '/tmp/test/file.txt');
      ShellWrapper.chmod('755', '/tmp/test/file.txt');
      ShellWrapper.cp('/tmp/test/source.txt', '/tmp/test/dest.txt');
      ShellWrapper.ln('-s', '/tmp/test/source', '/tmp/test/link');
      ShellWrapper.exec('ls -la');
      ShellWrapper.cd('/tmp/test');

      // Verify ShellJS methods were called
      expect(shell.mkdir).toHaveBeenCalledWith('-p', '/tmp/test');
      expect(shell.rm).toHaveBeenCalledWith('-rf', '/tmp/test');
      expect(shell.cat).toHaveBeenCalledWith('/tmp/test/file.txt');
      expect(shell.echo).toHaveBeenCalledWith('Hello world');
      expect(shell.touch).toHaveBeenCalledWith('/tmp/test/file.txt');
      expect(shell.test).toHaveBeenCalledWith('-f', '/tmp/test/file.txt');
      expect(shell.chmod).toHaveBeenCalledWith('755', '/tmp/test/file.txt');
      expect(shell.cp).toHaveBeenCalledWith('/tmp/test/source.txt', '/tmp/test/dest.txt');
      expect(shell.ln).toHaveBeenCalledWith('-s', '/tmp/test/source', '/tmp/test/link');
      expect(shell.exec).toHaveBeenCalledWith('ls -la');
      expect(shell.cd).toHaveBeenCalledWith('/tmp/test');
    });
  });

  describe('to method', () => {
    it('should use ShellString to write content to a file', () => {
      const content = 'Hello world';
      const path = '/tmp/test/file.txt';
      const shellStringToSpy = vi.fn();
      
      // Mock ShellString for this specific test
      (shell.ShellString as any).mockReturnValueOnce({
        to: shellStringToSpy,
        toString: () => content,
      });
      
      ShellWrapper.to(content, path);
      
      // Verify ShellString was created with content
      expect(shell.ShellString).toHaveBeenCalledWith(content);
      
      // Verify .to() was called on the ShellString
      expect(shellStringToSpy).toHaveBeenCalledWith(path);
    });
  });
});