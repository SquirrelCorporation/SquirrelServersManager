import React, { useEffect, useRef, useState } from 'react';
import { Modal, Select, Button, Space, Typography } from 'antd';
import TerminalCore from '@/components/Terminal/TerminalCore';
import type { API } from 'ssm-shared-lib';
import { SsmEvents } from 'ssm-shared-lib';
import { rsiDebugSocket as socket } from '@/socket';

const { Text } = Typography;
const { Option } = Select;

// Standard terminal color codes
const COLOR_RESET = '\x1b[0m';
const COLOR_RED = '\x1b[31m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_BLUE = '\x1b[34m';
const COLOR_CYAN = '\x1b[36m';
const COLOR_WHITE = '\x1b[37m';

export interface RemoteSystemInformationTerminalProps {
  visible: boolean;
  onClose: () => void;
  device: Partial<API.DeviceItem>;
}

const modalStyles = {
  body: {
    height: '600px',
  },
};

const RemoteSystemInformationTerminal: React.FC<
  RemoteSystemInformationTerminalProps
> = ({ visible, onClose, device }) => {
  const terminalRef = useRef<any>(null);
  const [componentName, setComponentName] = useState<string>('cpu');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Terminal content management
  const addToTerminal = (
    text: string,
    type?: 'command' | 'success' | 'error' | 'info',
  ) => {
    if (terminalRef.current) {
      switch (type) {
        case 'command':
          terminalRef.current.onDataIn(
            `${COLOR_CYAN}$ ${text}${COLOR_RESET}`,
            true,
          );
          break;
        case 'success':
          terminalRef.current.onDataIn(
            `${COLOR_GREEN}${text}${COLOR_RESET}`,
            true,
          );
          break;
        case 'error':
          terminalRef.current.onDataIn(
            `${COLOR_RED}${text}${COLOR_RESET}`,
            true,
          );
          break;
        case 'info':
          terminalRef.current.onDataIn(
            `${COLOR_BLUE}${text}${COLOR_RESET}`,
            true,
          );
          break;
        default:
          terminalRef.current.onDataIn(text, true);
      }
    }
  };

  // Initialize socket connection
  useEffect(() => {
    // Log for debugging
    console.log('Setting up RSI debug socket...');

    // First, clear the terminal to show connection attempt
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.resetTerminalContent();
        terminalRef.current.onDataIn('Connecting to debug server...', true);
      }
    }, 100);

    // Additional logging for all socket events
    socket.onAny((event, ...args) => {
      console.log(`[Socket Event] ${event}:`, args);
    });

    // Remove existing listeners to avoid duplicates
    socket.off('connect');
    socket.off('connect_error');
    socket.off('disconnect');
    socket.off('error');
    socket.off(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMMAND);
    socket.off(SsmEvents.RemoteSystemInfoDebug.DEBUG_ERROR);

    // Setup socket event listeners
    socket.on('connect', () => {
      console.log('RSI debug socket connected:', {
        id: socket.id,
        connected: socket.connected,
      });
      addToTerminal('Connected to debug server.', 'success');
    });

    socket.on('connect_error', (error) => {
      console.error('RSI debug socket connection error:', error);
      addToTerminal(`Connection error: ${error.message}`, 'error');
    });

    socket.on('disconnect', (reason) => {
      console.log('RSI debug socket disconnected:', reason);
      addToTerminal(`Disconnected from debug server: ${reason}`, 'error');
    });

    socket.on('error', (error) => {
      console.error('RSI debug socket error:', error);
      addToTerminal(`Socket error: ${error}`, 'error');
    });

    socket.on(
      SsmEvents.RemoteSystemInfoDebug.DEBUG_COMMAND,
      (data: { command: string; response: string; success: boolean }) => {
        console.log('Received debug command event:', data);
        addToTerminal(data.command, 'command');
        if (data.response) {
          addToTerminal(data.response, data.success ? 'success' : 'error');
        }
      },
    );

    socket.on(
      SsmEvents.RemoteSystemInfoDebug.DEBUG_ERROR,
      (data: { error: string }) => {
        console.error('Received debug error:', data);
        addToTerminal(`Error: ${data.error}`, 'error');
        setIsExecuting(false);
      },
    );

    // Connect the socket
    socket.connect();

    // Show connection attempt in terminal
    if (terminalRef.current) {
      terminalRef.current.onDataIn(
        `${COLOR_YELLOW}Connecting to WebSocket server...${COLOR_RESET}`,
        true,
      );
    }

    return () => {
      socket.emit(SsmEvents.RemoteSystemInfoDebug.DEBUG_ERROR, {
        error: 'Client disconnected',
      });
      socket.off(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMMAND);
      socket.off(SsmEvents.RemoteSystemInfoDebug.DEBUG_ERROR);
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('error');
      socket.disconnect();
    };
  }, []);

  // Execute component debugging
  const executeDebug = () => {
    console.log('Execute button clicked:', {
      socketId: socket.id,
      socketConnected: socket.connected,
      deviceUuid: device.uuid,
      executing: isExecuting,
      componentName,
    });

    if (!device.uuid) {
      console.error('Cannot execute: Device UUID is missing');
      addToTerminal(`Error: Device UUID is missing.`, 'error');
      return;
    }

    if (isExecuting) {
      console.warn('Cannot execute: Already executing a command');
      addToTerminal(`Warning: Already executing a command.`, 'info');
      return;
    }

    if (!socket.connected) {
      console.warn('Socket not connected, attempting to connect...');
      addToTerminal(`Socket not connected, attempting to reconnect...`, 'info');
      socket.connect();

      // Wait a moment for connection before proceeding
      setTimeout(() => {
        if (socket.connected) {
          console.log('Socket reconnected successfully, now executing');
          executeDebugCommand();
        } else {
          console.error('Failed to reconnect socket');
          addToTerminal(`Failed to reconnect to debug server.`, 'error');
          setIsExecuting(false);
        }
      }, 1000);
      return;
    }

    executeDebugCommand();
  };

  // Separate function to execute the debug command
  const executeDebugCommand = () => {
    setIsExecuting(true);
    addToTerminal(
      `Executing ${componentName} component in debug mode...`,
      'info',
    );

    console.log('Emitting debug component event:', {
      deviceUuid: device.uuid,
      componentName,
      socketId: socket.id,
      socketConnected: socket.connected,
    });

    const eventData = {
      deviceUuid: device.uuid,
      componentName,
    };

    try {
      // Use emitWithAck pattern as seen in other components
      socket
        .emitWithAck(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMPONENT, eventData)
        .then((response) => {
          console.log('Received acknowledgment:', response);
          if (!response.success) {
            addToTerminal(
              `Error: ${response.error || 'Unknown error'}`,
              'error',
            );
            setIsExecuting(false);
          }
        })
        .catch((error) => {
          console.error('Error executing command:', error);
          addToTerminal(`Error: ${error.message || 'Unknown error'}`, 'error');
          setIsExecuting(false);
        });

      console.log('Event emitted successfully');
    } catch (error: any) {
      console.error('Error emitting event:', error);
      addToTerminal(`Error sending command: ${error.message}`, 'error');
      setIsExecuting(false);
    }

    // Add a timeout to ensure we don't get stuck in executing state
    setTimeout(() => {
      console.log('Execution timeout reached, resetting state');
      setIsExecuting(false);
    }, 30000); // 30 second timeout
  };

  // Effect for initializing terminal content
  useEffect(() => {
    if (terminalRef.current && visible) {
      // Clear the terminal first
      terminalRef.current.resetTerminalContent();

      // Add welcome message
      terminalRef.current.onDataIn(
        'Remote System Information Debug Terminal',
        true,
      );
      terminalRef.current.onDataIn(
        'Select a component and click "Execute" to see commands in real-time.',
        true,
      );
      terminalRef.current.onDataIn('', true);
    }
  }, [visible]);

  // Component options for the select dropdown
  const componentOptions = [
    { label: 'CPU', value: 'cpu' },
    { label: 'Memory', value: 'mem' },
    { label: 'File System', value: 'filesystem' },
    { label: 'System', value: 'system' },
    { label: 'OS', value: 'os' },
    { label: 'WiFi', value: 'wifi' },
    { label: 'USB', value: 'usb' },
    { label: 'Graphics', value: 'graphics' },
    { label: 'Bluetooth', value: 'bluetooth' },
    { label: 'Network Interfaces', value: 'networkinterfaces' },
    { label: 'Versions', value: 'versions' },
  ];

  return (
    <Modal
      title={`Debug System Information - ${device.fqdn}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
      styles={modalStyles}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Text strong>Component:</Text>
          <Select
            value={componentName}
            onChange={setComponentName}
            style={{ width: 200 }}
            disabled={isExecuting}
          >
            {componentOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={executeDebug}
            loading={isExecuting}
            disabled={!socket.connected}
          >
            Execute
          </Button>
        </Space>

        <div
          style={{
            height: '500px',
            width: '100%',
          }}
        >
          <TerminalCore
            ref={terminalRef}
            disableStdin={true}
            convertEol={true}
            rows={35}
            cols={130}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default RemoteSystemInformationTerminal;
