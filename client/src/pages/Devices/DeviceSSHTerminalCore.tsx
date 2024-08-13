import React, { useState } from 'react';
import {
  ReactTerminal,
  TerminalContextProvider,
  TerminalContext,
} from 'react-terminal';
import styles from './DeviceSSHTerminalCore.less';

const DeviceSSHTerminalCore = () => {
  const { setBufferedContent } = React.useContext(TerminalContext);

  const [enableInput, setEnableInput] = useState<boolean>(true);
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const defaultHander = async (value: string) => {
    setEnableInput(false);
    console.log(value);
    return await timeout(3000).then(() => {
      setEnableInput(true);
      return (
        <>
          test
          <br />
          <br />
          test
        </>
      );
      //setBufferedContent((previous) => <>test</>);
    });
  };
  return (
    <div className={styles.terminal}>
      <ReactTerminal
        theme="material-dark"
        showControlBar={false}
        showControlButtons={false}
        enableInput={enableInput}
        prompt={'$'}
        defaultHandler={defaultHander}
      />
    </div>
  );
};

export default DeviceSSHTerminalCore;
