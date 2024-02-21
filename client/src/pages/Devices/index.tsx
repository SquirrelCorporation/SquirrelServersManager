import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceStatus/DeviceStatusTag';
import { OsLogo } from '@/components/OsLogo/OsLogo';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import TerminalModal from '@/components/TerminalModal';
import { getDevices } from '@/services/rest/device';
import { useClientLoaderData } from '@@/exports';
import { AppstoreOutlined, ControlOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Carousel,
  Col,
  List,
  message,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React, { memo, useEffect, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import styles from './Devices.less';

const { Text } = Typography;

export type StateType = {
  visible?: boolean;
  done?: boolean;
  current?: API.DeviceItem;
};

export async function clientLoader() {
  return await getDevices();
}

const Index = memo(() => {
  const [deviceList, setDeviceList] = React.useState<API.DeviceList>({});
  const [loading, setLoading] = React.useState(false);
  const { data } = useClientLoaderData();
  const [terminal, setTerminal] = useState<{
    isOpen: boolean;
    command: string | undefined;
    target?: API.DeviceItem[];
  }>({
    isOpen: false,
    command: undefined,
    target: undefined,
  });
  const openOrCloseTerminalModal = (open: boolean) => {
    setTerminal({ ...terminal, isOpen: open });
  };

  useEffect(() => {
    setDeviceList(data);
  }, []);
  /*
  const showModal = () => {
    setState({
      visible: true,
      current: undefined,
    });
  };
*/

  const onDropDownClicked = (key: string) => {
    switch (
      key
      //TODO
    ) {
    }
  };

  const ListContent: React.FC<API.DeviceItem> = (props: API.DeviceItem) => (
    <div className={styles.listContent} key={props.uuid}>
      <div className={styles.listContentItem}>
        <span>
          <DeviceStatusTag status={props.status} />
        </span>
        <p>{props.hostname}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>Updated At</span>
        <p>{moment(props.updatedAt).format('YYYY-MM-DD, HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <Carousel
          style={{ width: 300, height: 70, zIndex: 1000 }}
          dotPosition={'right'}
        >
          <div style={{ width: 300, height: 70, zIndex: 1000 }}>
            <div
              style={{
                width: 300,
                height: 70,
                zIndex: 1000,
                paddingTop: '15px',
              }}
            >
              <Row style={{ alignItems: 'center' }} justify="center">
                <Col span={6}>
                  <TinyRingProgressDeviceGraph
                    type={DeviceStatType.CPU}
                    deviceUuid={props.uuid}
                  />
                </Col>
                <Col span={6}>
                  <TinyRingProgressDeviceGraph
                    type={DeviceStatType.MEM_USED}
                    deviceUuid={props.uuid}
                  />
                </Col>
                <Col span={6}>
                  <TinyRingProgressDeviceIndicator deviceUuid={props.uuid} />
                </Col>
              </Row>
            </div>
          </div>
          <div style={{ width: 300, height: 70, zIndex: 1000 }}>
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <Row style={{ alignItems: 'center' }} justify="center">
                <Col span={24}>
                  <TinyLineDeviceGraph
                    type={DeviceStatType.CPU}
                    deviceUuid={props.uuid}
                    from={24}
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  span={24}
                  style={{ marginTop: '-5px', textAlign: 'center' }}
                >
                  <Text type="secondary" style={{ fontSize: '8px' }}>
                    CPU
                  </Text>
                </Col>
              </Row>
            </div>
          </div>
          <div style={{ width: 300, height: 70, zIndex: 1000 }}>
            <div style={{ width: 300, height: 70, zIndex: 1000 }}>
              <Row style={{ alignItems: 'center' }} justify="center">
                <Col span={24}>
                  <TinyLineDeviceGraph
                    type={DeviceStatType.MEM_USED}
                    deviceUuid={props.uuid}
                    from={24}
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  span={24}
                  style={{ marginTop: '-5px', textAlign: 'center' }}
                >
                  <Text type="secondary" style={{ fontSize: '8px' }}>
                    MEM USED
                  </Text>
                </Col>
              </Row>{' '}
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
  const CarbonBatchJob = (props: any) => (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M32 26v-2h-2.101a4.968 4.968 0 0 0-.732-1.753l1.49-1.49l-1.414-1.414l-1.49 1.49A4.964 4.964 0 0 0 26 20.101V18h-2v2.101a4.968 4.968 0 0 0-1.753.732l-1.49-1.49l-1.414 1.414l1.49 1.49A4.964 4.964 0 0 0 20.101 24H18v2h2.101c.13.637.384 1.229.732 1.753l-1.49 1.49l1.414 1.414l1.49-1.49a4.964 4.964 0 0 0 1.753.732V32h2v-2.101a4.968 4.968 0 0 0 1.753-.732l1.49 1.49l1.414-1.414l-1.49-1.49A4.964 4.964 0 0 0 29.899 26zm-7 2c-1.654 0-3-1.346-3-3s1.346-3 3-3s3 1.346 3 3s-1.346 3-3 3m-5-11h-8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2m-8-2h8V4h-8z"
      />
      <path fill="currentColor" d="M17 21H8a2 2 0 0 1-2-2V7h2v12h9z" />
      <path fill="currentColor" d="M13 25H4c-1.103 0-2-.897-2-2V11h2v12h9z" />
    </svg>
  );
  return (
    <TerminalContextProvider>
      <PageContainer>
        <div className={styles.standardList}>
          <Card
            title={'List of your devices'}
            className={styles.listCard}
            bordered={false}
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
            extra={
              <a href="#">
                <QuickActionDropDown
                  onDropDownClicked={onDropDownClicked}
                  setTerminal={setTerminal}
                >
                  <Button icon={<CarbonBatchJob />}>Apply to all</Button>
                </QuickActionDropDown>
              </a>
            }
          >
            <List
              size="large"
              rowKey="uuid"
              loading={loading}
              pagination={{
                pageSize: 10,
                showQuickJumper: true,
              }}
              dataSource={deviceList?.data}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      key={`showEditModal-${item.uuid}`}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Tooltip title="Services">
                        <AppstoreOutlined />
                      </Tooltip>
                    </a>,
                    <a
                      key={`devicesettings-${item.uuid}`}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Tooltip title="Device Settings">
                        <ControlOutlined />
                      </Tooltip>
                    </a>,
                    <a key={`quickAction-${item.uuid}`} onClick={() => {}}>
                      <QuickActionDropDown
                        onDropDownClicked={onDropDownClicked}
                        setTerminal={setTerminal}
                        target={[item]}
                      />
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={OsLogo(item.osLogoFile)} size="large" />
                    }
                    title={<a href={item.hostname}>{item.hostname}</a>}
                    description={item.ip}
                  />
                  <ListContent
                    uuid={item.uuid}
                    createdAt={item.createdAt}
                    status={item.status}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
        <TerminalModal
          terminalProps={{ ...terminal, setIsOpen: openOrCloseTerminalModal }}
        />
      </PageContainer>
    </TerminalContextProvider>
  );
});

export default Index;
