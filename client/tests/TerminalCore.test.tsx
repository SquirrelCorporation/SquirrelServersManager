import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock fitAddon and xterm Terminal
const mockFit = jest.fn();
const mockTerminalInstance = {
  open: jest.fn(),
  loadAddon: jest.fn(),
  writeln: jest.fn(),
  write: jest.fn(),
  clear: jest.fn(),
  onData: jest.fn(),
  focus: jest.fn(),
};

jest.mock('@xterm/addon-fit', () => {
  return {
    FitAddon: jest.fn().mockImplementation(() => ({
      fit: mockFit,
    })),
  };
});

jest.mock('xterm', () => {
  return {
    Terminal: jest.fn().mockImplementation(() => mockTerminalInstance),
  };
});

describe('TerminalCore Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the terminal component', () => {
    const { container } = render(<TerminalCore />);
    const terminalElement = container.querySelector('div');
    expect(terminalElement).toBeInTheDocument();
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
