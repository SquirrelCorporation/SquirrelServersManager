import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TerminalCore, {
  TerminalCoreHandles,
} from '../src/components/Terminal/TerminalCore';

// Mock fitAddon and xterm Terminal
const mockFit = vi.fn();
const mockTerminalInstance = {
  open: vi.fn(),
  loadAddon: vi.fn(),
  writeln: vi.fn(),
  write: vi.fn(),
  clear: vi.fn(),
  onData: vi.fn(),
  focus: vi.fn(),
};

vi.mock('@xterm/addon-fit', () => {
  return {
    FitAddon: vi.fn().mockImplementation(() => ({
      fit: mockFit,
    })),
  };
});

vi.mock('xterm', () => {
  return {
    Terminal: vi.fn().mockImplementation(() => mockTerminalInstance),
  };
});

describe('TerminalCore Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render the terminal component', () => {
    const { container } = render(<TerminalCore />);
    const terminalElement = container.querySelector('div');
    expect(terminalElement).not.to.be.null;
  });

  test('should call terminal methods on resize', () => {
    render(<TerminalCore />);
    fireEvent(window, new Event('resize'));
    expect(mockFit).toHaveBeenCalled();
  });

  test('should handle onDataIn correctly', () => {
    const ref = React.createRef<TerminalCoreHandles>();
    render(<TerminalCore ref={ref} />);
    ref.current?.onDataIn('test data');
    expect(mockTerminalInstance.write).toHaveBeenCalledWith('test data');
  });

  test('should handle resetTerminalContent correctly', () => {
    const ref = React.createRef<TerminalCoreHandles>();
    render(<TerminalCore ref={ref} />);
    ref.current?.resetTerminalContent();
    expect(mockTerminalInstance.clear).toHaveBeenCalled();
  });

  test('should forward ref correctly', () => {
    const ref = React.createRef<TerminalCoreHandles>();
    render(<TerminalCore ref={ref} />);
    expect(ref.current?.onDataIn).toBeInstanceOf(Function);
    expect(ref.current?.resetTerminalContent).toBeInstanceOf(Function);
  });
});
