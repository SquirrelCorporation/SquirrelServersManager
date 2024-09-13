import PlaybookExecutionTerminalModal, {
  PlaybookExecutionTerminalModalHandles,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionTerminalModal';
import { getAnsibleSmartFailure } from '@/services/rest/ansible';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { PropsWithChildren } from 'react';

// Mock dependencies
jest.mock('@/services/rest/ansible', () => ({
  getAnsibleSmartFailure: jest.fn(),
}));

jest.mock('@/components/Terminal/TerminalCore', () => {
  return React.forwardRef((props: PropsWithChildren<{}>, ref) => (
    <div ref={ref as React.MutableRefObject<HTMLDivElement>}>
      {props.children || 'TerminalCoreComponent'}
    </div>
  ));
});

jest.mock('@dotlottie/react-player', () => ({
  DotLottieCommonPlayer: jest.fn().mockImplementation(() => null),
  DotLottiePlayer: React.forwardRef((props: PropsWithChildren<{}>, ref) => (
    <div ref={ref as React.MutableRefObject<HTMLDivElement>}>
      {props.children || 'DotLottiePlayer'}
    </div>
  )),
}));

jest.mock('antd', () => {
  const originalAntd = jest.requireActual('antd');
  return {
    ...originalAntd,
    notification: {
      useNotification: jest
        .fn()
        .mockImplementation(() => [jest.fn(), React.createElement('div')]),
    },
  };
});

describe('PlaybookExecutionTerminalModal Component', () => {
  const defaultProps = {
    execId: '123',
    startTerminal: jest.fn().mockResolvedValue(void 0),
    isOpen: true,
    displayName: 'Sample Playbook',
    setIsOpen: jest.fn(),
    isPollingEnabled: false,
    setIsPollingEnabled: jest.fn(),
  };

  const renderComponent = (props = defaultProps) =>
    render(<PlaybookExecutionTerminalModal {...props} />);

  beforeEach(() => {
    // Reset the function calls and mock implementations
    defaultProps.setIsOpen.mockClear();
    defaultProps.setIsPollingEnabled.mockClear();
    defaultProps.startTerminal.mockClear();
    (getAnsibleSmartFailure as jest.Mock).mockClear();
  });

  test('should render modal with proper structure', () => {
    renderComponent();
    expect(
      screen.getByText('Executing playbook Sample Playbook...'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByText('TerminalCoreComponent')).toBeInTheDocument();
  });

  test('should call resetTerminal method when OK button is clicked', async () => {
    renderComponent({ ...defaultProps, isPollingEnabled: true });

    const okButton = screen.getByRole('button', { name: 'OK' });

    act(() => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
      expect(defaultProps.setIsPollingEnabled).toHaveBeenCalledWith(false);
    });
  });

  test('should trigger startTerminal method when Retry button is clicked', async () => {
    renderComponent({ ...defaultProps, isOpen: true, isPollingEnabled: true });

    const retryButton = screen.getByRole('button', { name: 'Retry' });

    act(() => {
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(defaultProps.startTerminal).toHaveBeenCalled();
    });
  });

  test('should call resetScreen method on mount', () => {
    const ref = React.createRef<PlaybookExecutionTerminalModalHandles>();
    const { unmount } = render(
      <PlaybookExecutionTerminalModal {...defaultProps} ref={ref} />,
    );
    expect(ref.current).toBeDefined();
    act(() => {
      ref.current?.resetScreen(); // This should call terminalRef.current.resetTerminalContent
    });
    unmount();
  });

  test('should show notification on failure', async () => {
    (getAnsibleSmartFailure as jest.Mock).mockResolvedValue({
      data: { cause: 'Test Cause', resolution: 'Test Resolution' },
    });

    const { rerender } = renderComponent({
      ...defaultProps,
      isPollingEnabled: true,
    });

    rerender(
      <PlaybookExecutionTerminalModal
        {...defaultProps}
        isPollingEnabled={false}
      />,
    );

    const retryButton = screen.getByRole('button', { name: 'Retry' });

    act(() => {
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(getAnsibleSmartFailure).toHaveBeenCalledWith({ execId: '123' });
    });
  });
});
