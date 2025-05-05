import { FitAddon } from '@xterm/addon-fit';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
import 'xterm/css/xterm.css';

export interface TerminalCoreHandles {
  onDataIn: (value: string, newLine?: boolean) => void;
  resetTerminalContent: () => void;
}

export type TerminalCoreProps = {
  onDataOut?: (value: string) => void;
  disableStdin?: boolean;
  rows?: number;
  cols?: number;
  convertEol?: boolean;
  onResize?: (rows: number, cols: number) => void;
};

const TerminalCore = React.forwardRef<TerminalCoreHandles, TerminalCoreProps>(
  (
    {
      onDataOut,
      disableStdin = false,
      convertEol,
      rows = Math.ceil(document.body.clientHeight / 16),
      cols = Math.ceil(document.body.clientWidth / 8),
      onResize,
    },
    ref,
  ) => {
    const terminalProps: ITerminalOptions = {
      disableStdin: disableStdin,
      cursorStyle: 'underline',
      cursorBlink: true,
      allowTransparency: true,
      fontSize: 12,
      fontFamily: 'Menlo, Monaco, Consolas, monospace',
      convertEol: convertEol,
    };

    const terminal = useMemo(
      () => new Terminal({ ...terminalProps, rows: rows, cols: cols }),
      [],
    );
    const [terminalElement, setTerminalElement] =
      useState<HTMLDivElement | null>(null);
    const terminalRef = useCallback(
      (node: React.SetStateAction<HTMLDivElement | null>) =>
        setTerminalElement(node),
      [],
    );
    const fitAddon = new FitAddon();

    function resizeScreen() {
      if (terminal) {
        fitAddon.fit();
        onResize?.(terminal.rows, terminal.cols);
      }
    }

    window.addEventListener('resize', resizeScreen, false);

    const onDataIn = (value: string, newLine?: boolean) => {
      if (newLine) {
        terminal?.writeln(value);
      } else {
        terminal?.write(value);
      }
    };

    const resetTerminalContent = () => {
      terminal?.clear();
    };

    useImperativeHandle(ref, () => ({
      onDataIn,
      resetTerminalContent,
    }));

    useEffect(() => {
      if (terminalElement && !terminal.element) {
        terminal.open(terminalElement);
        terminal.loadAddon(fitAddon);
        if (onDataOut) {
          terminal.onData((value) => {
            console.log('Received data from terminal:', value);
            onDataOut(value);
          });
        }
        fitAddon.fit();
        terminal.focus();
      }
    }, [terminal, terminalElement]);

    return <div ref={terminalRef} />;
  },
);

export default TerminalCore;
