import React from 'react';
import { API } from 'ssm-shared-lib';

export interface TerminalLogsProps {
  previous: any;
  terminalContentStyle: any;
  execLog: API.ExecLog;
}
const TerminalLogs: React.FC<TerminalLogsProps> = (props) => {
  const { previous, terminalContentStyle, execLog } = props;
  let braces = 0;
  return (
    <>
      {previous}
      <span style={terminalContentStyle}>
        {execLog.stdout?.split('\n')?.map((e, index, array) => {
          return (
            <>
              {e.split('\\r\\n')?.map((f) => {
                braces +=
                  (f.match(/\{/g)?.length || [].length) -
                  (f.match(/}/g)?.length || [].length);
                return (
                  <>
                    {/* Small trick to render &nbsp; for json object */}
                    {'\u00A0'.repeat(braces < 0 ? 0 : braces)}
                    {f}
                  </>
                );
              })}
              {e !== '' && index < array.length - 1 ? <br /> : ''}
            </>
          );
        })}
      </span>
      <br />
    </>
  );
};

export default TerminalLogs;
