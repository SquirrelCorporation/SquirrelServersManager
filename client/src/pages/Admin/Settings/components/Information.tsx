import { useModel } from '@umijs/max';
import { Flex } from 'antd';
import React from 'react';
import { version } from '../../../../../package.json';

const Information: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  return (
    <Flex vertical gap={32} style={{ width: '50%' }}>
      <table style={{ border: '1px solid white' }}>
        <tbody>
          <tr>
            <td>Client Version</td>
            <td>{version}</td>
          </tr>
          <tr>
            <td>Server Version</td>
            <td>{currentUser?.settings?.server.version}</td>
          </tr>
          <tr>
            <td>Server Deps</td>
            <td>
              <table style={{ border: '1px dashed white' }}>
                <tbody>
                  {Object.keys(currentUser?.settings?.server.deps).map((e) => (
                    <tr key={e}>
                      <td>{e}</td>
                      <td>{currentUser?.settings?.server.deps[e]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>Server Processes</td>
            <td>
              <table style={{ border: '1px dashed white' }}>
                <tbody>
                  {Object.keys(currentUser?.settings?.server.processes).map((e) => (
                    <tr key={e}>
                      <td>{e}</td>
                      <td>{currentUser?.settings?.server.processes[e]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Flex>
  );
};

export default Information;
