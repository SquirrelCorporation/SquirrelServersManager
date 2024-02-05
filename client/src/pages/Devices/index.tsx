import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import TinyLineDeviceGraph from '@/components/Charts/TinyLineDeviceGraph';
import TinyRingProgressDeviceIndicator from '@/components/Charts/TinyRingProgressDeviceIndicator';
import DeviceStatusTag from '@/components/DeviceStatus/DeviceStatusTag';
import QuickActionDropDown from '@/components/QuickAction/QuickActionDropDown';
import { OsLogo } from '@/components/misc/OsLogo';
import TerminalModal from '@/components/TerminalModal';
import { getDevices } from '@/services/rest/device';
import { AppstoreOutlined, ControlOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Card,
  List,
  Tooltip,
  message,
  Col,
  Row,
  Carousel,
  Typography,
  Button,
} from 'antd';
import moment from 'moment';
import React, { memo, useEffect, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';
import styles from './Devices.less';
import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';

const { Text } = Typography;

export type StateType = {
  visible?: boolean;
  done?: boolean;
  current?: API.DeviceItem;
};

const Index = memo(() => {
  const [deviceList, setDeviceList] = React.useState<API.DeviceList>({});
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

  const asyncFetch = async () => {
    await getDevices()
      .then((list) => {
        setDeviceList(list);
      })
      .catch((error) => {
        message.error(error);
      });
  };
  useEffect(() => {
    asyncFetch();
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
                  <Button> Apply</Button>
                </QuickActionDropDown>
              </a>
            }
          >
            <List
              size="large"
              rowKey="uuid"
              loading={false}
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
