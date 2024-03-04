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

  const WhhCpu = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 960 960"
      {...props}
    >
      <path
        fill="currentColor"
        d="M928 640h-96v-64h96q13 0 22.5 9.5T960 608t-9.5 22.5T928 640zm0-128h-96v-64h96q13 0 22.5 9.5T960 480t-9.5 22.5T928 512zm0-128h-96v-64h96q13 0 22.5 9.5T960 352t-9.5 22.5T928 384zm0-128h-96v-64h96q13 0 22.5 9.5T960 224t-9.5 22.5T928 256zM736 960q-13 0-22.5-9.5T704 928v-96h64v96q0 13-9.5 22.5T736 960zm-32-192H256q-26 0-45-19t-19-45V256q0-26 19-45t45-19h448q27 0 45.5 18.5T768 256v448q0 27-18.5 45.5T704 768zm0-736q0-13 9.5-22.5T736 0t22.5 9.5T768 32v96h-64V32zm-128 0q0-13 9.5-22.5T608 0t22.5 9.5T640 32v96h-64V32zm-128 0q0-13 9.5-22.5T480 0t22.5 9.5T512 32v96h-64V32zm-128 0q0-13 9.5-22.5T352 0t22.5 9.5T384 32v96h-64V32zm-128 0q0-13 9.5-22.5T224 0t22.5 9.5T256 32v96h-64V32zM0 736q0-13 9.5-22.5T32 704h96v64H32q-13 0-22.5-9.5T0 736zm0-128q0-13 9.5-22.5T32 576h96v64H32q-13 0-22.5-9.5T0 608zm0-128q0-13 9.5-22.5T32 448h96v64H32q-13 0-22.5-9.5T0 480zm0-128q0-13 9.5-22.5T32 320h96v64H32q-13 0-22.5-9.5T0 352zm0-128q0-13 9.5-22.5T32 192h96v64H32q-13 0-22.5-9.5T0 224zm256 704q0 13-9.5 22.5T224 960t-22.5-9.5T192 928v-96h64v96zm128 0q0 13-9.5 22.5T352 960t-22.5-9.5T320 928v-96h64v96zm128 0q0 13-9.5 22.5T480 960t-22.5-9.5T448 928v-96h64v96zm128 0q0 13-9.5 22.5T608 960t-22.5-9.5T576 928v-96h64v96zm320-192q0 13-9.5 22.5T928 768h-96v-64h96q13 0 22.5 9.5T960 736z"
      />
    </svg>
  );
  const WhhRam = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 960 1024"
      {...props}
    >
      <path
        fill="currentColor"
        d="M832 768H128q-53 0-90.5-37.5T0 640V384q0-53 37.5-90.5T128 256h704q53 0 90.5 37.5T960 384v256q0 53-37.5 90.5T832 768zM256 416q0-13-9.5-22.5T224 384H96q-13 0-22.5 9.5T64 416v192q0 13 9.5 22.5T96 640t22.5-9.5T128 608v-32h64v32q0 13 9.5 22.5T224 640t22.5-9.5T256 608v-32h-32q-13 0-22.5-9.5T192 544t9.5-22.5T224 512h32v-96zm256 0q0-13-9.5-22.5T480 384H352q-13 0-22.5 9.5T320 416v192q0 13 9.5 22.5T352 640t22.5-9.5T384 608v-32h64v32q0 13 9.5 22.5T480 640t22.5-9.5T512 608V416zm384 0q0-13-9.5-22.5T864 384H608q-13 0-22.5 9.5T576 416v192q0 13 9.5 22.5T608 640t22.5-9.5T640 608V448h64v160q0 13 9.5 22.5T736 640t22.5-9.5T768 608V448h64v160q0 13 9.5 22.5T864 640t22.5-9.5T896 608V416zm-512 32h64v64h-64v-64zm-256 0h64v64h-64v-64zM768 32q0-13 9.5-22.5T800 0t22.5 9.5T832 32v160h-64V32zm-128 0q0-13 9.5-22.5T672 0t22.5 9.5T704 32v160h-64V32zm-128 0q0-13 9.5-22.5T544 0t22.5 9.5T576 32v160h-64V32zm-128 0q0-13 9.5-22.5T416 0t22.5 9.5T448 32v160h-64V32zm-128 0q0-13 9.5-22.5T288 0t22.5 9.5T320 32v160h-64V32zm-128 0q0-13 9.5-22.5T160 0t22.5 9.5T192 32v160h-64V32zm64 960q0 13-9.5 22.5T160 1024t-22.5-9.5T128 992V832h64v160zm128 0q0 13-9.5 22.5T288 1024t-22.5-9.5T256 992V832h64v160zm128 0q0 13-9.5 22.5T416 1024t-22.5-9.5T384 992V832h64v160zm128 0q0 13-9.5 22.5T544 1024t-22.5-9.5T512 992V832h64v160zm128 0q0 13-9.5 22.5T672 1024t-22.5-9.5T640 992V832h64v160zm128 0q0 13-9.5 22.5T800 1024t-22.5-9.5T768 992V832h64v160z"
      />
    </svg>
  );
  const ListContent: React.FC<API.DeviceItem> = (props: API.DeviceItem) => (
    <div className={styles.listContent} key={props.uuid}>
      <div className={styles.listContentItem}>
        <span>
          <DeviceStatusTag status={props.status} />
        </span>
        <p>{props.hostname}</p>
      </div>
      <div className={styles.listContentItem} style={{ maxWidth: '80px' }}>
        <p style={{ minWidth: '80px' }}>
          <WhhCpu /> {props.cpuSpeed?.toFixed(1)} Ghz
        </p>
        <p style={{ minWidth: '80px' }}>
          <WhhRam /> {props.mem ? (props.mem / 1024).toFixed(0) : 'NaN'} Gb
        </p>
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
                    cpuSpeed={item.cpuSpeed}
                    mem={item.mem}
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
