import {
  getMongoDBServerStats,
  getPrometheusServerStats,
  getRedisServerStats,
} from '@/services/rest/settings';
import { useModel } from '@umijs/max';
import { Descriptions, Flex, Popover, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import JsonFormatter from 'react-json-formatter';
import { API } from 'ssm-shared-lib';
import { version } from '../../../../../package.json';

const jsonStyle = {
  propertyStyle: { color: '#3b6b87' },
  stringStyle: { color: '#538091' },
  numberStyle: { color: '#614b98' },
};

const Information: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [mongoDbStats, setMongoDbStats] = useState<
    API.MongoDBServerStats | 'error'
  >();
  const [redisStats, setRedisStats] = useState<
    API.RedisServerStats | 'error'
  >();
  const [prometheusStats, setPrometheusStats] = useState<
    API.PrometheusServerStats | 'error'
  >();

  const getMongoDbStats = async () => {
    await getMongoDBServerStats()
      .then((res) => {
        setMongoDbStats(res.data);
      })
      .catch(() => setMongoDbStats('error'));
  };

  const getRedisStats = async () => {
    await getRedisServerStats()
      .then((res) => {
        setRedisStats(res.data);
      })
      .catch(() => setRedisStats('error'));
  };

  const getPrometheusStats = async () => {
    await getPrometheusServerStats()
      .then((res) => {
        setPrometheusStats(res.data);
      })
      .catch(() => setPrometheusStats('error'));
  };

  useEffect(() => {
    void getMongoDbStats();
    void getRedisStats();
    void getPrometheusStats();
  }, []);

  return (
    <Flex vertical gap={32} style={{ width: '80%' }}>
      <Descriptions bordered title="Databases">
        <Descriptions.Item label="MongoDB" span={24}>
          {(mongoDbStats && (
            <>
              {(mongoDbStats === 'error' && <>🔴</>) || (
                <Popover
                  content={
                    <div style={{ overflowY: 'scroll', height: '400px' }}>
                      <JsonFormatter
                        json={mongoDbStats}
                        tabWith={4}
                        jsonStyle={jsonStyle}
                      />
                    </div>
                  }
                >
                  🟢
                </Popover>
              )}
            </>
          )) || <Spin size="small" />}
        </Descriptions.Item>
        <Descriptions.Item label="Redis" span={24}>
          {(redisStats && (
            <>
              {(redisStats === 'error' && <>🔴</>) || (
                <Popover
                  content={
                    <div style={{ overflowY: 'scroll', height: '400px' }}>
                      <JsonFormatter
                        json={redisStats}
                        tabWith={4}
                        jsonStyle={jsonStyle}
                      />
                    </div>
                  }
                >
                  🟢
                </Popover>
              )}
            </>
          )) || <Spin size="small" />}
        </Descriptions.Item>
        <Descriptions.Item label="Prometheus" span={24}>
          {(prometheusStats && (
            <>
              {(prometheusStats === 'error' && <>🔴</>) || (
                <Popover
                  content={
                    <div style={{ overflowY: 'scroll', height: '400px' }}>
                      <JsonFormatter
                        json={prometheusStats}
                        tabWith={4}
                        jsonStyle={jsonStyle}
                      />
                    </div>
                  }
                >
                  🟢
                </Popover>
              )}
            </>
          )) || <Spin size="small" />}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Client Information">
        <Descriptions.Item label="Version">{version}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Server Information">
        <Descriptions.Item label="Version">
          {currentUser?.settings?.server.version}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Ansible">
        {currentUser?.settings?.server.ansibleVersion
          ?.split('\n')
          .map((e: any) => (
            <Descriptions.Item contentStyle={{ fontSize: '12px' }} key={e}>
              {e}
            </Descriptions.Item>
          ))}
      </Descriptions>
      <Descriptions title="Ansible Runner">
        <Descriptions.Item label={'Version'}>
          {currentUser?.settings?.server.ansibleRunnerVersion}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Server Deps">
        {Object.keys(currentUser?.settings?.server.deps).map((e) => (
          <Descriptions.Item key={e} label={e}>
            {currentUser?.settings?.server.deps[e]}
          </Descriptions.Item>
        ))}
      </Descriptions>
      <Descriptions title="Server Processes">
        {Object.keys(currentUser?.settings?.server.processes).map((e) => (
          <Descriptions.Item key={e} label={e}>
            {currentUser?.settings?.server.processes[e]}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Flex>
  );
};

export default Information;
